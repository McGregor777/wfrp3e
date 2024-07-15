import DicePool from "./DicePool.js";
import DicePoolBuilder from "./applications/DicePoolBuilder.js";

/**
 * The CheckHelper provides methods to prepare checks.
 */
export default class CheckHelper
{
	/**
	 * Prepares a Characteristic check then opens the Dice Pool Builder afterwards.
	 * @param {WFRP3eActor}	actor The Character making the check.
	 * @param {Object} characteristic The Characteristic used for the check.
	 * @param {Object} [options]
	 * @param {String} [options.flavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {String} [options.sound] Some sound to play after the Skill check completion.
	 * @returns {Promise<void>} The DicePool for a characteristic check.
	 */
	static async prepareCharacteristicCheck(actor, characteristic, {flavor = null, sound = null} = {})
	{
		const stance = actor.system.stance.current ?? actor.system.stance;

		await new DicePoolBuilder(
			new DicePool({
				dice: {
					characteristic: characteristic.rating - Math.abs(stance),
					fortune: characteristic.fortune,
					conservative: stance < 0 ? Math.abs(stance) : 0,
					reckless: stance > 0 ? stance : 0
				}
			}, {
				checkData: {
					actor: {
						actorId: actor._id,
						sceneId: actor.token?.object.scene._id,
						tokenId: actor.token?._id
					},
					characteristic
				},
				flavor,
				sound
			})
		).render(true);
	}

	/**
	 * Prepares a Skill check then opens the Dice Pool Builder afterwards.
	 * @param {WFRP3eActor}	actor The Character making the check.
	 * @param {WFRP3eItem} skill The Skill used for the check.
	 * @param {Object} [options]
	 * @param {String} [options.flavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {String} [options.sound] Some sound to play after the Skill check completion.
	 * @returns {Promise<void>} The DicePool for an skill check.
	 */
	static async prepareSkillCheck(actor, skill, {flavor = null, sound = null} = {})
	{
		const characteristic = actor.system.characteristics[skill.system.characteristic];
		const stance = actor.system.stance.current;

		await new DicePoolBuilder(
			new DicePool({
				dice: {
					characteristic: characteristic.rating - Math.abs(stance),
					fortune: characteristic.fortune,
					expertise: skill.system.trainingLevel,
					conservative: stance < 0 ? Math.abs(stance) : 0,
					reckless: stance > 0 ? stance : 0
				}
			}, {
				checkData: {
					actor: {
						actorId: actor._id,
						sceneId: actor.token?.object.scene._id,
						tokenId: actor.token?._id
					},
					skill,
					characteristic: {name: skill.system.characteristic, ...characteristic}
				},
				flavor,
				sound
			})
		).render(true);
	}

	/**
	 * Prepares an Action check then opens the Dice Pool Builder afterwards.
	 * @param {WFRP3eActor} actor The Character using the Action.
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
			game.i18n.localize("ACTION.CHECK.Against") +
			"\\.? ([\\p{L}\\s]+))?", "u")
		);
		let skill = null;
		let characteristicName = skill?.system.characteristic ?? "Strength";

		if(match) {
			skill = actor.itemTypes.skill.find((skill) => skill.name === match[2]) ?? skill;
			// Either get the Characteristic specified on the Action's check, or use the Characteristic used by the Skill.
			characteristicName = Object.entries(CONFIG.WFRP3e.characteristics).find((characteristic) => {
				return game.i18n.localize(characteristic[1].abbreviation) === match[3];
			})[0] ?? characteristicName;
		}

		const characteristic = actor.system.characteristics[characteristicName];
		const checkData = {
			actor: {
				actorId: actor._id,
				sceneId: actor.token?.object.scene._id,
				tokenId: actor.token?._id
			},
			action,
			face,
			skill,
			characteristic: {name: characteristicName, ...characteristic},
			targets: [...game.user.targets].map(target => {
				return {
					sceneId: target.scene.id,
					tokenId: target.id
				}
			})
		};
		let stance = 0;

		if(actor.type === "character")
			stance = actor.system.stance.current;
		else if(actor.type === "creature")
			stance = actor.system.stance;

		if(weapon)
			checkData.weapon = weapon;

		await new DicePoolBuilder(
			new DicePool({
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
						((match ? match[5] === game.i18n.localize("ACTION.CHECK.TargetDefence") : false)
							? checkData.targets.length > 0
								? game.scenes.get(checkData.targets[0].sceneId)
									.collections.tokens.get(checkData.targets[0].tokenId).actor.system.totalDefence
								: 0
							: 0)
				}
			}, {
				checkData,
				flavor,
				sound
			})
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
	static prepareInitiativeCheck(actor, combat, {flavor = null, sound = null} = {})
	{
		const characteristic = actor.system.characteristics[combat.initiativeCharacteristic];
		const stance = actor.system.stance.current ?? actor.system.stance;

		return new DicePool({
			dice: {
				characteristic: characteristic.rating - Math.abs(stance),
				fortune: characteristic.fortune,
				conservative: stance < 0 ? Math.abs(stance) : 0,
				reckless: stance > 0 ? stance : 0
			}
		}, {
			checkData: {actor: actor, characteristic: characteristic, combat},
			flavor,
			sound
		});
	}

	/**
	 * Determines if an Action requires no check.
	 * @param {string} check
	 * @returns {boolean}
	 */
	static doesRequireNoCheck(check)
	{
		return [game.i18n.localize("ACTION.CHECK.NoCheckRequired"),
			game.i18n.localize("ACTION.CHECK.GenerallyNoCheckRequired")].includes(check);
	}

	/**
	 * Get the universal boon effect.
	 * @param {boolean} isMental Whether the check is based upon a mental characteristic.
	 * @returns {{symbolAmount: Number, description: String}}
	 */
	static getUniversalBoonEffect(isMental)
	{
		return isMental ? {
			symbolAmount: 2,
			description: game.i18n.format("ROLL.EFFECT.RecoverFatigue", {amount: 1})
		} : {
			symbolAmount: 2,
			description: game.i18n.format("ROLL.EFFECT.RecoverStress", {amount: 1})
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
			symbolAmount: 2,
			description: game.i18n.format("ROLL.EFFECT.SufferFatigue", {amount: 1})
			} : {
			symbolAmount: 2,
			description: game.i18n.format("ROLL.EFFECT.SufferStress", {amount: 1})
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
			symbolAmount: weapon.system.criticalRating,
			description: game.i18n.format("ROLL.EFFECT.Critical", {amount: 1})
		};
	}

	/**
	 * Get the universal Sigmar's comet effect.
	 * @returns {{symbolAmount: Number, description: String}}
	 */
	static getUniversalSigmarsCometEffect()
	{
		return {
			symbolAmount: 1,
			description: game.i18n.format("ROLL.EFFECT.Critical", {amount: 1})
		};
	}

	/**
	 * Toggles effects from a Roll, depending on the symbols remaining.
	 * @param {String} chatMessageId The id of the ChatMessage containing the Roll.
	 * @param {String} symbol The symbol of the effect to toggle.
	 * @param {Number} index The index of the effect to toggle.
	 */
	static toggleEffect(chatMessageId, symbol, index)
	{
		const chatMessage = game.messages.get(chatMessageId);

		if(!chatMessage.isOwner) {
			ui.notifications.warn(game.i18n.localize("ROLL.NotAllowedToTriggerEffect"));
			return;
		}

		const changes = {rolls: chatMessage.rolls};
		const roll = changes.rolls[0];
		const toggledEffect = roll.effects[symbol][index];
		const plural = CONFIG.WFRP3e.symbols[symbol].plural;

		// Toggled effect.
		if(toggledEffect.active === true)
			toggledEffect.active = false;
		// Delay/Exertion + Bane effects.
		else if(["delay", "exertion"].includes(symbol)) {
			if(roll.remainingSymbols[plural] > 0) {
				if(toggledEffect.symbolAmount > 1) {
					if(roll.remainingSymbols.banes >= toggledEffect.symbolAmount - 1)
						toggledEffect.active = true;
					else
						ui.notifications.warn(game.i18n.format("ROLL.NotEnoughSymbolToTriggerEffect", {
							symbol: game.i18n.localize(CONFIG.WFRP3e.symbols.bane.name)
						}));
				}
				else
					toggledEffect.active = true;
			}
			else
				ui.notifications.warn(game.i18n.format("ROLL.NotEnoughSymbolToTriggerEffect", {
					symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
				}));
		}
		// Sigmar's Comet as Success + Only one Success effect toggled at once.
		else if(symbol === "success"
			&& (roll.resultSymbols[plural] + roll.remainingSymbols.sigmarsComets >= toggledEffect.symbolAmount)) {
			roll.effects.success.forEach(effect => effect.active = false);
			toggledEffect.active = true;
		}
		// Sigmar's Comet as Boon.
		else if(symbol === "boon"
			&& (roll.remainingSymbols[plural] + roll.remainingSymbols.sigmarsComets >= toggledEffect.symbolAmount))
			toggledEffect.active = true;
		// Default.
		else if(roll.remainingSymbols[plural] >= toggledEffect.symbolAmount)
			toggledEffect.active = true;
		else
			ui.notifications.warn(game.i18n.format("ROLL.NotEnoughSymbolToTriggerEffect", {
				symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
			}));

		roll.remainingSymbols = {...roll.resultSymbols};

		// Recalculate remaining symbols for every type.
		Object.entries(roll.effects).forEach(effects => {
			const symbolName = effects[0];
			const plural = CONFIG.WFRP3e.symbols[symbolName].plural;

			roll.remainingSymbols[plural] = effects[1].filter(effect => effect.active)
				.reduce((remainingSymbols, effect) => {
					if(["delay", "exertion"].includes(symbolName)) {
						remainingSymbols--;

						if(effect.symbolAmount > 1)
							roll.remainingSymbols.banes -= effect.symbolAmount - 1;
					}
					else if(remainingSymbols < effect.symbolAmount) {
						if(["success", "boon"].includes(symbolName)
							&& (remainingSymbols + roll.remainingSymbols.sigmarsComets >= effect.symbolAmount)) {
							roll.remainingSymbols.sigmarsComets += remainingSymbols - effect.symbolAmount;
							return 0;
						}

						throw new Error(`The remaining number of ${symbolName} cannot be negative.`);
					}
					else
						remainingSymbols -= effect.symbolAmount;

					return remainingSymbols;
				}, roll.remainingSymbols[plural]);
		});

		chatMessage.update(changes);
	}

	/**
	 * Triggers the toggled effects from a Roll.
	 * @param {String} chatMessageId The id of the ChatMessage containing the Roll.
	 * @returns {Promise<void>}
	 */
	static async triggerEffects(chatMessageId)
	{
		const chatMessage = game.messages.get(chatMessageId),
		      roll = chatMessage.rolls[0],
		      checkData = roll.options.checkData,
		      actor = checkData.actor.actorId
				  ? game.actors.get(checkData.actor.actorId)
				  : game.scenes.get(checkData.actor.sceneId).collections.tokens.get(checkData.actor.tokenId).actor,
			  targetActor = checkData.targets.length > 0
				  ? game.scenes.get(checkData.targets[0].sceneId).collections.tokens.get(checkData.targets[0].tokenId).actor
				  : null,
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
				  fatigue:  CONFIG.WFRP3e.characteristics[checkData.characteristic.name].type === "physical"
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

		for(const effect of toggledEffects) {
			const effectDescription = TextEditor.decodeHTML(effect.description);
			let match = null;

			if(targetActor) {
				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.ForPlusAmountDamage"), "u"));
				if(match) {
					const characteristicName = checkData.action.system.type === "ranged" ? "agility" : "strength";
					outcome.targetDamages = actor.system.characteristics[characteristicName].rating +
						(checkData.weapon?.system.damageRating ?? 0) +
						(actor.system.damageRating ?? 0) +
						parseInt(match[1]);
				}

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.ForCharacteristicDamage"), "u"));
				if(match) {
					const characteristicName = Object.entries(CONFIG.WFRP3e.characteristics).find(characteristic => {
						return game.i18n.localize(characteristic[1].abbreviation) === match[2];
					})[0];
					const characteristic = actor.system.characteristics[characteristicName];

					outcome.targetDamages = characteristic.value + parseInt(match[1]);
				}
				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.ForMinusAmountDamage"), "u"));
				if(match) {
					const characteristicName = checkData.action.system.type === "ranged" ? "agility" : "strength";
					console.
					outcome.targetDamages = actor.system.characteristics[characteristicName].rating +
						(checkData.weapon?.system.damageRating ?? 0) +
						(actor.system.damageRating ?? 0) +
						parseInt(match[1]);
				}

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.ForNormalDamage"), "u"));
				if(match) {
					const characteristicName = checkData.action.system.type === "ranged" ? "agility" : "strength";
					console.log(actor.system.characteristics[characteristicName].rating, checkData.weapon?.system.damageRating, actor.system.damageRating)
					outcome.targetDamages = actor.system.characteristics[characteristicName].rating +
						(checkData.weapon?.system.damageRating ?? 0) +
						(actor.system.damageRating ?? 0);
				}

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.MinusDamage"), "u"));
				if(match)
					outcome.targetDamages -= parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.PlusDamage"), "u"));
				if(match)
					outcome.targetDamages += parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.PlusCritical"), "u"));
				if(match)
					outcome.targetCriticalWounds += parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.TargetSuffersAmountFatigue"), "iu"));
				if(match)
					outcome.targetFatigue += parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.TargetSuffersAmountStress"), "iu"));
				if(match)
					outcome.targetStress += parseInt(match[1]);
			}

			if(actor) {
				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.RecoverAmountFatigue"), "iu"));
				if(match)
					outcome.fatigue -= parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.RecoverAmountStress"), "iu"));
				if(match)
					outcome.stress -= parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.SufferAmountCritical"), "iu"));
				if(match)
					outcome.criticalWounds += parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.SufferAmountFatigue"), "iu"));
				if(match)
					outcome.fatigue += parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.SufferAmountStress"), "iu"));
				if(match)
					outcome.stress += parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.SufferAmountWound"), "iu"));
				if(match)
					outcome.wounds += parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.SufferAmountWound"), "iu"));
				if(match)
					outcome.favour += parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.GainAmountPower"), "iu"));
				if(match)
					outcome.power += parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.LoseAmountFavour"), "iu"));
				if(match)
					outcome.favour -= parseInt(match[1]);

				match = effectDescription.match(new RegExp(game.i18n.localize("ROLL.REGEX.LoseAmountPower"), "iu"));
				if(match)
					outcome.power -= parseInt(match[1]);
			}
		}

		if(targetActor) {
			// If the attack inflicts damages, reduce them by Toughness and Soak values.
			if(outcome.targetDamages > 0) {
				outcome.targetDamages -= targetActor.system.characteristics.toughness.rating +
					(targetActor.system.totalSoak ?? 0) +
					(targetActor.system.soakValue ?? 0);

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
						);
					}
				}
				// If the attack inflicts 0 damages in spite of hitting the target, the target still suffers one damage
				// (no critical wounds are inflicted though).
				else {
					outcome.targetDamages = 1
					targetUpdates.system.wounds = {value: targetActor.system.wounds.value - 1};
				}
			}

			if(outcome.targetFatigue > 0 || outcome.targetFatigue < 0)
				targetUpdates.system.impairments = {fatigue: targetActor.system.impairments.fatigue + outcome.targetFatigue};

			if(outcome.targetStress > 0 || outcome.targetStress < 0)
				targetUpdates.system.impairments = {stress: targetActor.system.impairments.stress + outcome.targetStress};

			targetActor.update(targetUpdates);
		}

		if(actor) {
			if(outcome.wounds > 0)
				actorUpdates.system.wounds = actor.system.wounds.value - outcome.wounds;

			if(outcome.criticalWounds > 0)
				outcome.criticalWounds = await Item.createDocuments(
					await this.drawCriticalWoundsRandomly(outcome.criticalWounds),
					{parent: actor}
				);

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
							let rollTableDraw = null;
							let criticalWound = null

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