/** @inheritDoc */
export default class Creature extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  attributes = {},
			  characteristics = {},
			  stance = {};

		for(const [key, attribute] of Object.entries(this.ATTRIBUTES))
			attributes[key] = new fields.SchemaField({
				max: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}, {label: attribute.name});

		for(const [key, characteristic] of Object.entries(CONFIG.WFRP3e.characteristics))
			characteristics[key] = new fields.SchemaField({
				rating: new fields.NumberField({initial: 2, integer: true, min: 0, nullable: false, required: true}),
				fortune: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}, {label: characteristic.name});

		for(const key of Object.keys(CONFIG.WFRP3e.stances))
			stance[key] = new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true});

		return {
			attributes: new fields.SchemaField(attributes),
			characteristics: new fields.SchemaField(characteristics),
			category: new fields.StringField({nullable: true}),
			damageRating: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			defenceValue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			description: new fields.HTMLField({nullable: true}),
			impairments: new fields.SchemaField({
				fatigue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				stress: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			specialRuleSummary: new fields.HTMLField({nullable: true}),
			soakValue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			stance: new fields.SchemaField({
				...stance,
				current: new fields.NumberField({initial: 0, integer: true, nullable: false, required: true})
			}),
			threatRating: new fields.NumberField({initial: 1, integer: true, min: 1, nullable: false, required: true}),
			wounds: new fields.SchemaField({
				max: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true})
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["ACTOR", "CREATURE"];

	static ATTRIBUTES = {
		aggression: {
			abbreviation: "CREATURE.FIELDS.attributes.FIELDS.aggression.abbreviation",
			name: "CREATURE.FIELDS.attributes.FIELDS.aggression.label"
		},
		cunning: {
			abbreviation: "CREATURE.FIELDS.attributes.FIELDS.expertise.abbreviation",
			name: "CREATURE.FIELDS.attributes.FIELDS.cunning.label"
		},
		expertise: {
			abbreviation: "CREATURE.FIELDS.attributes.FIELDS.expertise.abbreviation",
			name: "CREATURE.FIELDS.attributes.FIELDS.expertise.label"
		}
	};

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareDefenceAndSoak();
		this._prepareDefaultStance();
		this._prepareNemesis();
		this._prepareStanceMeter();
	}

	/**
	 * Prepares the total defence and soak of the creature.
	 * @protected
	 */
	_prepareDefenceAndSoak()
	{
		this.totalDefence = 0;
		this.totalSoak = 0;

		for(const armour of this.parent.itemTypes.armour) {
			this.totalDefence += armour.system.defenceValue;
			this.totalSoak += armour.system.soakValue;
		}

		if(this.totalDefence === 0)
			this.totalDefence = this.defenceValue;

		if(this.totalSoak === 0)
			this.totalSoak = this.soakValue;
	}

	/**
	 * Prepares the default stance of the creature.
	 * @protected
	 */
	_prepareDefaultStance()
	{
		this.defaultStance = "conservative";

		if(this.stance.current > 0)
			this.defaultStance = "reckless";
	}

	/**
	 * Prepares the Nemesis status of the creature.
	 * @protected
	 */
	_prepareNemesis()
	{
		this.nemesis = this.category.includes(game.i18n.localize("CREATURE.nemesis"));
	}

	/**
	 * Prepares the stance meter of the creature.
	 * @protected
	 */
	_prepareStanceMeter()
	{
		this.stanceMeter = {
			conservative: -this.stance.conservative
				- (this.parent.system.currentCareer?.system.startingStance.conservativeSegments || 0),
			reckless: this.stance.reckless
				+ (this.parent.system.currentCareer?.system.startingStance.recklessSegments || 0)
		};
	}
}
