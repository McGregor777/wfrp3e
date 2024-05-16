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
	 * @returns {Promise<void>}
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
				checkData: {actor, characteristic},
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
	 * @returns {Promise<void>}
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
				checkData: {actor, skill, characteristic: {name: skill.system.characteristic, ...characteristic}},
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
	 * @returns {Promise<void>}
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
		const checkData = {actor, action, face, skill, characteristic: {name: characteristicName, ...characteristic}};
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
							? [...game.user.targets][0]?.actor.system.totalDefence ?? 0
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
	 * @returns {DicePool}
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
}