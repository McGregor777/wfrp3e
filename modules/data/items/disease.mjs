import Item from "./item.mjs";

/** @inheritDoc */
export default class Disease extends Item
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  symptoms = {};

		for(const [key, symptom] of Object.entries(this.SYMPTOMS))
			symptoms[key] = symptom.name;

		return {
			description: new fields.HTMLField(),
			severityRating: new fields.NumberField({initial: 1, integer: true, min: 1, nullable: false, required: true}),
			symptom: new fields.StringField({
				choices: symptoms,
				initial: Object.keys(this.SYMPTOMS)[0],
				required: true
			}),
			traits: new fields.StringField({nullable: false, required: true})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DISEASE"];

	static SYMPTOMS = {
		delirium: {
			description: "DISEASE.SYMPTOMS.delirium.description",
			name: "DISEASE.SYMPTOMS.delirium.name"
		},
		fever: {
			description: "DISEASE.SYMPTOMS.fever.description",
			name: "DISEASE.SYMPTOMS.fever.name"
		},
		infectious: {
			description: "DISEASE.SYMPTOMS.infectious.description",
			name: "DISEASE.SYMPTOMS.infectious.name"
		},
		lethal: {
			description: "DISEASE.SYMPTOMS.lethal.description",
			name: "DISEASE.SYMPTOMS.lethal.name"
		},
		painful: {
			description: "DISEASE.SYMPTOMS.painful.description",
			name: "DISEASE.SYMPTOMS.painful.name"
		},
		tiring: {
			description: "DISEASE.SYMPTOMS.tiring.description",
			name: "DISEASE.SYMPTOMS.tiring.name"
		},
		virulent: {
			description: "DISEASE.SYMPTOMS.virulent.description",
			name: "DISEASE.SYMPTOMS.virulent.name"
		},
		weary: {
			description: "DISEASE.SYMPTOMS.weary.description",
			name: "DISEASE.SYMPTOMS.weary.name"
		}
	};
}
