import CreationPointInvestor from "../../apps/CreationPointInvestor.js";
import CareerSelector from "../../apps/selectors/CareerSelector.js";
import OriginSelector from "../../apps/selectors/OriginSelector.js";
import SkillUpgrader from "../../apps/selectors/SkillUpgrader.js";
import WFRP3eActor from "../../../documents/WFRP3eActor.js";
import WFRP3eItem from "../../../documents/WFRP3eItem.js";

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
			acquireSkillTrainings: this.#acquireSkillTrainings,
			chooseStartingCareer: this.#chooseStartingCareer,
			chooseOrigin: this.#chooseOrigin,
			investCreationPoints: this.#investCreationPoints
		},
		id: "character-generator-{id}",
		classes: ["wfrp3e", "character-generator", "character"],
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
		attributes: {
			template: "systems/wfrp3e/templates/applications/sheets/actors/character-sheet/attributes.hbs",
			scrollable: [".table-body"]
		},
		careers: {
			template: "systems/wfrp3e/templates/applications/sheets/actors/character-sheet/careers.hbs",
			scrollable: [".item-container"]
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
		sheet: {
			tabs: [
				{id: "attributes"},
				{id: "careers"},
				{id: "talents"},
				{id: "actions"},
				{id: "background"}
			],
			initial: "attributes",
			labelPrefix: "CHARACTER.TABS"
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
	 * @type {{chooseOrigin: boolean, chooseStartingCareer: boolean, investCreationPoints: boolean, acquireSkillTrainings: boolean, acquireTalents: boolean, acquireActionCards: boolean}}
	 */
	steps = {
		chooseOrigin: false,
		chooseStartingCareer: false,
		investCreationPoints: false,
		acquireSkillTrainings: false,
		acquireTalents: false,
		acquireActionCards: false
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
			case "attributes":
				partContext = {
					...partContext,
					character,
					characteristics: CONFIG.WFRP3e.characteristics,
					fields: character.system.schema.fields,
					skills: character.itemTypes.skill.sort((a, b) => a.name.localeCompare(b.name))
				};
				break;
			case "careers":
				const sortedCareers = character.itemTypes.career.sort((a, b) => a.name.localeCompare(b.name));

				partContext = {
					...partContext,
					careers: sortedCareers,
					characteristics: CONFIG.WFRP3e.characteristics,
					fields: character.system.schema.fields,
					tabs: this._prepareTabs(partId)
				};
				break;
			case "talents":
				partContext = {
					...partContext,
					fields: character.system.schema.fields,
					items: [...character.itemTypes.talent, ...character.itemTypes.ability]
						.sort((a, b) => a.name.localeCompare(b.name)),
					searchFilters: this.searchFilters?.talents,
					socketsByType: await character.buildSocketList(),
					types: {
						all: "ACTOR.SHEET.all",
						ability: "ABILITY.plural",
						...CONFIG.WFRP3e.talentTypes
					}
				};
				break;
			case "actions":
				partContext = {
					...partContext,
					actions: character.itemTypes.action.sort((a, b) => a.name.localeCompare(b.name)),
					defaultStance: character.system.defaultStance,
					fields: character.system.schema.fields,
					searchFilters: this.searchFilters?.actions,
					stances: CONFIG.WFRP3e.stances,
					symbols: CONFIG.WFRP3e.symbols,
					types: {
						all: "ACTOR.SHEET.all",
						...CONFIG.WFRP3e.actionTypes
					}
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
		if(group === "sheet") {
			tabs = super._prepareTabs(group);

			if((character.itemTypes.ability.length + character.itemTypes.talent.length) <= 0)
				tabs.talents.cssClass += " hidden";

			if(character.itemTypes.action.length <= 0)
				tabs.actions.cssClass += " hidden";

			if(character.itemTypes.career.length <= 0)
				tabs.careers.cssClass += " hidden";
		}
		else if(group === "careers") {
			for(const [index, career] of character.itemTypes.career.entries()) {
				let tab = {
					id: career.id,
					group: group,
					label: career.name
				};

				if(career.system.current)
					tab.icon = "fa fa-check";

				if(career.system.current || index === 0 && !character.system.currentCareer) {
					tab = {
						...tab,
						active: true,
						cssClass: "active"
					};
				}

				tabs.push(tab);
			}
		}

		return tabs;
	}

	/**
	 * Spawns a Character Generator and creates a new character to generate.
	 * @param {ApplicationConfiguration} [config] Configuration of the Character Generator instance
	 * @returns {Promise<any>} Resolves to the selected item(s). If the dialog was dismissed, the Promise resolves to null.
	 */
	static async start(config = {})
	{
		const name = game.i18n.localize("CHARACTERGENERATOR.newCharacter"),
			  character = await WFRP3eActor.create({
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
	 * @private
	 */
	static async #onCharacterGeneratorSubmit(event, form, formData)
	{
		await this.character.render({force: true});
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

		const character = this.character;
		if(character.itemTypes.skill.length)
			await WFRP3eItem.deleteDocuments(
				character.itemTypes.skill.map(skill => skill._id),
				{parent: character}
			);

		const investment = CONFIG.WFRP3e.creationPointInvestments.skills[this.creationPointInvestments.skills],
			  options = {
				  actor: character,
				  items: await SkillUpgrader.buildNewCharacterOptionsList(character),
				  modal: true,
				  size: investment.size,
				  specialisationSize: investment.specialisationSize,
				  singleSpecialisation: false,
				  startingSkillTrainings: true
			  };

		const upgrades = await SkillUpgrader.wait(options),
			  skills = await game.packs.get("wfrp3e.items").getDocuments({
				  type: "skill",
				  system: {advanced: false}
			  });

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

		await WFRP3eItem.createDocuments(skills, {parent: character});

		this.steps.acquireSkillTrainings = true;
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

		const character = this.character;
		if(character.itemTypes.career.length)
			await WFRP3eItem.deleteDocuments(
				character.itemTypes.career.map(career => career._id),
				{parent: character}
			);

		const careerUuid = await CareerSelector.wait({
				  items: await CareerSelector.buildStartingCareerList(character),
				  modal: true
			  }),
			  career = await fromUuid(careerUuid);

		await WFRP3eItem.createDocuments(
			[career.clone({"system.current": true}, {keepId: true})],
			{parent: character}
		);

		this.steps.chooseStartingCareer = true;
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

		const character = this.character;
		if(character.itemTypes.ability.length)
			await WFRP3eItem.deleteDocuments(
				character.itemTypes.ability.map(ability => ability._id),
				{parent: character}
			);

		await character.update({
			"system.origin": await OriginSelector.wait({
				items: await OriginSelector.buildRaceList(),
				modal: true
			})
		});

		await WFRP3eItem.createDocuments(
			await Promise.all(character.system.originData.abilities.map(async uuid => await fromUuid(uuid))),
			{parent: character}
		);

		this.steps.chooseOrigin = true;
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

		const character = this.character,
			  options = {
				  modal: true,
				  race: character.system.race,
				  startingCreationPoints: 20
			  };

		for(const effect of character.findTriggeredEffects("onCreationPointInvestment"))
			await effect.triggerEffect({
				parameters: [options],
				parameterNames: ["options"]
			});

		const investments = await CreationPointInvestor.wait(options),
			  originData = character.system.originData,
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
		await this.render();
	}
}
