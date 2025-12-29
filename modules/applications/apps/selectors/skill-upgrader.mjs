import Selector from "./selector.mjs";

/**
 * @typedef {Object} SkillUpgrade
 * @property {"acquisition"|"trainingLevel"|"specialisation"} type The type of skill upgrade.
 * @property {string} uuid The UUID of the skill to upgrade.
 * @property {string|number|boolean} value The new value of the upgraded skill property.
 */

/** @inheritDoc */
export default class SkillUpgrader extends Selector
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);

		if(!options.actor)
			throw new Error("An Actor is needed.");
		this.actor = options.actor;

		if(options.advanceType) {
			this.advanceType = options.advanceType;

			if(this.advanceType === "dedicationBonus")
				this.size = this.items.length;
		}

		if(options.freeAcquisitions)
			this.freeAcquisitions = options.freeAcquisitions;

		if(options.freeTrainings)
			this.freeTrainings = options.freeTrainings;

		if(options.specialisationSize)
			this.specialisationSize = options.specialisationSize;

		this.singleSpecialisation = options.singleSpecialisation ?? this.singleSpecialisation;

		if(options.startingSkillTrainings)
			this.startingSkillTrainings = options.startingSkillTrainings;
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "skill-upgrader-{id}",
		classes: ["skill-upgrader"],
		window: {title: "SKILLUPGRADER.title"},
		position: {width: 800}
	};

	/** @inheritDoc */
	static PARTS = {
		main: {template: "systems/wfrp3e/templates/applications/apps/selectors/skill-upgrader/main.hbs"},
		selection: {template: "systems/wfrp3e/templates/applications/apps/selectors/skill-upgrader/selection.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/**
	 * The actor upgrading their skill.
	 * @type {Actor}
	 */
	actor = null;

	/**
	 * The type of advance concerned by the Skill Upgrader.
	 * @type {string|null}
	 */
	advanceType = null;

	/**
	 * The UUIDs of the skills that will be acquired for free.
	 * @type {string[]}
	 */
	freeAcquisitions = [];


	/**
	 * The UUIDs of the skills that will be trained for free.
	 * @type {string[]}
	 */
	freeTrainings = [];

	/**
	 * The array of selected skill upgrades.
	 * @type {SkillUpgrade[]}
	 */
	selection = [];

	/**
	 * The array of selected specialisations.
	 * @type {Object[]}
	 */
	specialisationSelection = [];

	/**
	 * The number of specialisations to select in addition to the other type of upgrades. If this number is superior to 0, specialisations will only be added to the specialisation selection and not added as regular upgrades any more.
	 * @type {number}
	 */
	specialisationSize = 0;

	/**
	 * Whether more than one specialisation is allowed for every single skill.
	 * @type {boolean}
	 */
	singleSpecialisation = true;

	/**
	 * Whether the Skill Upgrader is used to upgrade starting skill trainings.
	 * @type {boolean}
	 */
	startingSkillTrainings = false;

	/** @inheritDoc */
	type = "skill";

	/**
	 * Returns the number of items remaining to select.
	 * @returns {number}
	 */
	get remainingSpecialisationSelectionSize()
	{
		return this.specialisationSize - this.specialisationSelection.length;
	}

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			buttons: [{type: "submit", icon: "fa-solid fa-check", label: "SKILLUPGRADER.ACTIONS.chooseUpgrade"}]
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partId === "main") {
			const upgrades = {acquisition: {}, trainingLevel: {}, specialisation: {}};
			for(const upgrade of [...this.selection, ...this.specialisationSelection])
				upgrade.type === "specialisation" && upgrade.uuid in upgrades[upgrade.type]
					? upgrades[upgrade.type][upgrade.uuid] += `, ${upgrade.value}`
					: upgrades[upgrade.type][upgrade.uuid] = upgrade.value;

			partContext = {
				...partContext,
				advanceType: this.advanceType,
				characteristics: wfrp3e.data.actors.Actor.CHARACTERISTICS,
				freeAcquisitions: this.freeAcquisitions,
				freeTrainings: this.freeTrainings,
				upgrades
			};
		}
		else if(partId === "selection" && this.specialisationSize > 0)
			partContext = {
				...partContext,
				specialisationCount: this.specialisationSize - this.remainingSpecialisationSelectionSize,
				specialisationSelection: await Promise.all(
					this.specialisationSelection.map(async selection => {
						return {
							...selection,
							item: await fromUuid(selection.uuid)
						};
					})
				),
				specialisationSize: this.specialisationSize
			};

		return partContext;
	}

	/** @inheritDoc */
	async _handleNewSelection(value, formConfig, event)
	{
		const uuid = event.target.dataset.uuid,
			  skill = await fromUuid(event.target.dataset.uuid),
			  type = event.target.dataset.type;

		if(!this.startingSkillTrainings) {
			let cost = 1;

			if(this.advanceType === "nonCareerAdvance")
				cost = skill?.system.advanced ? 4 : 2;

			if(this.actor.system.experience.current < cost)
				return ui.notifications.warn(
					game.i18n.localize("CHARACTER.WARNINGS.notEnoughExperienceForAdvance")
				);
		}

		// If the skill isn't already acquired nor its acquisition upgrade already selected, add an acquisition upgrade.
		if(type === "trainingLevel"
			&& !skill.parent
			&& skill.system.advanced
			&& !this.selection.find(upgrade => upgrade.uuid === uuid && upgrade.type === "acquisition")) {
			if(this.remainingSelectionSize < 2)
				return ui.notifications.warn(game.i18n.format("SKILLUPGRADER.WARNINGS.notEnoughTrainings"));

			await super._handleNewSelection({value: "0", type: "acquisition", uuid}, formConfig, event);
		}

		if(type === "specialisation") {
			// Remove any specialisation upgrade for the concerned skill that already exists in any selection.
			this.selection = this.selection.filter(upgrade => {
				return upgrade.uuid !== uuid || upgrade.type !== type
			});
			this.specialisationSelection = this.specialisationSelection.filter(upgrade => {
				return upgrade.uuid !== uuid || upgrade.type !== type
			});

			let remainingSize, selection;
			if(this.specialisationSize > 0) {
				remainingSize = this.remainingSpecialisationSelectionSize;
				selection = this.specialisationSelection;
			}
			else {
				remainingSize = this.remainingSelectionSize;
				selection = this.selection;
			}

			const regex = new RegExp(/\s*([A-Za-zÀ-ÖØ-öø-ÿ ]+\b),?/, "gu"),
				  matches = [...value.trim().matchAll(regex)];

			if(remainingSize <= 0)
				ui.notifications.warn(game.i18n.format("SELECTOR.WARNINGS.maximumSelectionSizeReached"));
			else if(matches.length) {
				// If only one new specialisation per skill is allowed, only keep the first.
				if(this.singleSpecialisation) {
					if(matches.length > 1)
						ui.notifications.warn(game.i18n.format("SKILLUPGRADER.WARNINGS.singleSpecialisationOnly"));

					value = {value: matches[0][1].trim(), type, uuid};

					selection.push(value);
				}
				// Else, remove excess specialisations and keep the rest.
				else {
					if(matches.length > remainingSize) {
						ui.notifications.warn(game.i18n.format("SKILLUPGRADER.WARNINGS.maximumSelectionSizeReached"));
						matches.slice(0, remainingSize - 1);
					}

					const values = [];
					for(const match of matches) {
						const specialisation = match[1].trim();

						if(values.includes(specialisation))
							return ui.notifications.warn(game.i18n.format("SKILLUPGRADER.WARNINGS.duplicateSpecialisation"));

						values.push({value: specialisation, type, uuid});
					}

					selection.push(...values);
				}
			}
		}
		else
			await super._handleNewSelection({value, type, uuid}, formConfig, event);
	}

	/** @inheritDoc */
	_deselect(value)
	{
		super._deselect(value);

		const upgradeTypesToExclude = ["specialisation"];

		if(value.type === "acquisition")
			upgradeTypesToExclude.push("trainingLevel");

		for(const upgrade of this.selection)
			if(upgrade.uuid === value.uuid && upgradeTypesToExclude.includes(upgrade.type))
				this.selection.splice(this.selection.indexOf(upgrade), 1);

		for(const upgrade of this.specialisationSelection)
			if(upgrade.uuid === value.uuid && upgradeTypesToExclude.includes(upgrade.type))
				this.specialisationSelection.splice(this.selection.indexOf(upgrade), 1);
	}

	/** @inheritDoc */
	async _getSelectedItems()
	{
		return await Promise.all(
			this.selection.map(selection => {
				return {
					...selection,
					item: fromUuidSync(selection.uuid)
				};
			})
		);
	}

	/** @inheritDoc */
	_checkForError()
	{
		let error = super._checkForWarning();

		if(error)
			return error;
		else if(this.remainingSpecialisationSelectionSize < 0)
			return "tooManySpecialisationSelected";

		return false;
	}

	/** @inheritDoc */
	_checkForWarning()
	{
		let error = super._checkForWarning();

		if(error)
			return error;
		else if(this.remainingSpecialisationSelectionSize !== 0)
			return "notEnoughSelection";

		return false;
	}

	/** @inheritDoc */
	_processSelectionData(event, form, formData)
	{
		const selection = super._processSelectionData(event, form, formData);

		if(this.specialisationSelection)
			return [...selection, ...this.specialisationSelection];

		return selection;
	}

	/**
	 * Builds an array of skill trainings eligible for an advance, whether non-career or not.
	 * @param {Actor} actor The actor buying the advance.²
	 * @param {Item} career The career owning the advance.
	 * @param {boolean} [nonCareerAdvance] Whether the advance is a non-career one.
	 * @returns {Promise<Item[]>} An array of skill trainings eligible for an advance.
	 */
	static async buildAdvanceOptionsList(actor, career, nonCareerAdvance = false)
	{
		const packSkills = await game.packs.get("wfrp3e.items").getDocuments({type: "skill"}),
			  careerSkillNames = career.system.careerSkills.split(",").map(name => name.trim());

		if(nonCareerAdvance) {
			const availableSkills = [],
				  availableSkillNames = [];

			for(const skill of actor.itemTypes.skill)
				if(!careerSkillNames.includes(skill.name)) {
					availableSkills.push(skill);
					availableSkillNames.push(skill.name);
				}

			for(const skill of packSkills)
				if(!availableSkillNames.includes(skill.name))
					availableSkills.push(skill);

			return availableSkills;
		}

		return careerSkillNames.map(name => {
			return actor.itemTypes.skill.find(skill => skill.name === name)
				?? packSkills.find(skill => skill.name === name);
		});
	}

	/**
	 * Builds an array of skill trainings eligible for a new character.
	 * @param {Actor} actor The new character.
	 * @returns {Promise<Item[]>} An array of skill trainings eligible for a new character.
	 */
	static async buildNewCharacterOptionsList(actor)
	{
		const skills = await game.packs.get("wfrp3e.items").getDocuments({type: "skill"}),
			  careerSkillNames = actor.system.currentCareer.system.careerSkills.split(",").map(name => name.trim());

		return careerSkillNames.map(name => {
			return actor.itemTypes.skill.find(skill => skill.name === name)
				?? skills.find(skill => skill.name === name);
		});
	}

	/**
	 * Sorts upgrades in arrays by skill, each array starting with acquisition upgrades, followed by training level upgrades, to finish with specialisation upgrades.
	 * @param {SkillUpgrade[]} upgrades The skill upgrades to sort.
	 * @returns {SkillUpgrade[]} The skill upgrades sorted by type.
	 */
	static sortUpgrades(upgrades)
	{
		const order = {acquisition: 0, trainingLevel: 1, specialisation: 2},
			  sortedUpgrades = {};

		for(const upgrade of upgrades.sort((a, b) => order[a.type] - order[b.type])) {
			if(!(upgrade.uuid in sortedUpgrades))
				sortedUpgrades[upgrade.uuid] = [];
			sortedUpgrades[upgrade.uuid].push(upgrade);
		}

		return sortedUpgrades;
	}
}
