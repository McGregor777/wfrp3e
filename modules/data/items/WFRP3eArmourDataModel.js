import WFRP3eTrappingDataModel from "./WFRP3eTrappingDataModel.js";

/** @inheritDoc */
export default class WFRP3eWeaponDataModel extends WFRP3eTrappingDataModel
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