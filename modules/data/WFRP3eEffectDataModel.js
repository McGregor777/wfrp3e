/** @inheritDoc */
export default class WFRP3eEffectDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			conditionScript: new fields.JavaScriptField(),
			postScript: new fields.JavaScriptField({async: true}),
			reverseScript: new fields.JavaScriptField({async: true}),
			script: new fields.JavaScriptField({async: true}),
			type: new fields.StringField({
				choices: CONFIG.WFRP3e.scriptTypes,
				initial: Object.keys(CONFIG.WFRP3e.scriptTypes)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["EFFECT"];
}