/**
 * A data model intended to be used as an inner EmbeddedDataField which defines a non-career advance.
 * @abstract
 * @property {number} cost The cost of the non-career advance.
 * @property {string} type The type of career advance, a value in NonCareerAdvance.TYPES.
 */
export default class NonCareerAdvance extends foundry.abstract.DataModel
{
	/**
	 * The types of non-career advance.
	 * @type {Readonly<{
	 *   nonPrimaryCharacteristic: NonPrimaryCharacteristicAdvance
	 *   nonCareerSkill: NonCareerSkillAdvance
	 *   nonCareerTalent: NonCareerTalentAdvance
	 * }>}
	 */
	static get TYPES()
	{
		const {NonPrimaryCharacteristicAdvance, NonCareerSkillAdvance, NonCareerTalentAdvance} = wfrp3e.data.items.career;

		return Object.freeze({
			[NonPrimaryCharacteristicAdvance.TYPE]: NonPrimaryCharacteristicAdvance,
			[NonCareerSkillAdvance.TYPE]: NonCareerSkillAdvance,
			[NonCareerTalentAdvance.TYPE]: NonCareerTalentAdvance
		});
	};

	/**
	 * The type of this non-advance.
	 * @type {string}
	 */
	static TYPE = "nonCareer";

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["CAREER"];

	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  types = {};

		for(const key of Object.keys(this.TYPES))
			types[key] = `CAREER.ADVANCES.${key}.label`;

		return {
			cost: new fields.NumberField({initial: 0, integer: true, min: 0, required: true}),
			type: new foundry.data.fields.StringField({
				choices: types,
				initial: this.TYPE,
				required: true
			})
		};
	}

	get output()
	{
		return this.cost ? game.i18n.localize(`CAREER.ADVANCES.${this.type}.output`) : "";
	}

	/**
	 * Asks the user for specific selection if needed, then activates the advance and operate the changes it implies.
	 * @param {Career} career The career containing the new advance.
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async buyAdvance(career)
	{
		const nonCareerAdvanceIndex = career.advances.nonCareer.findIndex(advance => !advance.cost);
		if(nonCareerAdvanceIndex == null)
			return ui.notifications.warn("Unable to buy the advance: the career has no available non-career advance.");

		const nonCareerAdvances = career.simpleNonCareerAdvances;
		nonCareerAdvances[nonCareerAdvanceIndex] = await this._operateChanges(career, nonCareerAdvanceIndex);

		await career.parent.update({"system.advances.nonCareer": nonCareerAdvances});
	}

	/**
	 * Asks the user for specific selection if needed, then builds an object of changes that may be used
	 * to activate an advance.
	 * @param {Career} career The career containing the advance.
	 * @param {number} [index] The index of the concerned advance if it is an open one.
	 * @returns {Object} An object of relevant changes for the advance.
	 * @protected
	 */
	static async _operateChanges(career, index)
	{
		return {cost: 2, type: this.TYPE};
	}

	/**
	 * Checks for any error prior to making definitive changes.
	 * @param {Career} career The career containing the advance.
	 * @param {number} index The index of the non-career advance.
	 * @returns {string|false} Returns an error if any found, false otherwise.
	 */
	static _checkForError(career, index)
	{
		if(career.advances.nonCareer[index].cost)
			return `Unable to buy the advance: the non-career advance at ${index} is already active.`;

		return false;
	}
}
