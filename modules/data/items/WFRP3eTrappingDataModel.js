import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eTrappingDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			cost: new fields.SchemaField({
				brass: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				silver: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				gold: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			description: new fields.HTMLField(),
			encumbrance: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			rarity: new fields.StringField({
				choices: CONFIG.WFRP3e.rarities,
				initial: Object.keys(CONFIG.WFRP3e.rarities)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["TRAPPING"];

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