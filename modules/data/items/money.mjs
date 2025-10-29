import Item from "./item.mjs";

/** @inheritDoc */
export default class Money extends Item
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
