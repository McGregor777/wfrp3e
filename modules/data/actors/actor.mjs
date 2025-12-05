/** @inheritDoc */
export default class Actor extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["ACTOR"];

	static CHARACTERISTICS = {
		strength: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.strength.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.strength.abbreviation",
			type: "physical"
		},
		toughness: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.toughness.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.toughness.abbreviation",
			type: "physical"
		},
		agility: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.agility.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.agility.abbreviation",
			type: "physical"
		},
		intelligence: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.intelligence.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.intelligence.abbreviation",
			type: "mental"
		},
		willpower: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.willpower.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.willpower.abbreviation",
			type: "mental"
		},
		fellowship: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.fellowship.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.fellowship.abbreviation",
			type: "mental"
		}
	};

	static STANCES = {
		conservative: "STANCES.conservative",
		reckless: "STANCES.reckless"
	};

	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  requiredNonNullablePositiveInteger = {initial: 0, integer: true, nullable: false, min: 0, required: true},
			  characteristics = {},
			  stance = {};

		for(const [key, characteristic] of Object.entries(this.CHARACTERISTICS))
			characteristics[key] = new fields.SchemaField({
				rating: new fields.NumberField({...requiredNonNullablePositiveInteger, initial: 2}),
				fortune: new fields.NumberField(requiredNonNullablePositiveInteger)
			}, {label: characteristic.name});

		for(const key of Object.keys(this.STANCES))
			stance[key] = new fields.NumberField(requiredNonNullablePositiveInteger);

		return {
			characteristics: new fields.SchemaField(characteristics),
			impairments: new fields.SchemaField({
				fatigue: new fields.NumberField(requiredNonNullablePositiveInteger),
				stress: new fields.NumberField(requiredNonNullablePositiveInteger)
			}),
			stance: new fields.SchemaField({
				...stance,
				current: new fields.NumberField(requiredNonNullablePositiveInteger)
			}),
			wounds: new fields.SchemaField({
				max: new fields.NumberField({...requiredNonNullablePositiveInteger, initial: 10}),
				value: new fields.NumberField({...requiredNonNullablePositiveInteger, initial: 10})
			})
		};
	}

	/**
	 * @type {number} The encumbrance limit modifier for the Actor.
	 */
	encumbranceLimitModifier = 0;

	/**
	 * The actor's default stance, depending on the largest side of their stance meter.
	 * @returns {string}
	 */
	get defaultStance()
	{
		let defaultStance = "conservative";

		if(this.stance.current > 0 ||
			this.stance.current === 0 && Math.abs(this.stanceMeter.conservative) < this.stanceMeter.reckless) {
			defaultStance = "reckless";
		}

		return defaultStance;
	}

	/**
	 * The name of the actor's current stance.
	 * @returns {string}
	 */
	get currentStanceName()
	{
		if(this.stance.current < 0)
			return "conservative";
		else if(this.stance.current > 0)
			return "reckless";

		return this.defaultStance;
	}

	/**
	 * @returns {number} The damage reduction of the Actor, adding the Actor's total soak value and toughness rating.
	 */
	get damageReduction()
	{
		return this.system.characteristics.toughness.rating + this.system.totalSoak;
	}

	/**
	 * @returns {number} The encumbrance limit the Actor.
	 */
	get encumbranceLimit()
	{
		return this.characteristics.strength.rating * 5
			+ this.characteristics.strength.fortune
			+ this.encumbranceLimitModifier;
	}

	/**
	 * The actor's stance meter, depending on their own stance segments plus their current career ones.
	 * @returns {Object}
	 */
	get stanceMeter()
	{
		return {
			conservative: -this.stance.conservative - (this.currentCareer?.system.startingStance.conservativeSegments || 0),
			reckless: this.stance.reckless + (this.currentCareer?.system.startingStance.recklessSegments || 0)
		};
	}

	/**
	 * The sum of the defence value of every armour owned by the actor plus their own defence value.
	 * @returns {number}
	 */
	get totalDefence()
	{
		let totalDefence = 0;

		for(const armour of this.parent.itemTypes.armour)
			totalDefence += armour.system.defenceValue;

		return totalDefence;
	}

	/**
	 * The sum of the soak value of every armour owned by the actor plus their own soak value.
	 * @returns {number}
	 */
	get totalSoak()
	{
		let totalSoak = 0;

		for(const armour of this.parent.itemTypes.armour)
			totalSoak += armour.system.soakValue;

		return totalSoak;
	}
}
