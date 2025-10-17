/** @inheritDoc */
export default class WFRP3eCharacterDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

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
			characteristics: new fields.SchemaField(
				Object.entries(CONFIG.WFRP3e.characteristics).reduce((object, [key, value]) => {
					object[key] = new fields.SchemaField({
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
					}, {label: value.name});
					return object;
				}, {})
			),
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
				choices: Object.entries(CONFIG.WFRP3e.availableRaces).reduce((origins, [key, race]) => {
					Object.entries(race.origins).forEach(([key, origin]) => {
						origins[key] = origin.name;
					});
					return origins;
				}, {}),
				initial: "reiklander",
				nullable: false,
				required: true
			}),
			party: new fields.DocumentIdField(),
			power: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			stance: new fields.SchemaField({
				...Object.keys(CONFIG.WFRP3e.stances).reduce((object, stance) => {
					object[stance] = new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true});
					return object;
				}, {}),
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
	 * Whether the character owns a Faith talent.
	 * @returns {Boolean}
	 */
	get priest() {
		return this.parent.itemTypes.talent.find(talent => talent.system.type === "faith") != null;
	}

	/**
	 * Whether the character owns an Order talent.
	 * @returns {Boolean}
	 */
	get wizard() {
		return this.parent.itemTypes.talent.find(talent => talent.system.type === "order") != null;
	}

	/**
	 * The character's current career.
	 * @returns {WFRP3eItem}
	 */
	get currentCareer()
	{
		return this.parent.itemTypes.career.find(career => career.system.current === true);
	}

	/**
	 * The character's party.
	 * @returns {WFRP3eActor}
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
	 * @returns {Number} The character's rank.
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
			conservative: -this.stance.conservative - (this.currentCareer?.system.startingStance.conservativeSegments ?? 0),
			reckless: this.stance.reckless + (this.currentCareer?.system.startingStance.recklessSegments ?? 0)
		};
	}

	/**
	 * The sum of the defence value of every armour owned by the character plus their own defence value.
	 * @returns {Number}
	 */
	get totalDefence()
	{
		return this.parent.itemTypes.armour.reduce((value, armour) => value + armour.system.defenceValue, 0);
	}

	/**
	 * The sum of the encumbrance of every armour, trapping and weapon owned by the character.
	 * @returns {Number} The total of the encumbrance.
	 */
	get totalEncumbrance()
	{
		return this.parent.items
			.filter((item) => ["armour", "trapping", "weapon"].includes(item.type))
			.reduce((totalEncumbrance, item) => totalEncumbrance + item.system.encumbrance, 0);
	}

	/**
	 * The sum of the soak value of every armour owned by the character plus their own soak value.
	 * @returns {Number}
	 */
	get totalSoak()
	{
		return this.parent.itemTypes.armour.reduce((value, armour) => value + armour.system.soakValue, 0);
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
		this.experience.current = this.experience.total - this.parent.itemTypes.career.reduce(
			(totalAdvancesSpent, career) => totalAdvancesSpent +
				(career.system.advances.action?.length > 0 ? 1 : 0) +
				(career.system.advances.talent?.length > 0 ? 1 : 0) +
				(career.system.advances.skill?.length > 0 ? 1 : 0) +
				(career.system.advances.wound?.length > 0 ? 1 : 0) +
				(career.system.advances.open?.filter(openAdvance => openAdvance?.length > 0)).length +
				career.system.advances.careerTransition.cost +
				(career.system.advances.dedicationBonus?.length > 0 ? 1 : 0) +
				Object.values(career.system.advances.nonCareer)
					.reduce((advancesSpent, nonCareerAdvance) => advancesSpent + nonCareerAdvance.cost, 0),
			0);
	}
}
