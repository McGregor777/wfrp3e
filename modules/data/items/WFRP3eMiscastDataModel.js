import WFRP3eItemDataModel from "./WFRP3eItemDataModel.js";

/** @inheritDoc */
export default class WFRP3eMiscastDataModel extends WFRP3eItemDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			description: new fields.HTMLField()
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["MISCAST"];
}
