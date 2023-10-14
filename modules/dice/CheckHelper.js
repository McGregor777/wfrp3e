import CheckBuilder from "./CheckBuilder.js";
import DicePool from "./DicePool.js";

/**
 * The CheckHelper provides methods to prepare checks.
 */
export default class CheckHelper
{
	/**
	 * Rolls a Skill check.
	 * @param {WFRP3eItem} skill The Skill check has been triggered.
	 * @param {?string} [rollFlavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {?string} [rollSound] Some sound to play after the Skill check completion.
	 * @returns {Promise<void>}
	 */
	static async prepareSkillCheck(skill, rollFlavor = null, rollSound = null)
	{
		const characteristic = skill.actor.system.attributes.characteristics[skill.system.characteristic];
		const stance = skill.actor.system.attributes.stance.current;

		await new CheckBuilder(
			new DicePool({
				characteristicDice: characteristic.value - Math.abs(stance),
				fortuneDice: characteristic.fortune,
				expertiseDice: skill.system.trainingLevel,
				conservativeDice: stance > 0 ? stance : 0,
				recklessDice: stance < 0 ? Math.abs(stance) : 0
			}),
			game.i18n.format("ROLL.SkillCheck", {skill: skill.name}),
			{actor: skill.actor, skill: skill, characteristic: skill.system.characteristic},
			rollFlavor,
			rollSound
		).render(true);
	}

	/**
	 * Rolls an Action check.
	 * @param {WFRP3eItem} action The Action check has been triggered.
	 * @param {string} face The Action face.
	 * @param {string} [rollFlavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {string} [rollSound] Some sound to play after the Skill check completion.
	 * @returns {Promise<void>}
	 */
	static async prepareActionCheck(action, face, rollFlavor = "", rollSound = null)
	{
		const match = action.system[face].check.match(new RegExp(/(([\w\s]+) \((\w+)\))( vs\.? ([\w\s]+))?/));
		let skill = action.actor.itemTypes.skill[0];
		let characteristicName = skill.system.characteristic;

		if(match) {
			skill = action.actor.itemTypes.skill.find((skill) => skill.name === match[2]) ?? skill;
			// Either get the Characteristic specified on the Action's check, or use the Characteristic used by the Skill.
			characteristicName = Object.entries(CONFIG.WFRP3e.characteristics).find((characteristic) => {
				return game.i18n.localize(characteristic[1].abbreviation) === match[3];
			})[0] ?? characteristicName;
		}

		const characteristic = action.actor.system.attributes.characteristics[characteristicName];
		const stance = action.actor.system.attributes.stance.current;

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
			{actor: action.actor, action: action, face: face, skill: skill, characteristic: characteristicName},
			rollFlavor,
			rollSound
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
}