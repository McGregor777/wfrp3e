/** @inheritDoc */
export default class Character extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  characteristics = {},
			  originChoices = {},
			  stance = {};

		for(const [key, characteristic] of Object.entries(CONFIG.WFRP3e.characteristics))
			characteristics[key] = new fields.SchemaField({
				rating: new fields.NumberField({
					initial: 2,
					integer: true,
					min: 0,
					nullable: false,
					required: true
				}),
				fortune: new fields.NumberField({
					initial: 0,
					integer: true,
					min: 0,
					nullable: false,
					required: true
				})
			}, {label: characteristic.name});

		for(const race of Object.values(CONFIG.WFRP3e.availableRaces))
			for(const [key, origin] of Object.entries(race.origins))
				originChoices[key] = origin.name;

		for(const key of Object.keys(CONFIG.WFRP3e.stances))
			stance[key] = new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true});

		return {
			background: new fields.SchemaField({
				biography: new fields.HTMLField({nullable: true}),
				height: new fields.StringField({nullable: true}),
				weight: new fields.StringField({nullable: true}),
				build: new fields.StringField({nullable: true}),
				hairColour: new fields.StringField({nullable: true}),
				eyeColour: new fields.StringField({nullable: true}),
				birthplace: new fields.StringField({nullable: true}),
				familyMembers: new fields.StringField({nullable: true}),
				personalGoal: new fields.StringField({nullable: true}),
				allies: new fields.StringField({nullable: true}),
				enemies: new fields.StringField({nullable: true}),
				campaignNotes: new fields.HTMLField({nullable: true})
			}),
			characteristics: new fields.SchemaField(characteristics),
			corruption: new fields.SchemaField({
				max: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			experience: new fields.SchemaField({
				current: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				total: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			favour: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			fortune: new fields.SchemaField({
				max: new fields.NumberField({initial: 3, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 3, integer: true, min: 0, nullable: false, required: true})
			}),
			impairments: new fields.SchemaField({
				fatigue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				stress: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			origin: new fields.StringField({
				choices: originChoices,
				initial: "reiklander",
				nullable: false,
				required: true
			}),
			party: new fields.DocumentIdField(),
			power: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			stance: new fields.SchemaField({
				...stance,
				current: new fields.NumberField({initial: 0, integer: true, nullable: false, required: true})
			}),
			wounds: new fields.SchemaField({
				max: new fields.NumberField({initial: 10, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 10, integer: true, min: 0, nullable: false, required: true})
			})
		};
	}

	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["ACTOR", "CHARACTER"];

	/**
	 * The character's current career.
	 * @returns {Item}
	 */
	get currentCareer()
	{
		return this.parent.itemTypes.career.find(career => career.system.current === true);
	}

	/**
	 * The character's party.
	 * @returns {Actor}
	 */
	get currentParty()
	{
		return fromUuidSync(this.party) ?? game.actors.contents.find(actor => actor.id === this.party);
	}

	/**
	 * The character's default stance, depending on the largest side of their stance meter.
	 * @private
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
	 * The character's origin complete data.
	 * @returns {Object} The data from the character's origin.
	 */
	get originData()
	{
		return {
			id: this.origin,
			...this.race.origins[this.origin]
		};
	}

	/**
	 * Whether the character owns a Faith talent.
	 * @returns {boolean}
	 */
	get priest() {
		return this.parent.itemTypes.talent.find(talent => talent.system.type === "faith") != null;
	}

	/**
	 * The character's race depending on their origin.
	 * @returns {Object} The character's race.
	 */
	get race()
	{
		const race = Object.entries(CONFIG.WFRP3e.availableRaces)
			.find(race => this.origin in race[1].origins);

		return {
			id: race[0],
			...race[1]
		};
	}

	/**
	 * The character's rank, which is the character's total experience divided by 10 + 1.
	 * @returns {number} The character's rank.
	 */
	get rank()
	{
		return Math.floor(this.experience.total / 10) + 1;
	}

	/**
	 * The character's stance meter, depending on their own stance segments plus their current career ones.
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
	 * The sum of the defence value of every armour owned by the character plus their own defence value.
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
	 * The sum of the encumbrance of every armour, trapping and weapon owned by the character.
	 * @returns {number} The total of the encumbrance.
	 */
	get totalEncumbrance()
	{
		let totalEncumbrance = 0;

		for(const item of this.parent.items)
			if(["armour", "trapping", "weapon"].includes(item.type))
				totalEncumbrance += item.system.encumbrance;

		return totalEncumbrance;
	}

	/**
	 * The sum of the soak value of every armour owned by the character plus their own soak value.
	 * @returns {number}
	 */
	get totalSoak()
	{
		let totalSoak = 0;

		for(const armour of this.parent.itemTypes.armour)
			totalSoak += armour.system.soakValue;

		return totalSoak;
	}

	/**
	 * Whether the character owns an Order talent.
	 * @returns {boolean}
	 */
	get wizard() {
		return this.parent.itemTypes.talent.find(talent => talent.system.type === "order") != null;
	}

	/** @inheritDoc */
	prepareDerivedData()
	{
		this._calculateCurrentExperience();
	}

	/**
	 * Calculates the remaining experience points of the character, depending on the number of spent advances.
	 * @private
	 */
	_calculateCurrentExperience()
	{
		this.experience.current = this.experience.total;

		//#TODO Add a method to the career data model to calculate the total experience spent on one career.
		for(const career of this.parent.itemTypes.career) {
			this.experience.current -= (career.system.advances.action ? 1 : 0)
				+ (career.system.advances.talent ? 1 : 0)
				+ (career.system.advances.skill ? 1 : 0)
				+ (career.system.advances.wound ? 1 : 0)
				+ (career.system.advances.open?.filter(openAdvance => openAdvance)).length
				+ career.system.advances.careerTransition.cost
				+ (career.system.advances.dedicationBonus ? 1 : 0);

			for(const nonCareerAdvance of Object.values(career.system.advances.nonCareer))
				this.experience.current -= nonCareerAdvance.cost;
		}
	}
}
