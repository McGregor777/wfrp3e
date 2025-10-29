import Item from "./item.mjs";

/** @inheritDoc */
export default class Trapping extends Item
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			cost: new fields.SchemaField({
				brass: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				silver: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				gold: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			description: new fields.HTMLField(),
			encumbrance: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			rarity: new fields.StringField({
				choices: CONFIG.WFRP3e.rarities,
				initial: Object.keys(CONFIG.WFRP3e.rarities)[0],
				required: true
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["TRAPPING"];
}
