import Trapping from "./trapping.mjs";

/** @inheritDoc */
export default class Armour extends Trapping
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return Object.assign({
			defenceValue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			soakValue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
		}, super.defineSchema());
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["TRAPPING", "ARMOUR"];
}
