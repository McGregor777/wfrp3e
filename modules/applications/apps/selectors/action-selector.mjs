import Selector from "./selector.mjs";

/** @inheritDoc */
export default class ActionSelector extends Selector
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);

		for(const [key, type] of Object.entries(CONFIG.WFRP3e.actionTypes))
			if(options.items.find(action => action.system.type === key))
				this.types[key] = type;
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "action-selector-{id}",
		actions: {flip: this.#flip},
		classes: ["action-selector"],
		window: {title: "ACTIONSELECTOR.title"},
		position: {width: 940}
	};

	/** @inheritDoc */
	type = "action";

	/**
	 * The type of actions that are present among the selectable items.
	 * @type {Object}
	 */
	types = {};


	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			buttons: [{type: "submit", icon: "fa-solid fa-check", label: "ACTIONSELECTOR.ACTIONS.chooseAction"}]
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		switch(partId) {
			case "main":
				const textEditor = foundry.applications.ux.TextEditor.implementation,
					  basicTrait = game.i18n.localize("TRAITS.basic"),
					  enrichment = {};
				for(const action of this.items)
					for(const stance of Object.keys(CONFIG.WFRP3e.stances)) {
						if(action.system[stance].requirements)
							enrichment[`${action.uuid}-${stance}.requirements`] = await textEditor.enrichHTML(
								action.system[stance].requirements
							);

						if(action.system[stance].special)
							enrichment[`${action.uuid}-${stance}.special`] = await textEditor.enrichHTML(
								action.system[stance].special
							);

						if(action.system[stance].uniqueEffect)
							enrichment[`${action.uuid}-${stance}.uniqueEffect`] = await textEditor.enrichHTML(
								action.system[stance].uniqueEffect
							);

						for(const symbol of Object.keys(CONFIG.WFRP3e.symbols))
							for(const [key, effect] of Object.entries(action.system[stance].effects[symbol]))
								enrichment[`${action.uuid}-${stance}.${symbol}.${key}`] = await textEditor.enrichHTML(
									effect.description
								);
					}

				partContext = {
					...partContext,
					enrichment,
					items: partContext.items.sort((a, b) => {
						if(a.system.conservative.traits?.includes(basicTrait)
							&& !b.system.conservative.traits?.includes(basicTrait))
							return -1;
						else if(!a.system.conservative.traits?.includes(basicTrait)
							&& b.system.conservative.traits?.includes(basicTrait))
							return 1
						else
							return a.name.localeCompare(b.name);
					}),
					stances: CONFIG.WFRP3e.stances,
					symbols: CONFIG.WFRP3e.symbols
				};
				break;
			case "search":
				partContext.types = {all: "SELECTOR.all", ...this.types};
				break;
		}

		return partContext;
	}

	/**
	 * Builds an array of action cards to select depending on the actor.
	 * @param {Actor} actor The actor acquiring new action cards.
	 * @param {Object} options
	 * @returns {Promise<Item[]>} An array of action cards to select from.
	 */
	static async buildOptionsList(actor, options)
	{
		const ownedActionNames = actor.itemTypes.action.map(action => action.name),
			  actions = [];

		for(const pack of game.packs)
			if(pack.documentName === "Item")
				for(const action of await pack.getDocuments({type: "action"}))
					if((options.basic === false && !action.system.reckless.traits.includes(game.i18n.localize("TRAITS.basic")))
						&& await action.checkRequirements({actor})
						&& !ownedActionNames.includes(action.name))
						actions.push(action);

		return actions;
	}

	/**
	 * Switches between two faces of a Document.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #flip(event, target)
	{
		const itemElement = target.closest(".item"),
			  activeFace = itemElement.querySelector(".face.active"),
			  inactiveFace = itemElement.querySelector(".face:not(.active)");

		activeFace.classList.remove("active");
		inactiveFace.classList.add("active");
	}
}
