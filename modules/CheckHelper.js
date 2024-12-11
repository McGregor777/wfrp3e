import DicePool from "./DicePool.js";
import CheckBuilder from "./applications/CheckBuilder.js";
import TalentSelectorV2 from "./applications/TalentSelectorV2.js";
import {capitalize, sortTalentsByType} from "./helpers.js";

/**
 * The CheckHelper provides methods to prepare checks.
 */
export default class CheckHelper
{
	/**
	 * Prepares a Characteristic check then opens the Dice Pool Builder afterwards.
	 * @param {WFRP3eActor}	actor The WFRP3eActor performing the check.
	 * @param {Object} characteristic The Characteristic used for the check.
	 * @param {Object} [options]
	 * @param {String} [options.flavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {String} [options.sound] Some sound to play after the Skill check completion.
	 * @returns {Promise<void>} The DicePool for a characteristic check.
	 */
	static async prepareCharacteristicCheck(actor, characteristic, {flavor = null, sound = null} = {})
	{
		const stance = actor.system.stance.current,
			  checkData = {
				  actor: actor.uuid,
				  characteristic,
				  stance,
				  targets: [...game.user.targets].map(target => target.document.actor.uuid)
			  },
			  startingPool = {
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  expertise: 0,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0,
					  challenge: 0,
					  misfortune: 0
				  }
			  };

		await this.triggerCheckEffects(actor, checkData, startingPool);

		await new CheckBuilder(
			new DicePool(startingPool, {checkData, flavor, sound})
		).render(true);
	}

	/**
	 * Prepares a Skill check then opens the Dice Pool Builder afterwards.
	 * @param {WFRP3eActor}	actor The WFRP3eActor performing the check.
	 * @param {WFRP3eItem} skill The Skill used for the check.
	 * @param {Object} [options]
	 * @param {String} [options.flavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {String} [options.sound] Some sound to play after the Skill check completion.
	 * @returns {Promise<void>} The DicePool for an skill check.
	 */
	static async prepareSkillCheck(actor, skill, {flavor = null, sound = null} = {})
	{
		const characteristic = actor.system.characteristics[skill.system.characteristic],
			  stance = actor.system.stance.current,
			  checkData = {
				  actor: actor.uuid,
				  characteristic: {name: skill.system.characteristic, ...characteristic},
				  skill,
				  stance,
				  targets: [...game.user.targets].map(target => target.document.actor.uuid)
			  },
			  startingPool = {
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  expertise: skill.system.trainingLevel,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0,
					  challenge: 0,
					  misfortune: 0
				  }
			  };

		await this.triggerCheckEffects(actor, checkData, startingPool);

		await new CheckBuilder(
			new DicePool(startingPool, {checkData, flavor, sound})
		).render(true);
	}

	/**
	 * Prepares an Action check then opens the Dice Pool Builder afterwards.
	 * @param {WFRP3eActor} actor The WFRP3eActor using the Action.
	 * @param {WFRP3eItem} action The Action that is used.
	 * @param {string} face The Action face.
	 * @param {Object} [options]
	 * @param {WFRP3eItem} [options.weapon] The weapon used alongside the Action.
	 * @param {String} [options.flavor] Some flavor text to add to the Action check's outcome description.
	 * @param {String} [options.sound] Some sound to play after the Action check completion.
	 * @returns {Promise<void>} The DicePool for an action check.
	 */
	static async prepareActionCheck(actor, action, face, {weapon = null, flavor = null, sound = null} = {})
	{
		const match = action.system[face].check.match(new RegExp(
			"(([\\p{L}\\s]+) \\((\\p{L}+)\\))( " +
			game.i18n.localize("ACTION.CHECK.against") +
			"\\.? ([\\p{L}\\s]+))?", "u")
		);
		let skill = null,
			characteristicName = skill?.system.characteristic ?? "Strength";

		if(match) {
			skill = actor.itemTypes.skill.find((skill) => skill.name === match[2]) ?? skill;
			// Either get the Characteristic specified on the Action's check, or use the Characteristic used by the Skill.
			characteristicName = Object.entries(CONFIG.WFRP3e.characteristics).find((characteristic) => {
				return game.i18n.localize(characteristic[1].abbreviation) === match[3];
			})[0] ?? characteristicName;
		}

		const characteristic = actor.system.characteristics[characteristicName],
			  stance = actor.system.stance.current,
			  checkData = {
				  action: action.uuid,
				  actor: actor.uuid,
				  characteristic: {name: characteristicName, ...characteristic},
				  face,
				  skill,
				  stance,
				  targets: [...game.user.targets].map(target => target.document.actor.uuid)
			  },
			  startingPool = {
				  dice: {
					  characteristic: characteristic?.rating - Math.abs(stance) ?? 0,
					  fortune: characteristic?.fortune ?? 0,
					  expertise: skill?.system.trainingLevel ?? 0,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0,
					  challenge: action.system[face].difficultyModifiers.challengeDice +
						  (["melee", "ranged"].includes(action.system.type)
							  ? CONFIG.WFRP3e.challengeLevels.easy.challengeDice
							  : 0),
					  misfortune: action.system[face].difficultyModifiers.misfortuneDice +
						  ((match ? match[5] === game.i18n.localize("ACTION.CHECK.targetDefence") : false)
							  ? checkData.targets.length > 0
								  ? await fromUuid(checkData.targets[0]).then(actor => actor.system.totalDefence)
								  : 0
							  : 0)
				  }
			  }

		if(weapon)
			checkData.weapon = weapon;

		await this.triggerCheckEffects(actor, checkData, startingPool);

		await new CheckBuilder(
			new DicePool(startingPool, {checkData, flavor, sound})
		).render(true);
	}

	/**
	 * Prepares an initiative check.
	 * @param {WFRP3eActor} actor The Character making the initiative check.
	 * @param {WFRP3eCombat} combat The Combat document associated with the initiative check.
	 * @param {Object} [options]
	 * @param {String} [options.flavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {String} [options.sound] Some sound to play after the Skill check completion.
	 * @returns {DicePool} The DicePool for an initiative check.
	 */
	static async prepareInitiativeCheck(actor, combat, {flavor = null, sound = null} = {})
	{
		const characteristic = actor.system.characteristics[combat.initiativeCharacteristic],
			  stance = actor.system.stance.current ?? actor.system.stance,
			  checkData = {
				  actor: actor.uuid,
				  characteristic,
				  combat,
				  stance
			  },
			  startingPool = {
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  expertise: 0,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0,
					  challenge: 0,
					  misfortune: 0
				  }
			  }

		await this.triggerCheckEffects(actor, checkData, startingPool);

		return new DicePool(startingPool, {checkData, flavor, sound});
	}

	/**
	 * Searches and triggers every relevant effects owned either by the Actor performing the check, or its target.
	 * @param {WFRP3eActor} actor The WFRP3eActor performing the check.
	 * @param {Object} checkData The check data.
	 * @param {Object} startingPool The starting dice pool.
	 * @returns {Promise<void>}
	 */
	static async triggerCheckEffects(actor, checkData, startingPool)
	{
		const triggeredItems = actor.findTriggeredItems("onCheckPrepraration");
		for(const item of triggeredItems) {
			try {
				const fn = new foundry.utils.AsyncFunction(
					"actor",
					"checkData",
					"startingPool",
					item.system.effect.script
				);
				await fn.call(item, actor, checkData, startingPool);
			}
			catch(error) {
				console.error(error);
			}
		}

		if(checkData.targets.length > 0) {
			const targetTriggeredItems = await fromUuid(checkData.targets[0]).then(
				actor => actor.findTriggeredItems("onTargettingCheckPreparation")
			);

			for(const item of targetTriggeredItems) {
				try {
					const fn = new foundry.utils.AsyncFunction(
						"actor",
						"checkData",
						"startingPool",
						item.system.effect.script
					);
					await fn.call(item, actor, checkData, startingPool);
				}
				catch(error) {
					console.error(error);
				}
			}
		}
	}

	/**
	 * Uses a Talent on a Roll.
	 * @param {String} chatMessageId The id of the ChatMessage containing the Roll.
	 */
	static async useTalent(chatMessageId)
	{
		const chatMessage = game.messages.get(chatMessageId),
			  roll = chatMessage.rolls[0],
			  checkData = roll.options.checkData,
			  actor = await fromUuid(checkData.actor);
		let triggeredTalents = actor.findTriggeredItems("onCheckTrigger");

		if(triggeredTalents.length > 0) {
			let selectedTalent = await TalentSelectorV2.wait({talents: sortTalentsByType(triggeredTalents)});

			if(selectedTalent) {
				selectedTalent = await fromUuid(selectedTalent);

				try {
					const fn = new foundry.utils.AsyncFunction(
						"actor",
						"chatMessage",
						"checkData",
						"roll",
						selectedTalent.system.effect.script
					);
					await fn.call(selectedTalent, actor, chatMessage, checkData, roll);
				}
				catch(error) {
					console.error(error);
				}
			}
		}
		else
			ui.notifications.warn(game.i18n.localize("ROLL.WARNINGS.noTalentToUse"));
	}

	/**
	 * Determines if an Action requires no check.
	 * @param {string} check
	 * @returns {boolean}
	 */
	static doesRequireNoCheck(check)
	{
		return [game.i18n.localize("ACTION.CHECK.noCheckRequired"),
			game.i18n.localize("ACTION.CHECK.generallyNoCheckRequired")].includes(check);
	}

	/**
	 * Get the universal boon effect.
	 * @param {boolean} isMental Whether the check is based upon a mental characteristic.
	 * @returns {{symbolAmount: Number, description: String}}
	 */
	static getUniversalBoonEffect(isMental)
	{
		return isMental ? {
			description: game.i18n.format("ROLL.EFFECTS.recoverStress", {amount: 1}),
			script: "outcome.stress -= 2;",
			symbolAmount: 2
		} : {
			description: game.i18n.format("ROLL.EFFECTS.recoverFatigue", {amount: 1}),
			script: "outcome.fatigue -= 2;",
			symbolAmount: 2
		};
	}

	/**
	 * Get the universal bane effect.
	 * @param {boolean} isMental Whether the check is based upon a mental characteristic.
	 * @returns {{symbolAmount: Number, description: String}}
	 */
	static getUniversalBaneEffect(isMental)
	{
		return isMental ? {
			description: game.i18n.format("ROLL.EFFECTS.sufferStress", {amount: 1}),
			script: "outcome.stress++;",
			symbolAmount: 2
		} : {
			description: game.i18n.format("ROLL.EFFECTS.sufferFatigue", {amount: 1}),
			script: "outcome.fatigue++;",
			symbolAmount: 2
		};
	}

	/**
	 * Get the weapon's Critical Rating effect.
	 * @param {WFRP3eItem} weapon
	 * @returns {{symbolAmount: Number, description: String}}
	 */
	static getCriticalRatingEffect(weapon)
	{
		return {
			description: game.i18n.format("ROLL.EFFECTS.critical", {amount: 1}),
			script: "outcome.targetCriticalWounds++;",
			symbolAmount: weapon.system.criticalRating
		};
	}

	/**
	 * Get the universal Sigmar's comet effect.
	 * @returns {{symbolAmount: Number, description: String}}
	 */
	static getUniversalSigmarsCometEffect()
	{
		return {
			description: game.i18n.format("ROLL.EFFECTS.critical", {amount: 1}),
			script: "outcome.targetCriticalWounds++;",
			symbolAmount: 1
		};
	}

	/**
	 * Toggles an Action Effect from a Roll, depending on the symbols remaining, and execute scripts if necessary.
	 * @param {String} chatMessageId The id of the ChatMessage containing the Roll.
	 * @param {String} symbol The symbol of the effect to toggle.
	 * @param {Number} index The index of the effect to toggle.
	 */
	static async toggleActionEffect(chatMessageId, symbol, index)
	{
		const chatMessage = game.messages.get(chatMessageId);

		if(!chatMessage.isOwner) {
			ui.notifications.warn(game.i18n.localize("ROLL.WARNINGS.notAllowed"));
			return;
		}

		const changes = {rolls: chatMessage.rolls},
			  roll = changes.rolls[0],
			  toggledEffect = roll.effects[symbol][index];

		if(toggledEffect.active === true)
			await CheckHelper._toggleOffActionEffect(toggledEffect, roll, symbol);
		else {
			try {
				const functionName = `toggleOn${capitalize(symbol)}Effect`;

				await CheckHelper[`${functionName}`]
					? CheckHelper[`${functionName}`](toggledEffect, roll, symbol)
					: CheckHelper._toggleOnActionEffect(toggledEffect, roll, symbol);
			}
			catch(error) {
				console.error(`Something went wrong when toggling the Action effect: ${error}`);
			}
		}

		chatMessage.update(changes);
	}

	/**
	 * Toggles an Action Effect off, and execute its revert script if it was an immediate Action Effect.
	 * @param toggledEffect
	 * @param roll
	 */
	static async _toggleOffActionEffect(toggledEffect, roll)
	{
		if(toggledEffect.immediate)
			await CheckHelper.executeActionEffectScript(toggledEffect, toggledEffect.reverseScript, roll);

		toggledEffect.active = false;
	}

	/**
	 * Checks if an Action Effect can be toggled on, then toggles it if it does.
	 * @param toggledEffect
	 * @param roll
	 * @param symbol
	 */
	static async _toggleOnActionEffect(toggledEffect, roll, symbol)
	{
		let result = "";

		try {
			const functionName = `check${capitalize(symbol)}EffectToggleable`;

			result = CheckHelper[`${functionName}`]
				? CheckHelper[`${functionName}`](toggledEffect, roll, symbol)
				: CheckHelper.checkEffectToggleable(toggledEffect, roll, symbol);
		}
		catch(error) {
			console.error(`Something went wrong when toggling the Action effect: ${error}`);
		}

		if(result === "") {
			toggledEffect.active = true;

			if(toggledEffect.immediate)
				await CheckHelper.executeActionEffectScript(toggledEffect, toggledEffect.script, roll);
		}
		else
			ui.notifications.warn(result);
	}

	/**
	 * Checks if a success Action Effect can be toggled on, then toggles it if it does.
	 * @param toggledEffect
	 * @param roll
	 * @param symbol
	 */
	static async toggleOnSuccessActionEffect(toggledEffect, roll, symbol = "success")
	{
		let result = CheckHelper.checkSuccessEffectToggleable(toggledEffect, symbol, roll);

		if(result === "") {
			roll.effects.success.forEach(effect => effect.active = false);
			toggledEffect.active = true;

			if(toggledEffect.immediate)
				await CheckHelper.executeActionEffectScript(toggledEffect, toggledEffect.script, roll);
		}
		else
			ui.notifications.warn(result);
	}

	/**
	 * Checks if an Action Effect can be toggled.
	 * @param {ActionEffect} toggledEffect
	 * @param {WFRP3eRoll} roll
	 * @param {string} symbol
	 * @returns {string} Either returns an empty string if the effect is toggleable, or the reason if not.
	 */
	static checkEffectToggleable(toggledEffect, roll, symbol)
	{
		const plural = CONFIG.WFRP3e.symbols[symbol].plural;

		if(roll.remainingSymbols[plural] >= toggledEffect.symbolAmount)
			return "";

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
		});
	}

	/**
	 * Checks if a boon Action Effect can be toggled, taking remaining Sigmar's comet symbols into account.
	 * @param {ActionEffect} toggledEffect
	 * @param {WFRP3eRoll} roll
	 * @param {string} symbol
	 * @returns {string} Either returns an empty string if the effect is toggleable, or the reason if not.
	 */
	static checkBoonEffectToggleable(toggledEffect, roll, symbol = "boon")
	{
		const plural = CONFIG.WFRP3e.symbols[symbol].plural;

		if(roll.remainingSymbols[plural] + roll.remainingSymbols.sigmarsComets >= toggledEffect.symbolAmount)
			return "";

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
		});
	}

	/**
	 * Checks if a delay Action Effect can be toggled, taking remaining bane symbols into account.
	 * @param {ActionEffect} toggledEffect
	 * @param {WFRP3eRoll} roll
	 * @param {string} symbol
	 * @returns {string} Either returns an empty string if the effect is toggleable, or the reason if not.
	 */
	static checkDelayEffectToggleable(toggledEffect, roll, symbol = "delay")
	{
		const plural = CONFIG.WFRP3e.symbols[symbol].plural;

		if(roll.remainingSymbols[plural] > 0) {
			if(toggledEffect.symbolAmount > 1) {
				if(roll.remainingSymbols.banes >= toggledEffect.symbolAmount - 1)
					return "";
				else
					return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
						symbol: game.i18n.localize(CONFIG.WFRP3e.symbols.bane.name)
					});
			}
			else
				return "";
		}

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
		});
	}

	/**
	 * Checks if an exertion Action Effect can be toggled, taking remaining bane symbols into account.
	 * @param {ActionEffect} toggledEffect
	 * @param {WFRP3eRoll} roll
	 * @param {string} symbol
	 * @returns {string} Either returns an empty string if the effect is toggleable, or the reason if not.
	 */
	static checkExertionEffectToggleable(toggledEffect, roll, symbol = "exertion")
	{
		const plural = CONFIG.WFRP3e.symbols[symbol].plural;

		if(roll.remainingSymbols[plural] > 0) {
			if(toggledEffect.symbolAmount > 1) {
				if(roll.remainingSymbols.banes >= toggledEffect.symbolAmount - 1)
					return "";
				else
					return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
						symbol: game.i18n.localize(CONFIG.WFRP3e.symbols.bane.name)
					});
			}
			else
				return "";
		}

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
		});
	}

	/**
	 * Checks if a success Action Effect can be toggled, taking remaining Sigmar's comet symbols into account.
	 * @param {ActionEffect} toggledEffect
	 * @param {WFRP3eRoll} roll
	 * @param {string} symbol
	 * @returns {string} Either returns an empty string if the effect is toggleable, or the reason if not.
	 */
	static checkSuccessEffectToggleable(toggledEffect, roll, symbol = "symbol")
	{
		const plural = CONFIG.WFRP3e.symbols[symbol].plural;

		if(roll.totalSymbols[plural] + roll.remainingSymbols.sigmarsComets >= toggledEffect.symbolAmount)
			return "";

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
		});
	}

	/**
	 *
	 * @param {ActionEffect} effect
	 * @param {string} script
	 * @param {WFRP3eRoll} roll
	 * @param [options]
	 * @param {CheckData} [options.checkData]
	 * @param {WFRP3eActor} [options.actor]
	 * @param {CheckOutcome} [options.outcome]
	 * @param {WFRP3eActor} [options.targetActor]
	 * @returns {Promise<void>}
	 */
	static async executeActionEffectScript(effect, script, roll, options = {})
	{
		const checkData = options.checkData ?? roll.options.checkData,
			  actor = options.actor ?? await fromUuid(checkData.actor),
			  targetActor = options.targetActor
			  	  ?? checkData.targets?.length > 0 ? await fromUuid(checkData.targets[0]) : null;

		try {
			// eslint-disable-next-line no-new-func
			const fn = new foundry.utils.AsyncFunction(
				"roll",
				"checkData",
				"actor",
				"actorToken",
				"outcome",
				"targetActor",
				"targetToken",
				script
			);
			await fn.call(
				effect,
				roll,
				checkData,
				actor,
				actor.token,
				options.outcome,
				targetActor,
				targetActor ? targetActor?.token : null
			);
		}
		catch(error) {
			console.error(error);
		}
	}

	/**
	 * Triggers the toggled effects from a Roll.
	 * @param {String} chatMessageId The id of the ChatMessage containing the Roll.
	 * @returns {Promise<void>}
	 */
	static async triggerActionEffects(chatMessageId)
	{
		const chatMessage = game.messages.get(chatMessageId),
			  roll = chatMessage.rolls[0],
			  checkData = roll.options.checkData,
			  actor = await fromUuid(checkData.actor),
			  targetActor = checkData.targets?.length > 0 ? await fromUuid(checkData.targets[0]) : null,
			  toggledEffects = Object.values(structuredClone(roll.effects)).reduce((symbol, allEffects) => {
				  allEffects.push(...symbol.filter(effect => effect.active));
				  return allEffects;
			  }, []),
			  outcome = {
				  targetDamages: 0,
				  targetCriticalWounds: 0,
				  targetFatigue: 0,
				  targetStress: 0,
				  wounds: 0,
				  criticalWounds: 0,
				  fatigue: CONFIG.WFRP3e.characteristics[checkData.characteristic.name].type === "physical"
					  ? roll.remainingSymbols.exertions
					  : 0,
				  stress: CONFIG.WFRP3e.characteristics[checkData.characteristic.name].type === "mental"
					  ? roll.remainingSymbols.exertions
					  : 0,
				  favour: 0,
				  power: 0
			  },
			  actorUpdates = {system: {}},
			  targetUpdates = {system: {}},
			  chatMessageUpdates = {rolls: chatMessage.rolls};

		for(const effect of toggledEffects)
			await CheckHelper.executeActionEffectScript(effect, effect.script, roll, {checkData, actor, outcome, targetActor})

		if(targetActor) {
			// If the attack inflicts damages, reduce them by Toughness and Soak values.
			if(outcome.targetDamages > 0) {
				outcome.targetDamages -= targetActor.system.characteristics.toughness.rating + targetActor.system.totalSoak;

				// If the attack still inflicts more damages than the target's wound threshold, the target suffers from a critical wound
				// (in addition to those coming from effects).
				if(outcome.targetDamages > 0 && outcome.targetDamages > targetActor.system.wounds.value) {
					targetUpdates.system.wounds = {value: targetActor.system.wounds.value - outcome.targetDamages};

					outcome.targetCriticalWounds = await Item.createDocuments(
						await this.drawCriticalWoundsRandomly(outcome.targetCriticalWounds + 1),
						{parent: targetActor}
					);
				}
				else if(outcome.targetDamages > 0) {
					targetUpdates.system.wounds = {value: targetActor.system.wounds.value - outcome.targetDamages};

					if(outcome.targetCriticalWounds > 0) {
						outcome.targetCriticalWounds = await Item.createDocuments(
							await this.drawCriticalWoundsRandomly(outcome.targetCriticalWounds),
							{parent: targetActor}
						).then(documents => documents.map(document => document.uuid));
					}
				}
				// If the attack inflicts 0 damages in spite of hitting the target, the target still suffers one damage
				// (no critical wounds are inflicted though).
				else {
					outcome.targetDamages = 1
					targetUpdates.system.wounds = {value: targetActor.system.wounds.value - 1};
				}
			}

			if(outcome.targetFatigue > 0 || outcome.targetFatigue < 0) {
				if(targetActor.type === "creature" && !targetActor.system.nemesis)
					targetUpdates.system.impairments = {fatigue: targetActor.system.impairments.fatigue + outcome.targetFatigue};
				else if(targetActor.system.wounds.value)
					targetUpdates.system.wounds.value -= outcome.targetFatigue;
				else
					targetUpdates.system.wounds = {value: targetActor.system.wounds.value - outcome.targetFatigue};
			}

			if(outcome.targetStress > 0 || outcome.targetStress < 0) {
				if(targetActor.type === "creature" && !targetActor.system.nemesis)
					targetUpdates.system.impairments = {stress: targetActor.system.impairments.stress + outcome.targetStress};
				else if(targetActor.system.wounds.value)
					targetUpdates.system.wounds.value -= outcome.targetStress;
				else
					targetUpdates.system.wounds = {value: targetActor.system.wounds.value - outcome.targetStress};
			}

			targetActor.update(targetUpdates);
		}

		if(actor) {
			if(outcome.wounds > 0)
				actorUpdates.system.wounds = actor.system.wounds.value - outcome.wounds;

			if(outcome.criticalWounds > 0)
				outcome.criticalWounds = await Item.createDocuments(
					await this.drawCriticalWoundsRandomly(outcome.criticalWounds),
					{parent: actor}
				).then(documents => documents.map(document => document.uuid));

			if(outcome.fatigue > 0 || outcome.fatigue < 0)
				actorUpdates.system.impairments = {fatigue: actor.system.impairments.fatigue + outcome.fatigue};

			if(outcome.stress > 0 || outcome.stress < 0)
				actorUpdates.system.impairments = {stress: actor.system.impairments.stress + outcome.stress};

			if(outcome.favour > 0 || outcome.favour < 0)
				actorUpdates.system.favour = actor.system.favour + outcome.favour;

			if(outcome.power > 0 || outcome.power < 0)
				actorUpdates.system.power = actor.system.power + outcome.power;

			actor.update(actorUpdates);
		}

		chatMessageUpdates.rolls[0].options.checkData.outcome = outcome;
		chatMessage.update(chatMessageUpdates);

		if(roll.totalSymbols.successes && checkData?.action)
			await fromUuid(checkData.action).then(action => action.exhaustAction(checkData.face));
	}

	/**
	 * Draws one or several critical wounds randomly from the Critical Wounds RollTable.
	 * @param {Number} amount The amount of critical wounds to draw.
	 * @returns {Promise<*[]>} The critical wounds Items owned by the target Actor.
	 */
	static async drawCriticalWoundsRandomly(amount)
	{
		const allCriticalWounds = [];

		await game.packs.get("wfrp3e.roll-tables").getDocument("KpiwJKBdJ8qAyQjs").then(async table => {
			await table.drawMany(amount, {displayChat: false}).then(async rollTableDraw => {
				for(const result of rollTableDraw.results) {
					// Roll Twice and select the critical wound with the higher severity rating (if tied, GM chooses)
					if(result.id === "uZIgluknIsZ428Cn") {
						const criticalWounds = [];
						let highestCriticalWound = null;

						for(let i = 0; i < 2; i++) {
							let rollTableDraw = null,
								criticalWound = null

							while(!rollTableDraw || ["uZIgluknIsZ428Cn", "aJ0a8gzJbFSPS7xY"].includes(rollTableDraw.results[0].id))
								rollTableDraw = await table.draw({displayChat: false});

							criticalWound = await game.packs.get(rollTableDraw.results[0].documentCollection)
								.getDocument(rollTableDraw.results[0].documentId);
							criticalWounds.push(criticalWound);

							if(!highestCriticalWound || highestCriticalWound.system.severityRating < criticalWound.system.severityRating)
								highestCriticalWound = criticalWound;
						}

						if(criticalWounds[0].system.severityRating === criticalWounds[1].system.severityRating)
							await new Dialog({
								title: game.i18n.localize("APPLICATION.TITLE.ChooseACriticalWound"),
								content: `<p>${game.i18n.format("APPLICATION.DESCRIPTION.ChooseACriticalWound")}</p>`,
								buttons: {
									one: {
										label: criticalWounds[0].name,
										callback: async dlg => {
											allCriticalWounds.push(criticalWounds[0]);
										}
									},
									two: {
										label: criticalWounds[1].name,
										callback: async dlg => {
											allCriticalWounds.push(criticalWounds[1]);
										}
									},
								}
							}).render(true);
						else
							allCriticalWounds.push(highestCriticalWound);
					}
					// Roll Twice and apply both results! You poor sod...
					else if(result.id === "aJ0a8gzJbFSPS7xY") {
						for(let j = 0; j < 2; j++) {
							let rollTableDraw = null;

							while(!rollTableDraw || ["uZIgluknIsZ428Cn", "aJ0a8gzJbFSPS7xY"].includes(rollTableDraw.results[0].id))
								rollTableDraw = await table.draw({displayChat: false});

							allCriticalWounds.push(await game.packs.get(rollTableDraw.results[0].documentCollection)
								.getDocument(rollTableDraw.results[0].documentId));
						}
					}
					// Default.
					else
						allCriticalWounds.push(await game.packs.get(result.documentCollection)
							.getDocument(result.documentId));
				}
			});
		});

		return allCriticalWounds;
	}
}