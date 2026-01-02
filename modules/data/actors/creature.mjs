import Actor from "./actor.mjs";

/** @inheritDoc */
export default class Creature extends Actor
{
	static {
		this.LOCALIZATION_PREFIXES.push("CREATURE");
	}

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
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  requiredNonNullablePositiveInteger = {initial: 0, integer: true, nullable: false, min: 0, required: true},
			  attributes = {};

		for(const [key, attribute] of Object.entries(this.ATTRIBUTES))
			attributes[key] = new fields.SchemaField({
				max: new fields.NumberField(requiredNonNullablePositiveInteger),
				value: new fields.NumberField(requiredNonNullablePositiveInteger)
			}, {label: attribute.name});

		return {
			...super.defineSchema(),
			attributes: new fields.SchemaField(attributes),
			category: new fields.StringField({nullable: true}),
			damageRating: new fields.NumberField(requiredNonNullablePositiveInteger),
			defenceValue: new fields.NumberField(requiredNonNullablePositiveInteger),
			description: new fields.HTMLField({nullable: true}),
			specialRuleSummary: new fields.HTMLField({nullable: true}),
			soakValue: new fields.NumberField(requiredNonNullablePositiveInteger),
			threatRating: new fields.NumberField({...requiredNonNullablePositiveInteger, initial: 1})
		};
	}

	/** @inheritDoc */
	get totalDefence()
	{
		return this.parent.itemTypes.armour.length > 0
			? super.totalDefence
			: this.defenceValue + this.defenceModifier;
	}

	/** @inheritDoc */
	get totalSoak()
	{
		return this.parent.itemTypes.armour.length > 0
			? super.totalSoak
			: this.soakValue + this.soakModifier;
	}

	/**
	 * Whether the creature is a Nemesis.
	 * @protected
	 */
	get nemesis()
	{
		return this.category.includes(game.i18n.localize("CREATURE.nemesis"));
	}
}
