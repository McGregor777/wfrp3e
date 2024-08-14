import DataHelper from "../DataHelper.js";

/** @inheritDoc */
export default class WFRP3eCreatureDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			attributes: new fields.SchemaField(Object.keys(CONFIG.WFRP3e.attributes).reduce((object, attribute) => {
				object[attribute] = new fields.SchemaField({
					max: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
					value: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
				}, {label: attribute});

				return object;
			}, {})),
			characteristics: new fields.SchemaField(Object.keys(CONFIG.WFRP3e.characteristics).reduce((object, characteristic) => {
				if(characteristic !== "varies")
					object[characteristic] = new fields.SchemaField({
						rating: new fields.NumberField({initial: 2, integer: true, min: 0, nullable: false, required: true}),
						fortune: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
					}, {label: characteristic});

				return object;
			}, {})),
			category: new fields.StringField(),
			damageRating: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			defenceValue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			description: new fields.HTMLField(),
			impairments: new fields.SchemaField({
				fatigue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				stress: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			specialRuleSummary: new fields.HTMLField(),
			soakValue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			stance: new fields.SchemaField({
				...Object.keys(CONFIG.WFRP3e.stances).reduce((object, stance) => {
					object[stance] = new fields.NumberField({initial: 1, integer: true, min: 0, nullable: false, required: true});
					return object;
				}, {}),
				current: new fields.NumberField({initial: 0, integer: true, nullable: false, required: true})
			}),
			threatRating: new fields.NumberField({initial: 1, integer: true, min: 1, nullable: false, required: true}),
			wounds: new fields.SchemaField({
				max: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true})
			})
		};
	}

	static migrateData(source)
	{
		if(typeof source.stance === "number")
			source.stance = {
				conservative: source.stance < 0 ? Math.abs(source.stance) : 1,
				reckless: source.stance > 0 ? source.stance : 1,
				current: source.stance
			};

		return source;
	}

	/** @inheritDoc */
	prepareBaseData()
	{
		super.prepareBaseData();

		this._prepareDefenceAndSoak();
		this._prepareDefaultStance();
		this._prepareNemesis();
		this._prepareStanceMeter();

		if(this.specialRuleSummary)
			this._prepareSpecialRuleSummary();
	}

	/**
	 * Prepares the descriptions of the Action's effects.
	 * @private
	 */
	_prepareSpecialRuleSummary()
	{
		const cleanedUpDescription = DataHelper._getCleanedupDescription(this.specialRuleSummary);

		if(cleanedUpDescription)
			this.updateSource({specialRuleSummary: cleanedUpDescription});
	}

	/**
	 * Prepares the total defence and soak of the WFRP3eCreature.
	 * @private
	 */
	_prepareDefenceAndSoak()
	{
		this.totalDefence = 0;
		this.totalSoak = 0;

		this.parent.itemTypes.armour.forEach((armour) => {
			this.totalDefence += armour.system.defenceValue;
			this.totalSoak += armour.system.soakValue;
		});

		if(this.totalDefence === 0)
			this.totalDefence = this.defenceValue;

		if(this.totalSoak === 0)
			this.totalSoak = this.soakValue;
	}

	/**
	 * Prepares the default stance of the WFRP3eCreature.
	 * @private
	 */
	_prepareDefaultStance()
	{
		this.defaultStance = "conservative";

		if(this.stance.current > 0)
			this.defaultStance = "reckless";
	}

	/**
	 * Prepares the Nemesis status of the WFRP3eCreature.
	 * @private
	 */
	_prepareNemesis()
	{
		this.nemesis = this.category.includes(game.i18n.localize("CREATURE.Nemesis"));
	}

	/**
	 * Prepares the stance meter of the WFRP3eCharacter.
	 * @private
	 */
	_prepareStanceMeter()
	{
		this.stanceMeter = {
			conservative: -this.stance.conservative - (this.parent.system.currentCareer?.system.startingStance.conservativeSegments ?? 0),
			reckless: this.stance.reckless + (this.parent.system.currentCareer?.system.startingStance.recklessSegments ?? 0)
		};
	}
}