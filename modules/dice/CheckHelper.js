import CheckBuilder from "./CheckBuilder.js";
import DicePool from "./DicePool.js";

/**
 * The CheckHelper provides methods to prepare checks.
 */
export default class CheckHelper
{
	/**
	 * Rolls a Skill check.
	 * @param {WFRP3eActor} actor The Character using the Action.
	 * @param {WFRP3eItem} skill The Skill check has been triggered.
	 * @param {string} [rollFlavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {string} [rollSound] Some sound to play after the Skill check completion.
	 * @returns {Promise<void>}
	 */
	static async prepareSkillCheck(actor, skill, rollFlavor = null, rollSound = null)
	{
		const characteristic = actor.system.characteristics[skill.system.characteristic];
		const stance = actor.system.stance.current;

		await new CheckBuilder(
			new DicePool({
				characteristicDice: characteristic.value - Math.abs(stance),
				fortuneDice: characteristic.fortune,
				expertiseDice: skill.system.trainingLevel,
				conservativeDice: stance > 0 ? stance : 0,
				recklessDice: stance < 0 ? Math.abs(stance) : 0
			}),
			game.i18n.format("ROLL.SkillCheck", {skill: skill.name}),
			{actor: actor, skill: skill, characteristic: skill.system.characteristic},
			rollFlavor,
			rollSound
		).render(true);
	}

	/**
	 * Rolls an Action check.
	 * @param {WFRP3eActor} actor The Character using the Action.
	 * @param {WFRP3eItem} action The Action that is used.
	 * @param {string} face The Action face.
	 * @param {Object} [options].
	 * @returns {Promise<void>}
	 */
	static async prepareActionCheck(actor, action, face, options = {})
	{
		const match = action.system[face].check.match(new RegExp(/(([\w\s]+) \((\w+)\))( vs\.? ([\w\s]+))?/));
		let skill = actor.itemTypes.skill[0] ?? null;
		let characteristicName = skill ? skill.system.characteristic : "Strength";

		if(match) {
			skill = actor.itemTypes.skill.find((skill) => skill.name === match[2]) ?? skill;
			// Either get the Characteristic specified on the Action's check, or use the Characteristic used by the Skill.
			characteristicName = Object.entries(CONFIG.WFRP3e.characteristics).find((characteristic) => {
				return game.i18n.localize(characteristic[1].abbreviation) === match[3];
			})[0] ?? characteristicName;
		}

		const characteristic = actor.system.characteristics[characteristicName];
		const rollData = {actor: actor, action: action, face: face, skill: skill, characteristic: characteristicName};
		let stance = 0;

		if(actor.type === "character")
			stance = actor.system.stance.current
		else if(actor.type === "creature")
			stance = actor.system.stance

		if(options.weapon)
			rollData.weapon = options.weapon;

		await new CheckBuilder(
			new DicePool({
				characteristicDice: characteristic?.value - Math.abs(stance) ?? 0,
				fortuneDice: characteristic?.fortune ?? 0,
				expertiseDice: skill?.system.trainingLevel ?? 0,
				conservativeDice: stance > 0 ? stance : 0,
				recklessDice: stance < 0 ? Math.abs(stance) : 0,
				challengeDice: action.system[face].difficultyModifiers.challengeDice +
					(["melee", "ranged"].includes(action.system[face].type)
						? CONFIG.WFRP3e.challengeLevels.easy.challengeDice
						: 0),
				misfortuneDice: action.system[face].difficultyModifiers.misfortuneDice +
					((match ? match[5] === game.i18n.localize("ACTION.CHECK.TargetDefence") : false)
						? [...game.user.targets][0]?.actor.system.totalDefence ?? 0
						: 0)
			}),
			game.i18n.format("ROLL.ActionCheck", {action: action.name}),
			rollData,
			options.rollFlavor,
			options.rollSound
		).render(true);
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
	 */
	static getUniversalBoonEffect(isMental)
	{
		return isMental ? {
			symbolAmount: 2,
			description: game.i18n.localize("ROLL.UNIVERSAL.MentalBoon")
		} : {
			symbolAmount: 2,
			description: game.i18n.localize("ROLL.UNIVERSAL.PhysicalBoon")
		};
	}

	/**
	 * Get the universal boon effect.
	 * @param {boolean} isMental Whether the check is based upon a mental characteristic.
	 */
	static getUniversalBaneEffect(isMental)
	{
		return isMental ? {
			symbolAmount: 2,
			description: game.i18n.localize("ROLL.UNIVERSAL.MentalBane")
			} : {
			symbolAmount: 2,
			description: game.i18n.localize("ROLL.UNIVERSAL.PhysicalBane")
		};
	}

	/**
	 * Get the universal Sigmar's comet effect.
	 */
	static getUniversalSigmarsCometEffect(isMental)
	{
		return {
			symbolAmount: 1,
			description: game.i18n.localize("ROLL.UNIVERSAL.SigmarsComet")
		};
	}

	/**
	 * Toggles effects from a Roll, depending on the symbols remaining.
	 * @param chatMessageId The id of the ChatMessage containing the Roll.
	 * @param symbol The symbol of the effect to toggle.
	 * @param index The index of the effect to toggle.
	 */
	static toggleEffect(chatMessageId, symbol, index)
	{
		const chatMessage = game.messages.get(chatMessageId);
		const changes = {rolls: chatMessage.rolls};

		if(changes.rolls[0].data.effects[symbol][index].active === true)
			changes.rolls[0].data.effects[symbol][index].active = false;
		else if(changes.rolls[0].data.remainingSymbols[CONFIG.WFRP3e.symbols[symbol].plural] >= changes.rolls[0].data.effects[symbol][index].symbolAmount)
			changes.rolls[0].data.effects[symbol][index].active = true;
		else
			ui.notifications.warn(game.i18n.format("ROLL.NotEnoughSymbolToTriggerEffect", {symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)}));

		changes.rolls[0].data.remainingSymbols[CONFIG.WFRP3e.symbols[symbol].plural] = changes.rolls[0].data.effects[symbol].reduce((accumulator, effect) => {
			if(effect.active)
				accumulator -= effect.symbolAmount;
			return accumulator;
		}, changes.rolls[0].symbols[CONFIG.WFRP3e.symbols[symbol].plural]);

		chatMessage.update(changes);
	}
}