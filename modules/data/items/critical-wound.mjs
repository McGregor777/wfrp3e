import Item from "./item.mjs";

/** @inheritDoc */
export default class CriticalWound extends Item
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			description: new fields.HTMLField(),
			severityRating: new fields.NumberField({integer: true, initial: 1, min: 1, nullable: false, required: true})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["CRITICALWOUND"];
}
