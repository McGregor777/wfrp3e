import WFRP3eItemDataModel from "./WFRP3eItemDataModel.js";

/** @inheritDoc */
export default class WFRP3eAbilityDataModel extends WFRP3eItemDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			cooldown: new fields.BooleanField(),
			description: new fields.HTMLField()
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["ABILITY"];
}
