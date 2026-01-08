/** @inheritDoc */
export default class CharacterGenerator extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	constructor(options = {})
	{
		super(options);

		if(!options.character)
			throw new Error("A persisted character is needed for the Character Generator.");
		this.character = options.character;
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			acquireActionCards: this.#acquireActionCards,
			acquireSkillTrainings: this.#acquireSkillTrainings,
			acquireTalents: this.#acquireTalents,
			chooseStartingCareer: this.#chooseStartingCareer,
			chooseOrigin: this.#chooseOrigin,
			investCreationPoints: this.#investCreationPoints,
			playGameOfTenQuestions: this.#playGameOfTenQuestions
		},
		id: "character-generator-{id}",
		classes: ["wfrp3e", "character-generator"],
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			title: "CHARACTERGENERATOR.title"
		},
		form: {
			handler: this.#onCharacterGeneratorSubmit,
			submitOnChange: false,
			closeOnSubmit: true
		},
		position: {
			height: 860,
			width: 920
		}
	};

	/** @inheritDoc */
	static PARTS = {
		buttons: {template: "systems/wfrp3e/templates/applications/sidebar/apps/character-generator/buttons.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		origin: {template: "systems/wfrp3e/templates/applications/sidebar/apps/character-generator/origin.hbs"},
		career: {template: "systems/wfrp3e/templates/applications/sidebar/apps/character-generator/career.hbs"},
		attributes: {template: "systems/wfrp3e/templates/applications/sidebar/apps/character-generator/attributes.hbs"},
		skills: {
			template: "systems/wfrp3e/templates/applications/sidebar/apps/character-generator/skills.hbs",
			scrollable: [".table-body"]
		},
		talents: {
			template: "systems/wfrp3e/templates/applications/sheets/actors/talents.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		actions: {
			template: "systems/wfrp3e/templates/applications/sheets/actors/actions.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		background: {template: "systems/wfrp3e/templates/applications/sheets/actors/character-sheet/background.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		main: {
			tabs: [
				{id: "origin"},
				{id: "career"},
				{id: "attributes"},
				{id: "skills"},
				{id: "talents"},
				{id: "actions"},
				{id: "background"}
			],
			initial: "origin",
			labelPrefix: "CHARACTERGENERATOR.TABS"
		}
	};

	/**
	 * The current selection of Creation Points investments.
	 * @type {CreationPointInvestments}
	 */
	creationPointInvestments = {
		characteristics: {
			strength: 2,
			toughness: 2,
			agility: 2,
			intelligence: 2,
			willpower: 2,
			fellowship: 2
		},
		wealth: 0,
		skills: 0,
		talents: 0,
		actionCards: 0
	};

	/**
	 * The state of each step in the Character Generator (*true* if done, false otherwise).
	 * @type {{chooseOrigin: boolean, chooseStartingCareer: boolean, investCreationPoints: boolean, acquireSkillTrainings: boolean, acquireTalents: boolean, acquireActionCards: boolean, gameOfTenQuestions: boolean}}
	 */
	steps = {
		chooseOrigin: false,
		chooseStartingCareer: false,
		investCreationPoints: false,
		acquireSkillTrainings: false,
		acquireTalents: false,
		acquireActionCards: false,
		gameOfTenQuestions: false
	};

	/** @inheritDoc */
	async _prepareContext(options)
	{
		const character = this.character;

		return {
			...await super._prepareContext(options),
			document: character,
			source: character._source,
			fields: character.schema.fields,
			user: game.user,
			rootId: character.collection?.has(character.id) ? this.id : foundry.utils.randomID(),
			buttons: [{type: "submit", icon: "fa-solid fa-save", label: "CHARACTERGENERATOR.ACTIONS.submit"}],
			system: this.character.system
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partContext.tabs && partId in partContext.tabs)
			partContext.tab = partContext.tabs[partId];

		const character = this.character;
		switch(partId) {
			case "buttons":
				partContext.steps = this.steps;
				break;
			case "origin":
				const originData = character.system.originData;
				partContext = {
					...partContext,
					origin: originData,
					originAbilities: await Promise.all(originData.abilities.map(async uuid => await fromUuid(uuid))),
					race: character.system.race,
					step: this.steps.chooseOrigin
				};
				break;
			case "attributes":
				partContext = {
					...partContext,
					characteristics: wfrp3e.data.actors.Actor.CHARACTERISTICS,
					fields: character.system.schema.fields,
				};
				break;
			case "skills":
				partContext = {
					...partContext,
					skills: character.itemTypes.skill.sort((a, b) => a.name.localeCompare(b.name))
				};
				break;
			case "career":
				partContext = {
					...partContext,
					career: character.system.currentCareer,
					characteristics: wfrp3e.data.actors.Actor.CHARACTERISTICS,
					fields: character.system.schema.fields
				};
				break;
			case "talents":
				partContext = {
					...partContext,
					fields: character.system.schema.fields,
					items: [...character.itemTypes.talent, ...character.itemTypes.ability]
						.sort((a, b) => a.name.localeCompare(b.name))
				};
				break;
			case "actions":
				partContext = {
					...partContext,
					actions: character.itemTypes.action.sort((a, b) => a.name.localeCompare(b.name)),
					defaultStance: character.system.defaultStance,
					fields: character.system.schema.fields,
					stances: wfrp3e.data.actors.Actor.STANCES,
					symbols: wfrp3e.dice.terms.Die.SYMBOLS
				};
				break;
			case "background":
				partContext = {
					...partContext,
					enriched: {
						campaignNotes: await foundry.applications.ux.TextEditor.enrichHTML(
							character.system.background.campaignNotes
						),
						biography: await foundry.applications.ux.TextEditor.enrichHTML(
							character.system.background.biography
						)
					},
					fields: character.system.schema.fields.background.fields,
					system: character.system.background
				};
				break;
		}

		return partContext;
	}

	/** @inheritDoc */
	_prepareTabs(group)
	{
		let tabs = [];

		const character = this.character;
		tabs = super._prepareTabs(group);

		if(!this.steps.chooseOrigin)
			tabs.origin.cssClass += " hidden";

		if(!this.steps.investCreationPoints)
			tabs.attributes.cssClass += " hidden";

		if(!this.steps.gameOfTenQuestions)
			tabs.background.cssClass += " hidden";

		if((character.itemTypes.ability.length + character.itemTypes.talent.length) <= 0)
			tabs.talents.cssClass += " hidden";

		if(character.itemTypes.action.length <= 0)
			tabs.actions.cssClass += " hidden";

		if(character.itemTypes.career.length <= 0)
			tabs.career.cssClass += " hidden";

		if(character.itemTypes.skill.length <= 0)
			tabs.skills.cssClass += " hidden";

		return tabs;
	}

	/**
	 * Undo the changes made after the creation point investments step.
	 * @returns {Promise<void>}
	 */
	async resetCreationPointInvestments()
	{
		const character = this.character,
			  race = character.system.race,
			  characteristics = {};

		this.creationPointInvestments = {
			characteristics: {},
			wealth: 0,
			skills: 0,
			talents: 0,
			actions: 0
		};

		for(const [characteristic, rating] of Object.entries(race.defaultRatings)) {
			characteristics[characteristic] = {rating};
			this.creationPointInvestments.characteristics[characteristic] = rating;
		}

		await character.update({
			system: {
				characteristics,
				corruption: {max: 7},
				wounds: {
					max: 10,
					value: 10
				}
			}
		});

		this.steps.investCreationPoints = false;
	}

	/**
	 * Undo the changes made after the origin step.
	 * @returns {Promise<void>}
	 */
	async resetOrigin()
	{
		const character = this.character;
		if(character.itemTypes.ability.length) {
			await wfrp3e.documents.Item.deleteDocuments(
				character.itemTypes.ability.map(ability => ability._id),
				{parent: character}
			);

			this.steps.chooseOrigin = false;
		}
	}

	/**
	 * Undo the changes made after the starting action cards step.
	 * @returns {Promise<void>}
	 */
	async resetStartingActionCards()
	{
		const character = this.character;
		if(character.itemTypes.action.length) {
			await wfrp3e.documents.Item.deleteDocuments(character.itemTypes.action.map(action => action._id), {parent: character});
			this.steps.acquireActionCards = false;
		}
	}

	/**
	 * Undo the changes made after the starting career step.
	 * @returns {Promise<void>}
	 */
	async resetStartingCareer()
	{
		const character = this.character;
		if(character.itemTypes.career.length) {
			await wfrp3e.documents.Item.deleteDocuments(character.itemTypes.career.map(career => career._id), {parent: character});
			this.steps.chooseStartingCareer = false;
		}
	}

	/**
	 * Undo the changes made after the starting skill trainings step.
	 * @returns {Promise<void>}
	 */
	async resetStartingSkillTrainings()
	{
		const character = this.character;
		if(character.itemTypes.skill.length) {
			await wfrp3e.documents.Item.deleteDocuments(character.itemTypes.skill.map(skill => skill._id), {parent: character});
			this.steps.acquireSkillTrainings = false;
		}
	}

	/**
	 * Undo the changes made after the starting talents step.
	 * @returns {Promise<void>}
	 */
	async resetStartingTalents()
	{
		const character = this.character;
		if(character.itemTypes.talent.length || character.itemTypes.insanity.length) {
			await wfrp3e.documents.Item.deleteDocuments([
				character.itemTypes.insanity.map(insanity => insanity._id),
				character.itemTypes.talent.map(talent => talent._id)
			], {parent: character});

			this.steps.acquireTalents = false;
		}
	}

	/**
	 * Spawns a Character Generator and creates a new character to generate.
	 * @param {ApplicationConfiguration} [config] Configuration of the Character Generator instance
	 * @returns {Promise<any>} Resolves to the selected item(s). If the dialog was dismissed, the Promise resolves to null.
	 */
	static async start(config = {})
	{
		const name = game.i18n.localize("CHARACTERGENERATOR.newCharacter"),
			  character = await wfrp3e.documents.Actor.create({
				  name,
				  type: "character",
				  prototypeToken: {name}
			  }),
			  characterGenerator = new this({character, ...config});

		await characterGenerator.render({force: true});
	}

	/**
	 * Processes Character Generator submission to complete a new character creation.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #onCharacterGeneratorSubmit(event, form, formData)
	{
		let proceed = true;

		if(Object.values(this.steps).includes(false))
			proceed = await foundry.applications.api.DialogV2.confirm({
				window: {title: game.i18n.localize("CHARACTERGENERATOR.WARNINGS.unfinishedGeneration.title")},
				modal: true,
				content: game.i18n.localize("CHARACTERGENERATOR.WARNINGS.unfinishedGeneration.description")
			});

		if(proceed)
			await this.character.render({force: true});
	}

	/**
	 * Shows a game of 20 questions to edit the new character's background.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #playGameOfTenQuestions(event, target)
	{
		event.preventDefault();

		const answers = await wfrp3e.applications.apps.GameOfTenQuestions.wait();
		this.character.update({"system.background.biography": Object.values(answers).join()});

		this.steps.gameOfTenQuestions = true;
		this.changeTab("background", "main");
		await this.render();
	}

	/**
	 * Shows an Action Selector to select the new character's starting action cards.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #acquireActionCards(event, target)
	{
		event.preventDefault();
		await this.resetStartingActionCards();

		const {ActionSelector} = wfrp3e.applications.apps.selectors,
			  character = this.character,
			  investment = wfrp3e.applications.apps.CreationPointInvestor.INVESTMENTS.actionCards[this.creationPointInvestments.actionCards];
		let actionUuids = await ActionSelector.wait({
			actor: character,
			items: await ActionSelector.buildOptionsList(character, {basic: false}),
			modal: true,
			size: investment.size
		});

		if(actionUuids) {
			if(!Array.isArray(actionUuids))
				actionUuids = [actionUuids];

			const basicActions = [],
				  ownedActionNames = character.itemTypes.action.map(action => action.name),
				  foundActions = await game.packs.get("wfrp3e.items").getDocuments({type: "action"});

			for(const action of foundActions)
				if(action.system.reckless.traits.includes(game.i18n.localize("TRAITS.basic"))
					&& await action.checkRequirements({actor: character})
					&& !ownedActionNames.includes(action.name))
					basicActions.push(action);

			await wfrp3e.documents.Item.createDocuments([
				...basicActions,
				...await Promise.all(actionUuids.map(async uuid => await fromUuid(uuid)))
			], {parent: character});

			this.steps.acquireActionCards = true;
			this.changeTab("actions", "main");
		}

		await this.render();
	}

	/**
	 * Shows a Skill Upgrader to select the new character's starting skill trainings and specialisations.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #acquireSkillTrainings(event, target)
	{
		event.preventDefault();
		await this.resetStartingActionCards();
		await this.resetStartingSkillTrainings();

		const {SkillUpgrader} = wfrp3e.applications.apps.selectors,
			  character = this.character,
			  investment = wfrp3e.applications.apps.CreationPointInvestor.INVESTMENTS.skills[this.creationPointInvestments.skills],
			  options = {freeAcquisitions: [], freeTrainings: []};

		for(const effect of character.findTriggeredEffects(wfrp3e.data.macros.StartingSkillTrainingSelectionMacro.TYPE))
			await effect.triggerMacro({options});

		const upgrades = await SkillUpgrader.wait({
				  ...options,
				  actor: character,
				  items: await SkillUpgrader.buildNewCharacterOptionsList(character),
				  modal: true,
				  size: investment.size,
				  specialisationSize: investment.specialisationSize,
				  singleSpecialisation: false,
				  startingSkillTrainings: true
			  }),
			  skills = await game.packs.get("wfrp3e.items").getDocuments({
				  type: "skill",
				  system: {advanced: false}
			  });

		if(skills) {
			for(const [uuid, upgradeArray] of Object.entries(SkillUpgrader.sortUpgrades(upgrades))) {
				const changes = {system: {}};
				let index = skills.findIndex(skill => skill.uuid === uuid),
					skill = skills[index];

				for(const upgrade of upgradeArray) {
					switch(upgrade.type) {
						case "acquisition":
							skill = await fromUuid(uuid);
							break;
						case "trainingLevel":
							changes.system.trainingLevel = upgrade.value;
							break;
						case "specialisation":
							changes.system.specialisations =
								(skill.system.specialisations ? skill.system.specialisations + ", " : "")
								+ (changes.system.specialisations ? changes.system.specialisations + ", " : "")
								+ upgrade.value;
							break;
					}
				}

				// Replace the original skill with the upgraded version.
				index !== -1
					? skills.splice(index, 1, skill.clone(changes, {keepId: true}))
					: skills.push(skill.clone(changes, {keepId: true}));
			}

			await wfrp3e.documents.Item.createDocuments(skills, {parent: character});

			this.steps.acquireSkillTrainings = true;
			this.changeTab("skills", "main");
		}

		await this.render();
	}

	/**
	 * Shows a Talent Selector to select the new character's starting talents.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #acquireTalents(event, target)
	{
		event.preventDefault();

		const character = this.character,
			  onStartingTalentSelectionEffects = character.findTriggeredEffects(wfrp3e.data.macros.StartingTalentSelectionMacro.TYPE);

		if(+this.creationPointInvestments.talents === 0 && !onStartingTalentSelectionEffects.length)
			return ui.notifications.warn(game.i18n.localize("CHARACTERGENERATOR.WARNINGS.noStartingTalent"));

		await this.resetStartingActionCards();
		await this.resetStartingTalents();

		const {TalentSelector} = wfrp3e.applications.apps.selectors,
			  investment = wfrp3e.applications.apps.CreationPointInvestor.INVESTMENTS.talents[this.creationPointInvestments.talents],
			  options = {freeItemTypes: []};

		for(const effect of onStartingTalentSelectionEffects)
			await effect.triggerMacro({options});

		options.items = await TalentSelector.buildNewCharacterOptionsList(character, {
			...options,
			actor: character,
			modal: true,
			size: investment.size,
			freeItemTypes: []
		});

		let talentUuids = await TalentSelector.wait(options);

		if(talentUuids) {
			if(!Array.isArray(talentUuids))
				talentUuids = [talentUuids];

			await wfrp3e.documents.Item.createDocuments(
				await Promise.all(talentUuids.map(async uuid => await fromUuid(uuid))),
				{parent: character}
			);

			this.steps.acquireTalents = true;
			this.changeTab("talents", "main");
		}

		await this.render();
	}

	/**
	 * Shows a Career Selector to select the new character's starting career.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #chooseStartingCareer(event, target)
	{
		event.preventDefault();
		await this.resetStartingActionCards();
		await this.resetStartingSkillTrainings();
		await this.resetStartingTalents();
		await this.resetCreationPointInvestments();
		await this.resetStartingCareer();

		const {CareerSelector} = wfrp3e.applications.apps.selectors,
			  character = this.character,
			  careerUuids = await CareerSelector.wait({
				  items: await CareerSelector.buildStartingCareerList(character),
				  modal: true
			  });

		if(careerUuids[0]) {
			const career = await fromUuid(careerUuids[0]);

			await wfrp3e.documents.Item.createDocuments(
				[career.clone({"system.current": true}, {keepId: true})],
				{parent: character}
			);

			this.steps.chooseStartingCareer = true;
			this.changeTab("career", "main");
		}

		await this.render();
	}

	/**
	 * Shows an Origin Selector to select the new character's origin.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #chooseOrigin(event, target)
	{
		event.preventDefault();
		await this.resetStartingActionCards();
		await this.resetStartingTalents();
		await this.resetStartingSkillTrainings();
		await this.resetCreationPointInvestments();
		await this.resetStartingCareer();
		await this.resetOrigin();

		const {OriginSelector} = wfrp3e.applications.apps.selectors,
			  character = this.character;

		await character.update({
			"system.origin": await OriginSelector.wait({
				items: await OriginSelector.buildRaceList(),
				modal: true
			})
		});

		await wfrp3e.documents.Item.createDocuments(
			await Promise.all(character.system.originData.abilities.map(async uuid => await fromUuid(uuid))),
			{parent: character}
		);

		this.steps.chooseOrigin = true;
		this.changeTab("origin", "main");
		await this.render();
	}

	/**
	 * Shows a Creation Point Investor to invest the new character's creation points.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #investCreationPoints(event, target)
	{
		event.preventDefault();
		await this.resetStartingActionCards();
		await this.resetStartingTalents();
		await this.resetStartingSkillTrainings();
		await this.resetCreationPointInvestments();

		const character = this.character,
			  options = {startingCreationPoints: 20};

		for(const effect of character.findTriggeredEffects(wfrp3e.data.macros.CreationPointInvestmentMacro.TYPE))
			await effect.triggerMacro({options});

		const investments = await wfrp3e.applications.apps.CreationPointInvestor.wait({
			...options,
			race: character.system.race,
			modal: true
		});

		if(investments) {
			const originData = character.system.originData,
				  characteristicRatings = investments.characteristics,
				  characteristics = {};

			for(const [key, rating] of Object.entries(characteristicRatings))
				characteristics[key] = {rating};

			await character.update({
				system: {
					characteristics,
					corruption: {max: characteristicRatings.toughness + originData.corruption},
					wounds: {
						max: characteristicRatings.toughness + originData.wound,
						value: characteristicRatings.toughness + originData.wound
					}
				}
			});

			this.creationPointInvestments = investments;
			this.steps.investCreationPoints = true;
			this.steps.acquireTalents = +investments.talents === 0 && !character.findTriggeredEffects(wfrp3e.data.macros.StartingTalentSelectionMacro.TYPE).length;
			this.changeTab("attributes", "main");
		}

		await this.render();
	}
}
