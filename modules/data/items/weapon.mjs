import Trapping from "./trapping.mjs";

/** @inheritDoc */
export default class Weapon extends Trapping
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  groups = {};

		for(const [key, group] of Object.entries(this.GROUPS))
			groups[key] = group.name;

		return Object.assign({
			criticalRating: new fields.NumberField({initial: 5, integer: true, min: 0, nullable: false, required: true}),
			damageRating: new fields.NumberField({initial: 3, integer: true, min: 0, nullable: false, required: true}),
			group: new fields.StringField({
				choices: groups,
				initial: Object.keys(this.GROUPS)[0],
				required: true
			}),
			qualities: new fields.ArrayField(
				new fields.SchemaField({
					name: new fields.StringField({
						choices: this.QUALITIES,
						initial: Object.keys(this.QUALITIES)[0],
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
				choices: this.RANGES,
				initial: Object.keys(this.RANGES)[0],
				required: true
			}),
			special: new fields.HTMLField()
		}, super.defineSchema());
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["TRAPPING", "WEAPON"];

	static COMMON_WEAPONS = {
		improvised: {
			id: "improvised",
			name: "WEAPON.improvised",
			system: {
				criticalRating: 4,
				damageRating: 3,
				group: "thrown",
				qualities: ["thrown"],
				range: "close"
			}
		},
		improvisedWeapon: {
			id: "improvisedWeapon",
			name: "WEAPON.improvisedWeapon",
			system: {
				criticalRating: 3,
				damageRating: 3,
				group: "ordinary",
				qualities: [],
				range: "close"
			}
		},
		unarmed: {
			id: "unarmed",
			name: "WEAPON.unarmed",
			system: {
				criticalRating: 4,
				damageRating: 3,
				group: "unarmed",
				qualities: [],
				range: "close"
			}
		}
	};

	static GROUPS = {
		blackpowder: {
			name: "WEAPON.GROUPS.blackpowder",
			type: "ranged"
		},
		bow: {
			name: "WEAPON.GROUPS.bow",
			type: "ranged"
		},
		cavalry: {
			name: "WEAPON.GROUPS.cavalry",
			type: "melee"
		},
		crossbow: {
			name: "WEAPON.GROUPS.crossbow",
			type: "ranged"
		},
		fencing: {
			name: "WEAPON.GROUPS.fencing",
			type: "melee"
		},
		flail: {
			name: "WEAPON.GROUPS.flail",
			type: "melee"
		},
		greatWeapon: {
			name: "WEAPON.GROUPS.greatWeapon",
			type: "melee"
		},
		ordinary: {
			name: "WEAPON.GROUPS.ordinary",
			type: "melee"
		},
		polearm: {
			name: "WEAPON.GROUPS.polearm",
			type: "melee"
		},
		sling: {
			name: "WEAPON.GROUPS.sling",
			type: "ranged"
		},
		spear: {
			name: "WEAPON.GROUPS.spear",
			type: "melee"
		},
		staff: {
			name: "WEAPON.GROUPS.staff",
			type: "melee"
		},
		thrown: {
			name: "WEAPON.GROUPS.thrown",
			type: "ranged"
		},
		unarmed: {
			name: "WEAPON.GROUPS.unarmed",
			type: "melee"
		}
	};
	
	static QUALITIES = {
		attuned: "WEAPON.QUALITIES.attuned",
		blast: "WEAPON.QUALITIES.blast",
		defensive: "WEAPON.QUALITIES.defensive",
		entangling: "WEAPON.QUALITIES.entangling",
		fast: "WEAPON.QUALITIES.fast",
		pierce: "WEAPON.QUALITIES.pierce",
		reload: "WEAPON.QUALITIES.reload",
		slow: "WEAPON.QUALITIES.slow",
		thrown: "WEAPON.QUALITIES.thrown",
		twoHanded: "WEAPON.QUALITIES.twoHanded",
		unreliable: "WEAPON.QUALITIES.unreliable",
		vicious: "WEAPON.QUALITIES.vicious"
	};
	
	static RANGES = {
		close: "WEAPON.RANGES.close",
		medium: "WEAPON.RANGES.medium",
		long: "WEAPON.RANGES.long",
		extreme: "WEAPON.RANGES.extreme"
	};

	static get fastEffect()
	{
		return {
			description: "<p>Place one fewer recharge token on this action</p>",
			immediate: false,
			reverseScript: "",
			script: "outcome.rechargeTokens--;",
			symbolAmount: 1
		};
	}

	/** @inheritDoc */
	static migrateData(source)
	{
		for(const [index, quality] of source.qualities.entries())
			if(quality.name === "twohanded")
				source.qualities[index].name = "twoHanded";

		return super.migrateData(source);
	}
}
