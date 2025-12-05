import Item from "./item.mjs";

/** @inheritDoc */
export default class Ability extends Item
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
