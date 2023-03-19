//import PopoutEditor from "../PopoutEditor.js";
import CheckBuilder from "./CheckBuilder.js";
import DicePool from "./DicePool.js";
//import ModifierHelpers from "../helpers/modifiers.js";
//import ImportHelpers from "../importer/import-helpers.js";

export default class DiceHelper
{
	/**
	 * Roll a Skill check.
	 * @param {WFRP3EItem} skill The Skill check has been triggered.
	 * @param {Event} event The Event which triggered the Skill check.
	 * @param {string} [type] The type of Skill check.
	 * @param {string} [flavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {string} [rollSound] Some sound to play after the Skill check completion.
	 * @returns {Promise<void>}
	 */
	static async prepareSkillCheck(skill, event, type = null, flavor = null, rollSound = null)
	{
		const stance = skill.actor.system.attributes.stance.current;
		const characteristic = skill.actor.system.attributes.characteristics[skill.system.characteristic];

		let dicePool = new DicePool({
			characteristicDice: characteristic.value,
			conservativeDice: stance < 0 ? Math.min(characteristic.value, Math.abs(stance)) : 0,
			expertiseDice: skill.system.training_level,
			fortuneDice: characteristic.fortune,
			recklessDice: stance > 0 ? Math.min(characteristic.value, stance) : 0,
		});

		this.displayCheckDialog(skill, dicePool, `${game.i18n.localize("WFRP3E.Checking")} ${skill.name}`, skill.name, flavor, rollSound);
	}

	/**
	 * Displays a check dialog.
	 * @param rollData
	 * @param {DicePool} dicePool
	 * @param {string} [title]
	 * @param {string} [rollSkillName]
	 * @param {string} [flavor]
	 * @param {string} [rollSound]
	 * @returns {Promise<void>}
	 */
	static async displayCheckDialog(rollData, dicePool, title, rollSkillName, flavor, rollSound)
	{
		new CheckBuilder(rollData, dicePool, title, rollSkillName, flavor, rollSound).render(true);
	}

	static async addSkillDicePool(obj, elem)
	{
		const data = obj.getData();
		const skillName = elem.dataset["ability"];

		if(data.data.skills[skillName])
		{
			const skill = data.data.skills[skillName];
			const characteristic = data.data.characteristics[skill.characteristic];

			const dicePool = new DicePool(
			{
				challenge: skill.challenge,
				characteristic: skill.characteristic,
				conservative: skill.conservative,
				expertise: skill.expertise,
				fortune: skill.fortune,
				misfortune: skill.misfortune,
				reckless: skill.reckless,
				source:
				{
					skill: skill?.ranksource?.length ? skill.ranksource : [],
					boost: skill?.boostsource?.length ? skill.boostsource : [],
					remsetback: skill?.remsetbacksource?.length ? skill.remsetbacksource : [],
					setback: skill?.setbacksource?.length ? skill.setbacksource : [],
					advantage: skill?.advantagesource?.length ? skill.advantagesource : [],
					dark: skill?.darksource?.length ? skill.darksource : [],
					light: skill?.lightsource?.length ? skill.lightsource : [],
					failure: skill?.failuresource?.length ? skill.failuresource : [],
					threat: skill?.threatsource?.length ? skill.threatsource : [],
					success: skill?.successsource?.length ? skill.successsource : [],
				},
			});

			dicePool.upgrade(Math.min(characteristic.value, skill.rank));

			const rollButton = elem.querySelector(".roll-button");
			dicePool.renderPreview(rollButton);
		}
	}

	static async rollItem(itemId, actorId, flavorText, sound)
	{
		const actor = game.actors.get(actorId);
		const actorSheet = actor.sheet.getData();

		const item = actor.items.get(itemId).data;
		item.flags.uuid = item.uuid;

		const status = this.getWeaponStatus(item);

		const skill = actor.data.data.skills[item.data.skill.value];
		const characteristic = actor.data.data.characteristics[skill.characteristic];

		let dicePool = new DicePool(
		{
			ability: Math.max(characteristic.value, skill.rank),
			boost: skill.boost,
			setback: skill.setback + status.setback,
			force: skill.force,
			advantage: skill.advantage,
			dark: skill.dark,
			light: skill.light,
			failure: skill.failure,
			threat: skill.threat,
			success: skill.success,
			triumph: skill?.triumph ? skill.triumph : 0,
			despair: skill?.despair ? skill.despair : 0,
			difficulty: 2 + status.difficulty, // default to average difficulty
		});

		dicePool.upgrade(Math.min(characteristic.value, skill.rank));

		dicePool = new DicePool(await this.getModifiers(dicePool, item));

		this.displayCheckDialog(actorSheet, dicePool, `${game.i18n.localize("WFRP3E.Rolling")} ${skill.label}`, skill.label, item, flavorText, sound);
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

		this.displayCheckDialog(sheet, dicePool, `${game.i18n.localize("WFRP3E.Rolling")} ${skill.label}`, skill.label, null, flavorText, sound);
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