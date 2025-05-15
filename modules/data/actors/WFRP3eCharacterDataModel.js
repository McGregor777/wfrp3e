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
			characteristics: new fields.SchemaField(Object.entries(CONFIG.WFRP3e.characteristics).reduce((object, [key, value]) => {
				if(key !== "varies")
					object[key] = new fields.SchemaField({
						rating: new fields.NumberField({
							initial: 2,
							integer: true,
							label: "ACTOR.FIELDS.characteristics.rating.label",
							min: 0,
							nullable: false,
							required: true
						}),
						fortune: new fields.NumberField({
							initial: 0,
							integer: true,
							label: "ACTOR.FIELDS.characteristics.fortune.label",
							min: 0,
							nullable: false,
							required: true
						})
					}, {label: value.name});

				return object;
			}, {})),
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

	/** @inheritDoc */
	prepareDerivedData()
	{
		this._getCurrentCareer();
		this._getParty();

		this._calculateCurrentExperience();
		this._prepareRace();
		this._prepareDefenceAndSoak();
		this._prepareEncumbrance();
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
	 * Prepares the total defence and soak of the WFRP3eCharacter.
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