import AbstractSelector from "./AbstractSelector.js";

/**
 * @typedef {Object} SkillUpgrade
 * @property {string} type The type of skill upgrade.
 * @property {string} uuid The UUID of the skill to upgrade.
 * @property {string|number|boolean} value The new value of the upgraded skill property.
 */

/** @inheritDoc */
export default class SkillUpgrader extends AbstractSelector
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

		if(options.specialisationSize)
			this.specialisationSize = options.specialisationSize;

		this.singleSpecialisation = options.singleSpecialisation ?? this.singleSpecialisation;
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
	 * @type {WFRP3eActor}
	 */
	actor = null;

	/**
	 * The type of advance concerned by the Skill Upgrader.
	 * @type {string|null}
	 */
	advanceType = null;

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
	 * The number of specialisations to select in addition to the other type of upgrades.
	 * If this number is superior to 0, specialisations will only be added to the specialisation selection,
	 * and not added as regular upgrades anymore.
	 * @type {number}
	 */
	specialisationSize = 0;

	/**
	 * Whether more than one specialisation is allowed for every single skill.
	 * @type {boolean}
	 */
	singleSpecialisation = true;

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
				characteristics: CONFIG.WFRP3e.characteristics,
				advanceType: this.advanceType,
				upgrades
			};
		}
			};

		return partContext;
	}

	/** @inheritDoc */
	async _handleNewSelection(value, formConfig, event)
	{
		const uuid = event.target.dataset.uuid,
			  skill = await fromUuid(event.target.dataset.uuid),
			  type = event.target.dataset.type;
		let cost = 1;

		if(this.advanceType === "nonCareerAdvance")
			cost = skill?.system.advanced ? 4 : 2;

		if(this.actor.system.experience.current < cost)
			return ui.notifications.warn(game.i18n.localize("CHARACTER.WARNINGS.notEnoughExperienceForAdvance"));

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
	 * @param {WFRP3eActor} actor The actor buying the advance.²
	 * @param {WFRP3eItem} career The career owning the advance.
	 * @param {Boolean} [nonCareerAdvance] Whether the advance is a non-career one.
	 * @returns {Promise<WFRP3eItem[]>} An array of skill trainings eligible for an advance.
	 */
	static async buildAdvanceOptionsList(actor, career, nonCareerAdvance = false)
	{
		const skills = await game.packs.get("wfrp3e.items").getDocuments({type: "skill"}),
			  careerSkillNames = career.system.careerSkills.split(",").map(name => name.trim());

		if(nonCareerAdvance) {
			const availableSkills = actor.itemTypes.skill.filter(skill => !careerSkillNames.includes(skill.name)),
				  availableSkillNames = availableSkills.map(skill => skill.name);

			availableSkills.push(...skills.filter(skill => ![...careerSkillNames, ...availableSkillNames].includes(skill.name)));
			return availableSkills;
		}

		return careerSkillNames.map(name => {
			return actor.itemTypes.skill.find(skill => skill.name === name)
				?? skills.find(skill => skill.name === name);
		});
	}
}