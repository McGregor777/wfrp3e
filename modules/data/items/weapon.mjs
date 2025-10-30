import Trapping from "./trapping.mjs";

/** @inheritDoc */
export default class Weapon extends Trapping
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  groups = {};

		for(const [key, group] of Object.entries(CONFIG.WFRP3e.weapon.groups))
			groups[key] = group.name;

		return Object.assign({
			criticalRating: new fields.NumberField({initial: 5, integer: true, min: 0, nullable: false, required: true}),
			damageRating: new fields.NumberField({initial: 3, integer: true, min: 0, nullable: false, required: true}),
			group: new fields.StringField({
				choices: groups,
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

	/** @inheritDoc */
	static migrateData(source)
	{
		for(const [index, quality] of source.qualities.entries())
			if(quality.name === "twohanded")
				source.qualities[index].name = "twoHanded";

		return super.migrateData(source);
	}
}
