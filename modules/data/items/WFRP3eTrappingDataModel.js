import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eTrappingDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;
		const requiredInteger = {integer: true, nullable: false, required: true};

		return {
			cost: new fields.SchemaField({
				brass: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
				silver: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
				gold: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
			}),
			description: new fields.HTMLField(),
			encumbrance: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
			rarity: new fields.StringField({initial: "abundant", required: true, nullable: false})
		};
	}

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareDescription();
	}

	/**
	 * Prepares the description of the Trapping's description.
	 * @private
	 */
	_prepareDescription()
	{
		const cleanedUpDescription = DataHelper._getCleanedupDescription(this.description);

		if(cleanedUpDescription)
			this.updateSource({description: cleanedUpDescription});
	}
}