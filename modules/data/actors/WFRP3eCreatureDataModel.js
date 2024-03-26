import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eCreatureDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			attributes: new fields.SchemaField(Object.keys(CONFIG.WFRP3e.attributes).reduce((object, attribute) => {
				object[attribute] = new fields.SchemaField({
					budget: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
					current: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
					max: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
					value: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
				}, {label: attribute});

				return object;
			}, {})),
			characteristics: new fields.SchemaField(Object.keys(CONFIG.WFRP3e.characteristics).reduce((object, characteristic) => {
				if(characteristic !== "varies")
					object[characteristic] = new fields.SchemaField({
						value: new fields.NumberField({initial: 2, integer: true, min: 0, nullable: false, required: true}),
						rating: new fields.NumberField({initial: 2, integer: true, min: 0, nullable: false, required: true}),
						fortune: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
					}, {label: characteristic});

				return object;
			}, {})),
			category: new fields.StringField(),
			damageRating: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			defenceValue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			description: new fields.HTMLField(),
			specialRuleSummary: new fields.HTMLField(),
			soakValue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			stance: new fields.NumberField({initial: 0, integer: true, nullable: false, required: true}),
			threatRating: new fields.NumberField({initial: 1, integer: true, min: 1, nullable: false, required: true}),
			wounds: new fields.SchemaField({
				max: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true})
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

	/** @inheritDoc */
	static migrateData(source)
	{
		Object.keys(CONFIG.WFRP3e.characteristics).forEach((characteristic) => {
			if(!source.characteristics[characteristic].rating)
				source.characteristics[characteristic].rating = source.characteristics[characteristic].value;
		});

		Object.keys(CONFIG.WFRP3e.attributes).forEach((attribute) => {
			if(!source.attributes[attribute].max)
				source.attributes[attribute].max = source.attributes[attribute].budget;
			if(!source.attributes[attribute].value)
				source.attributes[attribute].value = source.attributes[attribute].current;
		});

		return super.migrateData(source);
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

		if(this.stance > 0) {
			this.defaultStance = "reckless";
		}
	}
}