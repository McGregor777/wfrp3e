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
		const dicePool = new DicePool({
			characteristicDice: characteristic.value - Math.abs(stance),
			fortuneDice: characteristic.fortune,
			expertiseDice: skill.system.trainingLevel,
			conservativeDice: stance > 0 ? stance : 0,
			recklessDice: stance < 0 ? Math.abs(stance) : 0
		});

		await new CheckBuilder(
			dicePool,
			game.i18n.format("ROLL.SkillCheck", {skill: skill.name}),
			skill,
			rollFlavor,
			rollSound
		).render(true);
	}

	// Takes a skill object, characteristic object, difficulty number and WFRP3ECharacterSheet.getData() object and creates the appropriate roll dialog.
	static async rollSkillDirect(skill, characteristic, difficulty, sheet, flavorText, sound)
	{
		const dicePool = new DicePool(
		{
			ability: Math.max(characteristic.value, skill.rank),
			boost: skill.boost,
			setback: skill.setback,
			force: skill.force,
			difficulty: difficulty,
			advantage: skill.advantage,
			dark: skill.dark,
			light: skill.light,
			failure: skill.failure,
			threat: skill.threat,
			success: skill.success,
			triumph: skill?.triumph ? skill.triumph : 0,
			despair: skill?.despair ? skill.despair : 0,
		});

		dicePool.upgrade(Math.min(characteristic.value, skill.rank));

		this.displayCheckDialog(sheet, dicePool, game.i18n.localize("ROLL.FreeCheck"), skill.label, null, flavorText, sound);
	}

	static getWeaponStatus(item)
	{
		let setback = 0;
		let difficulty = 0;

		if(item.type === "weapon" && item?.data?.status && item.data.status !== "None")
		{
			const status = CONFIG.WFRP3e.itemstatus[item.data.status].attributes.find((i) => i.mod === "Setback");

			if(status.value < 99)
			{
				if(status.value === 1)
					setback = status.value;
				else
					difficulty = 1;
			}
			else
			{
				ui.notifications.error(`${item.name} ${game.i18n.localize("WFRP3E.ItemTooDamagedToUse")} (${game.i18n.localize(CONFIG.WFRP3E.itemstatus[item.data.status].label)}).`);
				return;
			}
		}

		return {setback, difficulty};
	}

	static async getModifiers(dicePool, item)
	{
		if(item.type === "weapon")
		{
			dicePool = await ModifierHelpers.getDicePoolModifiers(dicePool, item, []);

			if(item?.data?.itemattachment)
			{
				await ImportHelpers.asyncForEach(item.data.itemattachment, async (attachment) =>
				{
					//get base mods and additional mods totals
					const activeModifiers = attachment.data.itemmodifier.filter((i) => i.data?.active);

					dicePool = await ModifierHelpers.getDicePoolModifiers(dicePool, attachment, activeModifiers);
				});
			}

			if(item?.data?.itemmodifier)
			{
				await ImportHelpers.asyncForEach(item.data.itemmodifier, async (modifier) =>
				{
					dicePool = await ModifierHelpers.getDicePoolModifiers(dicePool, modifier, []);
				});
			}
		}

		return dicePool;
	}
}