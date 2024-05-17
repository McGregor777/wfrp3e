/** @inheritDoc */
export default class WFRP3eCharacterDataModel extends foundry.abstract.TypeDataModel
{
	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;
		const requiredInteger = {required: true, nullable: false, integer: true};

		return {
			background: new fields.SchemaField({
				biography: new fields.HTMLField(),
				height: new fields.StringField(),
				weight: new fields.StringField(),
				build: new fields.StringField(),
				hairColour: new fields.StringField(),
				eyeColour: new fields.StringField(),
				birthplace: new fields.StringField(),
				familyMembers: new fields.StringField(),
				personalGoal: new fields.StringField(),
				allies: new fields.StringField(),
				enemies: new fields.StringField(),
				campaignNotes: new fields.StringField()
			}),
			characteristics: new fields.SchemaField(Object.keys(CONFIG.WFRP3e.characteristics).reduce((object, characteristic) => {
				if(characteristic !== "varies")
					object[characteristic] = new fields.SchemaField({
						rating: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
						fortune: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
					}, {label: characteristic});

				return object;
			}, {})),
			corruption: new fields.SchemaField({
				max: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			experience: new fields.SchemaField({
				current: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				total: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			favour: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
			fortune: new fields.SchemaField({
				max: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			impairments: new fields.SchemaField({
				fatigue: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true}),
				stress: new fields.NumberField({initial: 0, integer: true, min: 0, nullable: false, required: true})
			}),
			origin: new fields.StringField({initial: "reiklander", nullable: false, required: true}),
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
				max: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true}),
				value: new fields.NumberField({initial: 7, integer: true, min: 0, nullable: false, required: true})
			})
		};
	}

	/** @inheritDoc */
	prepareDerivedData()
	{
		this._getCurrentCareer();
		this._getParty();

		this._calculateCurrentExperience();
		this._prepareRace();
		this._prepareDefence();
		this._prepareEncumbrance();
		this._prepareSoak();
		this._prepareRank();
		this._prepareStanceMeter();
		this._prepareDefaultStance();
	}

	/**
	 * Gets the current WFRP3eCareer of the WFRP3eCharacter.
	 * @private
	 */
	_getCurrentCareer()
	{
		this.currentCareer = this.parent.itemTypes.career.find(career => career.system.current === true);
	}

	/**
	 * Gets the WFRP3eParty of the WFRP3eCharacter.
	 * @private
	 */
	_getParty()
	{
		this.currentParty = game.actors.contents.find(actor => actor.id === this.party);
	}

	/**
	 * Calculates the remaining experience points of the WFRP3eCharacter, depending on the number of spent advances.
	 * @private
	 */
	_calculateCurrentExperience()
	{
		this.experience.current = this.experience.total - this.parent.itemTypes.career.reduce(
			(totalAdvancesSpent, career) => totalAdvancesSpent +
				(career.system.advances.action.length > 0 ? 1 : 0) +
				(career.system.advances.talent.length > 0 ? 1 : 0) +
				(career.system.advances.skill.length > 0 ? 1 : 0) +
				(career.system.advances.wound.length > 0 ? 1 : 0) +
				(career.system.advances.open.filter(openAdvance => openAdvance?.length > 0)).length +
				career.system.advances.careerTransition.cost +
				(career.system.advances.dedicationBonus.length > 0 ? 1 : 0) +
				Object.values(career.system.advances.nonCareer)
					.reduce((advancesSpent, nonCareerAdvance) => advancesSpent + nonCareerAdvance.cost, 0),
			0);
	}

	/**
	 * Prepares the race of the WFRP3eCharacter.
	 * @private
	 */
	_prepareRace()
	{
		this.race = Object.entries(CONFIG.WFRP3e.availableRaces).find(race => race[1].origins.hasOwnProperty(this.origin.toString()))[0];
	}

	/**
	 * Prepares the total defence of the WFRP3eCharacter.
	 * @private
	 */
	_prepareDefence()
	{
		this.totalDefence = this.parent.itemTypes.armour.reduce((totalDefence, armour) => totalDefence + armour.system.defenceValue, 0);
	}

	/**
	 * Prepares the total encumbrance of the WFRP3eCharacter.
	 * @private
	 */
	_prepareEncumbrance()
	{
		this.totalEncumbrance = this.parent.items
			.filter((item) => ["armour", "trapping", "weapon"].includes(item.type))
			.reduce((totalEncumbrance, item) => totalEncumbrance + item.system.encumbrance, 0);
	}

	/**
	 * Prepares the total soak of the WFRP3eCharacter.
	 * @private
	 */
	_prepareSoak()
	{
		this.totalSoak = this.parent.itemTypes.armour.reduce((totalSoak, armour) => totalSoak + armour.system.soakValue, 0);
	}

	/**
	 * Prepares the rank of the WFRP3eCharacter.
	 * @private
	 */
	_prepareRank()
	{
		this.rank = Math.floor(this.experience.total / 10) + 1;
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

	/**
	 * Prepares the default stance of the WFRP3eCharacter.
	 * @private
	 */
	_prepareDefaultStance()
	{
		this.defaultStance = "conservative";

		if(this.stance.current > 0 ||
			this.stance.current === 0 && Math.abs(this.stanceMeter.conservative) < this.stanceMeter.reckless) {
			this.defaultStance = "reckless";
		}
	}
}