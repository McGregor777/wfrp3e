import Trapping from "./trapping.mjs";

/** @inheritDoc */
export default class Weapon extends Trapping
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  groups = {},
			  qualities = {};

		for(const [key, group] of Object.entries(Weapon.GROUPS))
			groups[key] = group.name;

		for(const [key, quality] of Object.entries(Weapon.QUALITIES))
			qualities[key] = quality.name;

		return Object.assign({
			criticalRating: new fields.NumberField({initial: 5, integer: true, min: 0, nullable: false, required: true}),
			damageRating: new fields.NumberField({initial: 3, integer: true, min: 0, nullable: false, required: true}),
			group: new fields.StringField({
				choices: groups,
				initial: Object.keys(Weapon.GROUPS)[0],
				required: true
			}),
			qualities: new fields.ArrayField(
				new fields.SchemaField({
					name: new fields.StringField({
						choices: qualities,
						initial: Object.keys(Weapon.QUALITIES)[0],
						label: "Weapon.FIELDS.qualities.FIELDS.name.label",
						required: true
					}),
					rating: new fields.NumberField({
						initial: 1,
						integer: true,
						label: "Weapon.FIELDS.qualities.FIELDS.rating.label",
						min: 1
					})
				})
			),
			range: new fields.StringField({
				choices: Weapon.RANGES,
				initial: Object.keys(Weapon.RANGES)[0],
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
		attuned: {
			description: "WEAPON.QUALITIES.attuned.description",
			name: "WEAPON.QUALITIES.attuned.name"
		},
		blast: {
			description: "WEAPON.QUALITIES.blast.description",
			name: "WEAPON.QUALITIES.blast.name"
		},
		defensive: {
			description: "WEAPON.QUALITIES.defensive.description",
			name: "WEAPON.QUALITIES.defensive.name"
		},
		entangling: {
			description: "WEAPON.QUALITIES.entangling.description",
			name: "WEAPON.QUALITIES.entangling.name"
		},
		fast: {
			description: "WEAPON.QUALITIES.fast.description",
			name: "WEAPON.QUALITIES.fast.name"
		},
		pierce: {
			description: "WEAPON.QUALITIES.pierce.description",
			name: "WEAPON.QUALITIES.pierce.name"
		},
		reload: {
			description: "WEAPON.QUALITIES.reload.description",
			name: "WEAPON.QUALITIES.reload.name"
		},
		slow: {
			description: "WEAPON.QUALITIES.slow.description",
			name: "WEAPON.QUALITIES.slow.name"
		},
		thrown: {
			description: "WEAPON.QUALITIES.thrown.description",
			name: "WEAPON.QUALITIES.thrown.name"
		},
		twoHanded: {
			description: "WEAPON.QUALITIES.twoHanded.description",
			name: "WEAPON.QUALITIES.twoHanded.name"
		},
		unreliable: {
			description: "WEAPON.QUALITIES.unreliable.description",
			name: "WEAPON.QUALITIES.unreliable.name"
		},
		vicious: {
			description: "WEAPON.QUALITIES.vicious.description",
			name: "WEAPON.QUALITIES.vicious.name"
		}
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
