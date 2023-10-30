import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eCreatureDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;
		const requiredInteger = {required: true, nullable: false, integer: true};

		return {
			attributes: new fields.SchemaField(Object.keys(CONFIG.WFRP3e.attributes).reduce((object, attribute) => {
				object[attribute] = new fields.SchemaField({
					budget: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
					current: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
				}, {label: attribute});

				return object;
			}, {})),
			characteristics: new fields.SchemaField(Object.keys(CONFIG.WFRP3e.characteristics).reduce((object, characteristic) => {
				if(characteristic !== "varies")
					object[characteristic] = new fields.SchemaField({
						value: new fields.NumberField({...requiredInteger, initial: 2, min: 0}),
						fortune: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
					}, {label: characteristic});

				return object;
			}, {})),
			category: new fields.StringField(),
			damageRating: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
			defenceValue: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
			description: new fields.HTMLField(),
			specialRuleSummary: new fields.HTMLField(),
			soakValue: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
			stance: new fields.NumberField({...requiredInteger, initial: 0}),
			threatRating: new fields.NumberField({...requiredInteger, initial: 1, min: 1}),
			wounds: new fields.SchemaField({
				max: new fields.NumberField({...requiredInteger, initial: 7, min: 0}),
				value: new fields.NumberField({...requiredInteger, initial: 7, min: 0})
			})
		};
	}

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareDefaultStance();

		if(this.specialRuleSummary)
			this._prepareSpecialRuleSummary();
	}

	/**
	 * Prepares the descriptions of the Action's effects.
	 * @private
	 */
	_prepareSpecialRuleSummary()
	{
		const cleanedUpDescription = DataHelper._getCleanedupDescription(this.specialRuleSummary);

		if(cleanedUpDescription)
			this.updateSource({specialRuleSummary: cleanedUpDescription});
	}

	/**
	 * Prepares the default stance of the WFRP3eCharacter.
	 * @private
	 */
	_prepareDefaultStance()
	{
		this.defaultStance = "conservative";

		if(this.stance < 0) {
			this.defaultStance = "reckless";
		}
	}
}