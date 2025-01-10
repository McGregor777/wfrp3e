import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eAbilityDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			cooldown: new fields.BooleanField(),
			description: new fields.HTMLField(),
			effects: new fields.ArrayField(
				new fields.SchemaField({
					conditionScript: new fields.JavaScriptField({
						hint: "ABILITY.FIELDS.effects.conditionScript.hint",
						label: "ABILITY.FIELDS.effects.conditionScript.label"
					}),
					script: new fields.JavaScriptField({
						async: true,
						hint: "ABILITY.FIELDS.effects.script.hint",
						label: "ABILITY.FIELDS.effects.script.label"
					}),
					type: new fields.StringField({
						choices: CONFIG.WFRP3e.scriptTypes,
						initial: Object.keys(CONFIG.WFRP3e.scriptTypes)[0],
						label: "ABILITY.FIELDS.effects.type.label",
						required: true
					})
				}, {initial: {script: null, type: Object.keys(CONFIG.WFRP3e.scriptTypes)[0]}}))
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["ABILITY"];

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareDescription();
	}

	/**
	 * Prepares the description of the Ability's description.
	 * @private
	 */
	_prepareDescription()
	{
		const cleanedUpDescription = DataHelper._getCleanedupDescription(this.description);

		if(cleanedUpDescription)
			this.updateSource({description: cleanedUpDescription});
	}
}