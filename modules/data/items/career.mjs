import Item from "./item.mjs";

/**
 * The data model for a career.
 * @property {boolean} advanced Whether the career is an advanced career or a basic one.
 * @property {Object} advanceOptions The list of advance options offered by the career.
 * @property {number} advanceOptions.action The amount of open action advance available with the career.
 * @property {number} advanceOptions.talent The amount of open talent advance available with the career.
 * @property {number} advanceOptions.skill The amount of open skill advance available with the career.
 * @property {number} advanceOptions.fortune The amount of open fortune advance available with the career.
 * @property {number} advanceOptions.conservative The amount of open conservative advance available with the career.
 * @property {number} advanceOptions.reckless The amount of open reckless advance available with the career.
 * @property {number} advanceOptions.wound The amount of open wound advance available with the career.
 * @property {Object} advances The list of advances of the career.
 * @property {ActionAdvance} advanceOptions.action The unique action advance of the career.
 * @property {CareerTransition} advances.careerTransition The career transition advance of the career.
 * @property {boolean} advances.dedicationBonus Whether the dedication bonus advance of the career has been bought.
 * @property {NonCareerAdvance[]} advances.nonCareer The list of non-career advances of the career.
 * @property {CareerAdvance[]} advances.open The list of open career advances of the career.
 * @property {SkillAdvance} advances.skill The unique skill advance of the career.
 * @property {TalentAdvance} advances.talent The unique talent advance of the career.
 * @property {WoundAdvance} advances.wound The unique wound advance of the career.
 * @property {string} careerSkills The list of skills the actor can acquire, train or specialise into as part of the career advances.
 * @property {boolean} current Whether the career is the current career of the actor.
 * @property {string} description The description of the career, containing setting information along with the career's ability description.
 * @property {string[]} primaryCharacteristics The list of primary characteristics the actor can train as part of the career advances.
 * @property {string[]} raceRestrictions The list of races that can select the career.
 * @property {Object[]} sockets The list of talent sockets of the career, used to determine which talent types can be acquired as part of the career advances as well as store talents to enable them during gameplay.
 * @property {string} traits The list of traits of the career.
 * @property {Object} startingStance The stance the actor starts with when the career is active.
 * @property {number} startingStance.conservativeSegments The number of conservative segments the actor starts with when the career is active.
 * @property {number} startingStance.recklessSegments The number of reckless segments the actor starts with when the career is active.
 * @property {string} summary A short, one-sentenced description of the career.
 */
export default class Career extends Item
{
	/** @inheritDoc */
	static LOCALIZATION_PREFIXES = ["CAREER"];

	/** @inheritDoc */
	static defineSchema()
	{
		const fields = foundry.data.fields,
			  {ActionAdvance, CareerAdvance, CareerTransition, DedicationBonus, NonCareerAdvance,
			  NonPrimaryCharacteristicAdvance, SkillAdvance, TalentAdvance, WoundAdvance} = wfrp3e.data.items.career,
			  requiredNonNullablePositiveInteger = {initial: 0, integer: true, min: 0, required: true, nullable: false},
			  requiredNullable = {nullable: true, required: true},
			  characteristics = {},
			  races = {};

		for(const [key, characteristic] of Object.entries(wfrp3e.data.actors.Actor.CHARACTERISTICS))
			characteristics[key] = characteristic.name;

		for(const [key, race] of Object.entries(wfrp3e.data.actors.Character.RACES))
			races[key] = race.name;

		return {
			advanced: new fields.BooleanField(),
			advanceOptions: new fields.SchemaField({
				action: new fields.NumberField(requiredNonNullablePositiveInteger),
				talent: new fields.NumberField(requiredNonNullablePositiveInteger),
				skill: new fields.NumberField(requiredNonNullablePositiveInteger),
				fortune: new fields.NumberField(requiredNonNullablePositiveInteger),
				conservative: new fields.NumberField(requiredNonNullablePositiveInteger),
				reckless: new fields.NumberField(requiredNonNullablePositiveInteger),
				wound: new fields.NumberField(requiredNonNullablePositiveInteger)
			}),
			advances: new fields.SchemaField({
				action: new fields.EmbeddedDataField(ActionAdvance),
				careerTransition: new fields.EmbeddedDataField(CareerTransition),
				dedicationBonus: new fields.BooleanField(),
				nonCareer: new fields.ArrayField(
					new fields.TypedSchemaField(NonCareerAdvance.TYPES), {
						initial: new Array(2).fill(new NonPrimaryCharacteristicAdvance()),
						max: 2,
						min: 2
				}),
				open: new fields.ArrayField(
					new fields.TypedSchemaField(CareerAdvance.TYPES), {
					initial: new Array(6).fill(new ActionAdvance()),
					max: 6,
					min: 6
				}),
				skill: new fields.EmbeddedDataField(SkillAdvance),
				talent: new fields.EmbeddedDataField(TalentAdvance),
				wound: new fields.EmbeddedDataField(WoundAdvance)
			}),
			careerSkills: new fields.StringField(requiredNullable),
			current: new fields.BooleanField(),
			description: new fields.HTMLField(),
			primaryCharacteristics: new fields.ArrayField(
				new fields.StringField({
					choices: characteristics,
					initial: "strength",
					required: true
				}),
				{initial: ["strength", "agility"]}
			),
			raceRestrictions: new fields.ArrayField(
				new fields.StringField({
					choices: {any: "RACE.any", ...races},
					initial: "any",
					required: true
				}),
				{initial: ["any"]}
			),
			sockets: new fields.ArrayField(
				new fields.SchemaField({
					item: new fields.DocumentUUIDField(),
					type: new fields.StringField({
						choices: {any: "TALENT.TYPES.any", ...wfrp3e.data.items.Talent.TYPES, insanity: "TALENT.TYPES.insanity"},
						initial: "focus",
						required: true
					})},
					{initial: {item: null, type: "focus"}}),
				{initial: new Array(2).fill({item: null, type: "focus"})}
			),
			traits: new fields.StringField(requiredNullable),
			startingStance: new fields.SchemaField({
				conservativeSegments: new fields.NumberField({...requiredNonNullablePositiveInteger, initial: 2}),
				recklessSegments: new fields.NumberField({...requiredNonNullablePositiveInteger, initial: 2})
			}),
			summary: new fields.StringField(requiredNullable)
		};
	}

	/** @inheritDoc */
	static migrateData(source)
	{
		if(source.talentSockets)
			for(const index in source.talentSockets) {
				const oldSocket = source.talentSockets[index];

				source.sockets[index] === undefined
					? source.sockets.push({item: null, type: oldSocket})
					: source.sockets[index].type = oldSocket;
			}

		const {ActionAdvance, CareerAdvance, NonCareerAdvance, NonPrimaryCharacteristicAdvance} = wfrp3e.data.items.career;

		for(const index in source.advances.nonCareer) {
			const nonCareerAdvance = source.advances.nonCareer[index];
			if(!nonCareerAdvance || !(nonCareerAdvance instanceof NonCareerAdvance))
				source.advances.nonCareer[index] = new NonPrimaryCharacteristicAdvance();
		}

		if(source.advances.nonCareer?.length < 2)
			for(let i = 0; i < 2 - source.advances.nonCareer.length; i++)
				source.advances.nonCareer.push(new NonPrimaryCharacteristicAdvance());

		for(const index in source.advances.open) {
			const openAdvance = source.advances.open[index];
			if(!openAdvance || !(openAdvance instanceof CareerAdvance))
				source.advances.open[index] = new ActionAdvance();
		}

		if(source.advances.open?.length < 6)
			for(let i = 0; i < 6 - source.advances.open.length; i++)
				source.advances.open.push(new ActionAdvance());

		return super.migrateData(source);
	}

	/**
	 * Reassigns proper uuids upon cloning a career to have them pointing to the cloned actor-embedded items instead of the old actor ones.
	 * @param {Object} career The career data.
	 * @param {string} newOwnerId The id of the new actor owning the career.
	 */
	static postCloningCleanup(career, newOwnerId)
	{
		this.checkAdvanceUuids(Object.values(career.system.advances), career, newOwnerId);
	}

	/**
	 * Checks the uuid value of a list of advances and replaces the uuid if required.
	 * @param {Array[Object]|Object} advances Either a list of advances or a single advance to check up.
	 * @param {Object} career The career data.
	 * @param {string} newOwnerId The id of the new actor owning the career.
	 * @param {string|null} [formerOwnerId] The id of the former actor owning the career.
	 */
	static checkAdvanceUuids(advances, career, newOwnerId, formerOwnerId = null)
	{
		for(const advance of advances)
			if(Array.isArray(advance))
				this.checkAdvanceUuids(advance, career, newOwnerId, formerOwnerId);
			else if((advance.active || advance.cost) && advance.uuid) {
				if(formerOwnerId === null) {
					formerOwnerId = advance.uuid.match(/^Actor.([\d\w]{16}).Item.[\d\w]{16}$/)[1];

					if(newOwnerId === formerOwnerId)
						return;
				}

				advance.uuid = advance.uuid.replace(formerOwnerId, newOwnerId);
			}
	}

	/**
	 * Getter method to retrieve the total amount of experience spent on the career.
	 * @returns {number} - The total experience spent.
	 */
	get experienceSpent()
	{
		let experienceSpent = this.advances.careerTransition.cost
			+ +this.advances.action.active
			+ +this.advances.skill.active
			+ +this.advances.talent.active
			+ +this.advances.wound.active
			+ (this.advances.dedicationBonus ? 1 : 0)
			+ (this.advances.open?.filter(openAdvance => openAdvance.active)).length;

		for(const nonCareerAdvance of Object.values(this.advances.nonCareer))
			experienceSpent += nonCareerAdvance.cost;

		return experienceSpent;
	}

	/**
	 * A simplified version of the career's array of non-career advances. Useful to update non-career advances.
	 * @returns {Object[]} A simplified version of the career's array of non-career advances.
	 */
	get simpleNonCareerAdvances()
	{
		const nonCareerAdvances = [];
		for(const advance of this.advances.nonCareer)
			nonCareerAdvances.push({...advance._source});

		return nonCareerAdvances;
	}

	/**
	 * A simplified version of the career's array of open advances. Useful to update open advances.
	 * @returns {Object[]} A simplified version of the career's array of open advances.
	 */
	get simpleOpenAdvances()
	{
		const openAdvances = [];
		for(const advance of this.advances.open)
			openAdvances.push({...advance._source});

		return openAdvances;
	}

	/**
	 * The number of open advances of each type still available to buy for a career.
	 * @returns {{action: *, talent: *, skill: *|string, fortune: *, conservative: *, reckless: *, wound: *}}
	 */
	get openAdvancesLeft()
	{
		const advancesLeft = {
			action: this.advanceOptions.action,
			talent: this.advanceOptions.talent,
			skill: this.advanceOptions.skill,
			fortune: this.advanceOptions.fortune,
			conservative: this.advanceOptions.conservative,
			reckless: this.advanceOptions.reckless,
			wound: this.advanceOptions.wound
		}

		for(const openAdvance of this.advances.open)
			if(openAdvance.active)
				advancesLeft[openAdvance.type]--;

		return advancesLeft;
	}

	/**
	 * Buys a new advance on a specific career for the character.
	 * @param {string} type The type of the new advance.
	 * @returns {Promise<void>}
	 */
	async buyAdvance(type)
	{
		const actor = this.parent.parent,
			  careerAdvance = this.advances[type];

		if(!careerAdvance)
			return ui.notifications.error(`Unable to find the advance of type "${type}"`);

		if(actor.system.experience.current <= 0)
			return ui.notifications.warn(game.i18n.localize("CHARACTER.WARNINGS.noExperienceLeft"));

		switch(type) {
			case wfrp3e.data.items.career.CareerAdvance.TYPE:
				if(this.advances.open.findIndex(slot => !slot.active) === -1)
					return ui.notifications.warn(
						"Unable to buy the advance: the career has no available open advance."
					);

				new wfrp3e.applications.apps.CareerAdvanceDialog({
					actor,
					advanceType: type,
					career: this
				}).render({force: true});
				break;

			case wfrp3e.data.items.career.NonCareerAdvance.TYPE:
				if(this.advances.nonCareer.findIndex(slot => !slot.type) == null)
					return ui.notifications.warn(
						"Unable to buy the advance: the career has no available non-career advance."
					);

				if(actor.system.experience.current < 2)
					return ui.notifications.warn(
						game.i18n.localize("CHARACTER.WARNINGS.notEnoughExperienceForNonCareerAdvance")
					);

				new wfrp3e.applications.apps.CareerAdvanceDialog({
					actor,
					advanceType:
					type, career: this
				}).render({force: true});
				break;

			case "dedicationBonus":
				if(this.advances.dedicationBonus)
					return ui.notifications.error("Unable to buy the career's dedication bonus: it is already bought.");

				// Ensure a dedication bonus can only be bought if every advance of the career has been bought.
				if(!this.advances.action.active
					|| !this.advances.talent.active
					|| !this.advances.skill.active
					|| !this.advances.wound.active)
					return ui.notifications.warn(
						game.i18n.localize("CAREER.WARNINGS.dedicationBonusCareerNotCompleted")
					);

				// Fetch the skills that have been trained as a career advance.
				const trainedSkills = [await fromUuid(this.advances.skill.uuid)];
				for(const openAdvance of this.advances.open)
					if(!openAdvance.active)
						return ui.notifications.warn(
							game.i18n.localize("CAREER.WARNINGS.dedicationBonusCareerNotCompleted")
						);
					else
						trainedSkills.push(await fromUuid(openAdvance.uuid));

				// Let the user select one new specialisation for each skill that has been trained as a career advance.*
				const upgrades = await wfrp3e.applications.apps.selectors.SkillUpgrader.wait({
					actor: this,
					items: trainedSkills,
					advanceType: type,
					size: trainedSkills.length
				});

				for(const upgrade of upgrades) {
					const skill        = await fromUuid(upgrade.uuid),
						  propertyPath = "system.specialisations",
						  currentValue = foundry.utils.getProperty(skill, propertyPath);

					if(upgrade.type === "specialisation")
						await skill.update({
							[propertyPath]: currentValue
								? `${currentValue}, ${upgrade.value}`
								: upgrade.value
						});
					else
						return ui.notifications.error(
							`Upgrade of type "specialisation" expected, ${upgrade.type} given.`
						);
				}

				await career.parent.update({"system.advances.dedicationBonus": true});
				break;

			default:
				if(careerAdvance.active || careerAdvance.cost)
					return ui.notifications.error(`Unable to buy the ${type} advance: it is already bought.`);

				await careerAdvance.constructor.buyAdvance(this, false);
				break;
		}
	}

	/**
	 * Calculates the cost of a transition from the actual career to another.
	 * @param {Item} otherCareer The other career.
	 * @returns {number} The cost of the career transition in experience points.
	 */
	calculateCareerTransitionCost(otherCareer)
	{
		let cost = 4;

		if(this.advances.dedicationBonus)
			cost--;

		const careerTraits = this.traits.toLowerCase().split(",").map(trait => trait.trim()),
			  otherCareerTraits = otherCareer.system.traits.toLowerCase().split(",").map(trait => trait.trim());

		for(const trait of careerTraits) {
			if(trait !== game.i18n.localize("TRAITS.specialist") && otherCareerTraits.includes(trait))
				cost--;

			if(cost <= 1)
				break;
		}

		return cost;
	}

	/**
	 * Reassigns proper uuids upon cloning a career to have them pointing to the cloned actor embedded items instead of the old actor ones.
	 * @param {Object} career The career data.
	 * @param {string} newOwnerId The id of the new actor owning the career.
	 */
	static postCloningCleanup(career, newOwnerId)
	{
		this.checkAdvanceUuids(Object.values(career.system.advances), career, newOwnerId);
	}

	/**
	 * Checks the uuid value of a list of advances and replaces the uuid if required.
	 * @param advances A list of advances to check up.
	 * @param {Object} career The career data.
	 * @param {string} newOwnerId The id of the new actor owning the career.
	 * @param {string|null} [formerOwnerId] The id of the former actor owning the career.
	 */
	static checkAdvanceUuids(advances, career, newOwnerId, formerOwnerId = null)
	{
		for(const advance of advances)
			if(Array.isArray(advance))
				this.checkAdvanceUuids(advance, career, newOwnerId, formerOwnerId);
			else if((advance.active || advance.cost) && advance.uuid) {
				if(formerOwnerId === null) {
					formerOwnerId = advance.uuid.match(/^Actor.([\d\w]{16}).Item.[\d\w]{16}$/)[1];

					if(newOwnerId === formerOwnerId)
						return;
				}

				advance.uuid = advance.uuid.replace(formerOwnerId, newOwnerId);
			}
	}
}
