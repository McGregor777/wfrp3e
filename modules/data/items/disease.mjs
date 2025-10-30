import Item from "./item.mjs";

/** @inheritDoc */
export default class Disease extends Item
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  symptoms = {};

		for(const [key, symptom] of Object.entries(CONFIG.WFRP3e.disease.symptoms))
			symptoms[key] = symptom.name;

		return {
			description: new fields.HTMLField(),
			severityRating: new fields.NumberField({initial: 1, integer: true, min: 1, nullable: false, required: true}),
			symptom: new fields.StringField({
				choices: symptoms,
				initial: Object.keys(CONFIG.WFRP3e.disease.symptoms)[0],
				required: true
			}),
			traits: new fields.StringField({nullable: false, required: true})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DISEASE"];
}
