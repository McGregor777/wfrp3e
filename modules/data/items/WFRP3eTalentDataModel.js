import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eTalentDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			description: new fields.HTMLField(),
			rechargeTokens: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
			talentSocket: new fields.StringField(),
			type: new fields.StringField()
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["TALENT"];

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareDescription();
	}

	/**
	 * Prepares the description of the Talent's description.
	 * @private
	 */
	_prepareDescription()
	{
		const cleanedUpDescription = DataHelper._getCleanedupDescription(this.description);

		if(cleanedUpDescription)
			this.updateSource({description: cleanedUpDescription});
	}
}