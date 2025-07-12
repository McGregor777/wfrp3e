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
			characteristic: new fields.StringField({
				choices: {
					...Object.entries(CONFIG.WFRP3e.characteristics).reduce((object, [key, group]) => {
						object[key] = group.name
						return object;
					}, {}),
					varies: "ACTOR.FIELDS.characteristics.varies.label"
				},
				initial: Object.keys(CONFIG.WFRP3e.characteristics)[0],
				required: true
			}),
			description: new fields.HTMLField(),
			specialisations: new fields.StringField(),
			trainingLevel: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["SKILL"];

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