import WFRP3eTrappingDataModel from "./WFRP3eTrappingDataModel.js";

/** @inheritDoc */
export default class WFRP3eWeaponDataModel extends WFRP3eTrappingDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return Object.assign({
			criticalRating: new fields.NumberField({initial: 5, integer: true, min: 0, nullable: false, required: true}),
			damageRating: new fields.NumberField({initial: 3, integer: true, min: 0, nullable: false, required: true}),
			group: new fields.StringField({
				choices: Object.entries(CONFIG.WFRP3e.weapon.groups).reduce((groups, [key, group]) => {
					groups[key] = group.name
					return groups;
				}, {}),
				initial: Object.keys(CONFIG.WFRP3e.weapon.groups)[0],
				required: true
			}),
			qualities: new fields.ArrayField(
				new fields.SchemaField({
					name: new fields.StringField({
						choices: CONFIG.WFRP3e.weapon.qualities,
						initial: Object.keys(CONFIG.WFRP3e.weapon.qualities)[0],
						label: "WEAPON.FIELDS.qualities.FIELDS.name.label",
						required: true
					}),
					rating: new fields.NumberField({
						initial: 1,
						integer: true,
						label: "WEAPON.FIELDS.qualities.FIELDS.rating.label",
						min: 1
					})
				})
			),
			range: new fields.StringField({
				choices: CONFIG.WFRP3e.weapon.ranges,
				initial: Object.keys(CONFIG.WFRP3e.weapon.ranges)[0],
				required: true
			}),
			special: new fields.HTMLField()
		}, super.defineSchema());
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["TRAPPING", "WEAPON"];
}
