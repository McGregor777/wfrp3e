import Item from "./item.mjs";

/** @inheritDoc */
export default class Miscast extends Item
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
