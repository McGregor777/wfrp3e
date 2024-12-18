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
			effect: new fields.SchemaField({
				script: new fields.JavaScriptField({async: true}),
				type: new fields.StringField({
					choices: CONFIG.WFRP3e.scriptTypes,
					initial: Object.keys(CONFIG.WFRP3e.scriptTypes)[0],
					required: true
				})
			}),
			rechargeTokens: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
			socket: new fields.StringField(),
			type: new fields.StringField({
				choices: CONFIG.WFRP3e.talentTypes,
				initial: Object.keys(CONFIG.WFRP3e.talentTypes)[0],
				required: true
			})
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