import WFRP3eItemDataModel from "./WFRP3eItemDataModel.js";

/** @inheritDoc */
export default class WFRP3eDiseaseDataModel extends WFRP3eItemDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			description: new fields.HTMLField(),
			severityRating: new fields.NumberField({initial: 1, integer: true, min: 1, nullable: false, required: true}),
			symptom: new fields.StringField({
				choices: Object.entries(CONFIG.WFRP3e.disease.symptoms).reduce((groups, [key, group]) => {
					groups[key] = group.name
					return groups;
				}, {}),
				initial: Object.keys(CONFIG.WFRP3e.disease.symptoms)[0],
				required: true
			}),
			traits: new fields.StringField({nullable: false, required: true})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["DISEASE"];
}
