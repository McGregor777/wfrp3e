import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eSkillDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			advanced: new fields.BooleanField(),
			characteristic: new fields.StringField({required: true}),
			description: new fields.HTMLField(),
			specialisations: new fields.StringField(),
			trainingLevel: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0})
		};
	}

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareDescription();
	}

	/**
	 * Prepares the description of the Skill's description.
	 * @private
	 */
	_prepareDescription()
	{
		const cleanedUpDescription = DataHelper._getCleanedupDescription(this.description);

		if(cleanedUpDescription)
			this.updateSource({description: cleanedUpDescription});
	}
}