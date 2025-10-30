import Selector from "./selector.mjs";
import {capitalize} from "../../../helpers.mjs";

/**
 * @typedef {Object} FreeItems
 * @property {string|false|null} focus The currently selected Focus talent, null if unselected, false if no free Focus talent is available.
 * @property {string|false|null} reputation The currently selected Reputation talent, null if unselected, false if no free Reputation talent is available.
 * @property {string|false|null} tactic The currently selected Tactic talent, null if unselected, false if no free Tactic talent is available.
 * @property {string|false|null} faith The currently selected Faith talent, null if unselected, false if no free Faith talent is available.
 * @property {string|false|null} order The currently selected Order talent, null if unselected, false if no free Order talent is available.
 * @property {string|false|null} trick The currently selected Trick talent, null if unselected, false if no free Trick talent is available.
 * @property {string|false|null} insanity The currently selected insanity, null if unselected, false if no free insanity is available.
 */

/** @inheritDoc */
export default class TalentSelector extends Selector
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);

		for(const [key, type] of Object.entries(CONFIG.WFRP3e.talentTypes))
			if(options.freeItemTypes?.includes(key))
				this.types[key] = type;
			else if(options.items.find(item => item.system.type === key)){
				this.types[key] = type;
				this.regularTypes.push(key);
			}

		if(Array.isArray(options.freeItemTypes))
			for(const type of options.freeItemTypes) {
				this.freeItems[type] = null;

				if(type === "insanity")
					this.types.insanity = "INSANITY.plural";
			}
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "talent-selector-{id}",
		classes: ["talent-selector"],
		window: {title: "TALENTSELECTOR.title"}
	};

	/** @inheritDoc */
	static PARTS = {
		search: {template: "systems/wfrp3e/templates/applications/apps/selectors/search.hbs"},
		main: {
			template: "systems/wfrp3e/templates/applications/apps/selectors/main.hbs",
			scrollable: [".item-container"]
		},
		selection: {template: "systems/wfrp3e/templates/applications/apps/selectors/talent-selector/selection.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/**
	 * The currently selected free items.
	 * @type {FreeItems}
	 */
	freeItems = {
		focus: false,
		reputation: false,
		tactic: false,
		faith: false,
		order: false,
		tricks: false,
		insanity: false
	};

	/** @inheritDoc */
	type = "talent";

	/**
	 * The talent types that are present among the selectable items.
	 * @type {Object}
	 */
	types = {};

	/**
	 * An array of talent types that are available for regular selection.
	 * @type {Array}
	 */
	regularTypes = [];

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			buttons: [{type: "submit", icon: "fa-solid fa-check", label: "TALENTSELECTOR.ACTIONS.chooseTalent"}]
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		switch(partId) {
			case "main":
				const enrichment = {};
				for(const item of this.items)
					enrichment[item.uuid] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
						item.system.description
					);
				partContext.enrichment = enrichment;

				const freeItems = [];
				for(const uuid of Object.values(this.freeItems))
					if(uuid)
						freeItems.push(await fromUuid(uuid));
				partContext.selection.push(...freeItems);
				break;
			case "search":
				partContext.types = {all: "SELECTOR.all", ...this.types};
				break;
			case "selection":
				partContext.freeItems = {};
				for(const [key, value] of Object.entries(this.freeItems))
					if(value !== false)
						partContext.freeItems[key] = await fromUuid(value);
				break;
		}

		return partContext;
	}

	/** @inheritDoc */
	async _handleNewSelection(value, formConfig, event)
	{
		const item = await fromUuid(value),
			  type = item.system.type ?? item.type,
			  isOfRegularType = this.regularTypes.includes(type),
			  freeItem = this.freeItems[type];

		if(freeItem === false) {
			if(!isOfRegularType)
				throw new Error(`No ${item.system.type ? capitalize(item.system.type) + " " + item.type : item.type} is expected to be selected.`);
			else
				await super._handleNewSelection(value, formConfig, event);
		}
		//#TODO Test and fix this
		else if(freeItem === value) {
			if(!isOfRegularType)
				ui.notifications.warn(game.i18n.localize("SELECTOR.WARNINGS.alreadySelected"));
			else {
				// If the clicked item is already selected as a free item, try to replace it with another item
				// of the same type that is currently selected and pull this very item off of the selection pool.
				let replacementIndex, replacement;
				for(const [index, selection] of this._getSelectedItems())
					if(selection.system.type === item.system.type) {
						replacementIndex = index;
						replacement = selection;
						break;
					}

				if(replacementIndex) {
					this.selection.splice(this.selection[replacementIndex], 1);
					this.freeItems[type] = replacement.uuid;
				}
				// If no replacement is available, deselect the currently selected free item.
				else
					this.freeItems[type] = null;
			}
		}
		else
			this.freeItems[type] = value;
	}

	/** @inheritDoc */
	_checkForWarnings()
	{
		let error = super._checkForWarnings();

		if(error)
			return error;
		else if(this.freeItems.faith === null)
			return "missingFaithTalent";
		else if(this.freeItems.focus === null)
			return "missingFreeFocusTalent";
		else if(this.freeItems.insanity === null)
			return "missingInsanity";
		else if(this.freeItems.order === null)
			return "missingOrderTalent";

		return false;
	}

	/** @inheritDoc */
	_processSelectionData(event, form, formData)
	{
		const selection = super._processSelectionData(event, form, formData),
			  freeItems = [];

		for(const value of Object.values(this.freeItems))
			if(value)
				freeItems.push(value);

		if(freeItems.length > 0)
			return [...selection, ...freeItems];

		return selection;
	}

	/**
	 * Builds an array of talents eligible for an advance, whether non-career or not.
	 * @param {Actor} actor The actor buying the advance.
	 * @param {Item} career The career owning the advance.
	 * @param {boolean} [nonCareerAdvance] Whether the advance is a non-career one or not.
	 * @returns {Promise<Item[]>} An array of talents to select from.
	 */
	static async buildAdvanceOptionsList(actor, career, nonCareerAdvance = false)
	{
		const talentTypeFilter = ["focus", "reputation", "tactic", "tricks"].filter(type => {
				  return career.system.sockets.map(socket => socket.type).includes(type) !== nonCareerAdvance;
			  }),
			  ownedTalentNames = actor.itemTypes.talent.map(talent => talent.name),
			  talents = [];

		for(const pack of game.packs)
			if(pack.documentName === "Item")
				talents.push(
					...await pack.getDocuments({
						type: "talent",
						name__nin: ownedTalentNames,
						system: {type__in: talentTypeFilter}
					})
				);

		return talents;
	}

	/**
	 * Builds an array of talents eligible for a new character.
	 * @param {Actor} character The new character.
	 * @param {Object} options Optional parameters for option list building.
	 * @returns {Promise<Item[]>} An array of talents eligible for a new character.
	 */
	static async buildNewCharacterOptionsList(character, options = {})
	{
		const talentTypeFilter = Object.keys(CONFIG.WFRP3e.talentTypes).filter(type => {
				  return character.system.currentCareer.system.sockets.map(socket => socket.type).includes(type)
					  || options.freeItemTypes?.includes(type);
			  }),
			  itemTypes = ["talent"],
			  items = [];

		if(options.freeItemTypes.includes("insanity"))
			itemTypes.push("insanity");

		for(const pack of game.packs)
			if(pack.documentName === "Item")
				items.push(
					...await pack.getDocuments({
						type__in: itemTypes,
						system: {type__in: talentTypeFilter}
					})
				);

		return items;
	}
}
