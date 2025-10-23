import WFRP3eItemDataModel from "./WFRP3eItemDataModel.js";

/** @inheritDoc */
export default class WFRP3eMoneyDataModel extends WFRP3eItemDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			description: new fields.HTMLField(),
			quantity: new fields.NumberField({initial: 1, integer: true, min: 0, nullable: false, required: true}),
			value: new fields.NumberField({initial: 1, integer: true, min: 0, nullable: false, required: true})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["MONEY"];
}
