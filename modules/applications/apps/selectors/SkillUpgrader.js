import AbstractSelector from "./AbstractSelector.js";

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

		if(options.specialisationSze)
			this.specialisationSze = options.specialisationSze;

		if(options.singleSpecialisation)
			this.singleSpecialisation = options.singleSpecialisation;
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
	 * The WFRP3eActor upgrading one of its characteristics.
	 * @type {WFRP3eActor}
	 */
	actor = null;

	/**
	 * The type of advance concerned by the Selector.
	 * @type {string}
	 */
	advanceType = null;

	/**
	 * The array of selected specialisations.
	 * @type {Object[]}
	 */
	specialisationSelection = [];

	/**
	 * The number of specialisations to select in addition to the other type of upgrades.
	 * If this number is superior to 0, specialisations will only be added to the specialisation selection,
	 * and not added as regular upgrades any more.
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

		if(partId === "main")
			partContext = {
				...partContext,
				characteristics: CONFIG.WFRP3e.characteristics,
				advanceType: this.advanceType,
				upgrades: this.selection.reduce((upgrades, selection) => {
					selection.type in upgrades
						? upgrades[selection.type][selection.uuid] = selection.value
						: upgrades[selection.type] = {[selection.uuid]: selection.value};
					return upgrades;
				}, {})
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
			this.selection = this.selection
				.filter(selection => selection.uuid !== uuid || selection.type !== type);
			this.specialisationSelection = this.specialisationSelection
				.filter(selection => selection.uuid !== uuid || selection.type !== type);

			const remainingSize = this.specialisationSize > 0
					? this.remainingSpecialisationSelectionSize
					: this.remainingSelectionSize,
				  regex = new RegExp(/\s*([A-Za-zÀ-ÖØ-öø-ÿ ]+\b),?/, "gu"),
				  matches = [...value.trim().matchAll(regex)];

			if(remainingSize <= 0)
				ui.notifications.warn(game.i18n.format("SELECTOR.WARNINGS.maximumSelectionSizeReached"));
			else if(matches.length) {
				// If only one new specialisation per skill is allowed, remove the new specialisations following up the first.
				if(this.singleSpecialisation) {
					if(matches.length > 1)
						ui.notifications.warn(game.i18n.format("SKILLUPGRADER.WARNINGS.singleSpecialisationOnly"));

					value = {value: matches[0][1].trim(), type, uuid};
				}
				else {
					if(matches.length > remainingSize)
						ui.notifications.warn(game.i18n.format("SKILLUPGRADER.WARNINGS.maximumSelectionSizeReached"));

					value = matches
						.slice(0, remainingSize - 1)
						.map(match => Object.create({value: match[1].trim(), type, uuid}));
				}
			}

			// If the Skill Upgrader allows additional specialisations alongside advanced skills acquisitions or skill trainings,
			// add the specialisations to their own specific selection pool.
			if(this.specialisationSize > 0) {
				if((typeof value === "object" && this.specialisationSelection.map(selection => JSON.stringify(selection)).includes(JSON.stringify(value)))
					|| this.specialisationSelection.includes(value))
					ui.notifications.warn(game.i18n.localize("SELECTOR.WARNINGS.alreadySelected"));
				else if(this.specialisationSize === 1 && !Array.isArray(value))
					this.specialisationSelection = [value];
				else if(this.remainingSpecialisationSelectionSize < 1
					|| Array.isArray(value) && value.length + this.selection.length > this.remainingSpecialisationSelectionSize)
					ui.notifications.warn(game.i18n.localize("SELECTOR.WARNINGS.maximumSelectionSizeReached"));
				else
					Array.isArray(value) ? this.specialisationSelection.push(...value) : this.specialisationSelection.push(value);
			}
			else if(typeof value === "object")
				super._handleNewSelection(value, formConfig, event);
		}
		else if(typeof value === "object")
			super._handleNewSelection({value, type, uuid}, formConfig, event);
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

	/**
	 * Builds an array of WFRP3eSkill trainings eligible for an advance, whether non-career or not.
	 * @param {WFRP3eActor} actor The WFRP3eActor buying the advance.
	 * @param {WFRP3eItem} career The WFRP3eCareer owning the advance.
	 * @param {Boolean} [nonCareerAdvance] Whether the advance is a non-career one.
	 * @returns {Promise<WFRP3eItem[]>}
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