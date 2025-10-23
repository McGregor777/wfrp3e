import WFRP3eItemDataModel from "./WFRP3eItemDataModel.js";

/** @inheritDoc */
export default class WFRP3eMutationDataModel extends WFRP3eItemDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			description: new fields.HTMLField(),
			severityRating: new fields.NumberField({initial: 1, integer: true, min: 1, nullable: false, required: true}),
			traits: new fields.StringField({initial: "Chaos", textSearch: true})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["MUTATION"];
}
