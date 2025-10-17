import OriginSelector from "../../apps/selectors/OriginSelector.js";
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
		actions: {chooseOrigin: this.#chooseOrigin},
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
}
