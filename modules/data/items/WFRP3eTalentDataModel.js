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
			effects: new fields.ArrayField(
				new fields.SchemaField({
					script: new fields.JavaScriptField({
						async: true,
						hint: "TALENT.FIELDS.effects.script.hint",
						label: "TALENT.FIELDS.effects.script.label"
					}),
					type: new fields.StringField({
						choices: CONFIG.WFRP3e.scriptTypes,
						initial: Object.keys(CONFIG.WFRP3e.scriptTypes)[0],
						label: "TALENT.FIELDS.effects.type.label",
						required: true
					})
				}, {initial: {script: null, type: Object.keys(CONFIG.WFRP3e.scriptTypes)[0]}})),
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

	/** @inheritDoc */
	static migrateData(source)
	{
		if(source.effect && source.effects.length <= 0)
			source.effects.push(source.effect);

		return super.migrateData(source);
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