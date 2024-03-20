import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eMutationDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;
		const requiredInteger = {nullable: false, required: true};

		return {
			description: new fields.HTMLField(),
			effects: new fields.StringField({...requiredInteger}),
			severityRating: new fields.NumberField({...requiredInteger, initial: 1, integer: true, min: 1}),
			traits: new fields.StringField({...requiredInteger, initial: "Chaos"}),
		};
	}

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareDescription();
	}

	/**
	 * Prepares the description of the Mutation's description.
	 * @private
	 */
	_prepareDescription()
	{
		const cleanedUpDescription = DataHelper._getCleanedupDescription(this.description);

		if(cleanedUpDescription)
			this.updateSource({description: cleanedUpDescription});
	}
}