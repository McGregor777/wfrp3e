/**
 * A data model intended to be used as an inner EmbeddedDataField which defines a career advance.
 * @abstract
 * @property {boolean} active Whether the career advance is active.
 * @property {string} type The type of career advance, a value in CareerAdvance.TYPES.
 */
export default class CareerAdvance extends foundry.abstract.DataModel
{
	/**
	 * The types of open career advance.
	 * @type {Readonly<{
	 *   action: ActionAdvance
	 *   rating: RatingAdvance
	 *   conservative: ConservativeAdvance
	 *   fortune: FortuneAdvance
	 *   reckless: RecklessAdvance
	 *   skill: SkillAdvance
	 *   talent: TalentAdvance
	 *   wound: WoundAdvance
	 * }>}
	 */
	static get TYPES()
	{
		const {
			ActionAdvance,
			ConservativeAdvance,
			FortuneAdvance,
			RatingAdvance,
			RecklessAdvance,
			SkillAdvance,
			TalentAdvance,
			WoundAdvance
		} = wfrp3e.data.items.career;

		return Object.freeze({
			[ActionAdvance.TYPE]: ActionAdvance,
			[ConservativeAdvance.TYPE]: ConservativeAdvance,
			[FortuneAdvance.TYPE]: FortuneAdvance,
			[RatingAdvance.TYPE]: RatingAdvance,
			[RecklessAdvance.TYPE]: RecklessAdvance,
			[SkillAdvance.TYPE]: SkillAdvance,
			[TalentAdvance.TYPE]: TalentAdvance,
			[WoundAdvance.TYPE]: WoundAdvance
		});
	};

	/**
	 * The type of this advance.
	 * @type {string}
	 */
	static TYPE = "open";

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
			active: new fields.BooleanField(),
			type: new fields.StringField({
				choices: types,
				initial: this.TYPE,
				required: true
			})
		};
	}

	get output()
	{
		return this.active ? game.i18n.localize(`CAREER.ADVANCES.${this.type}.output`) : "";
	}

	/**
	 * Asks the user for specific selection if needed, then activates the advance and operate the changes it implies.
	 * @param {Career} career The career containing the new advance.
	 * @param {boolean} open Whether the advance is an open or regular one.
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async buyAdvance(career, open)
	{
		open ? await this.buyOpenAdvance(career) : await this.buyRegularAdvance(career);
	}

	/**
	 * Asks the user for specific selection if needed, then activates the advance and operate the changes it implies.
	 * @param {Career} career The career containing the new advance.
	 * @returns {Promise<void>}
	 */
	static async buyRegularAdvance(career)
	{
		if(this.active)
			return ui.notifications.error(`Unable to buy the career's ${this.TYPE} advance: it is already bought.`);

		const changes = await this._operateChanges(career, false);

		await career.parent.update({[`system.advances.${this.TYPE}`]: changes});
	}

	/**
	 * Asks the user for specific selection if needed, then activates the advance and operate the changes it implies.
	 * @param {Career} career The career containing the new advance.
	 * @returns {Promise<void>}
	 */
	static async buyOpenAdvance(career)
	{
		// Pre-changes verifications
		if(career.openAdvancesLeft[this.TYPE] <= 0)
			return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted"));

		const openAdvanceIndex = career.advances.open.findIndex(advance => !advance.active);
		if(openAdvanceIndex == null)
			return ui.notifications.warn("Unable to buy the advance: the career has no available open advance.");

		const openAdvances = career.simpleOpenAdvances;
		openAdvances[openAdvanceIndex] = await this._operateChanges(career, openAdvanceIndex);

		await career.parent.update({"system.advances.open": openAdvances});
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
		return {active: true, type: this.TYPE};
	}

	/**
	 * Checks for any error before making definitive changes.
	 * @param {Career} career The career containing the advance.
	 * @param {Object} [options]
	 * @param {number} [options.index] The index of the advance if it is an open one.
	 * @returns {string|false} Returns an error if any found, false otherwise.
	 */
	static _checkForError(career, {index = null} = {})
	{
		if(index) {
			if(career.openAdvancesLeft[this.type] <= 0)
				return game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted");

			if(career.advances.open[index].active)
				return `Unable to buy the advance: the open advance at ${index} is already active.`;
		}
		else if(this.active)
			return `Unable to buy the career's ${this.type} advance: it is already bought.`;

		return false;
	}
}
