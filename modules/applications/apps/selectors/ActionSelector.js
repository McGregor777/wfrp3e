import AbstractSelector from "./AbstractSelector.js";

/** @inheritDoc */
export default class ActionSelector extends AbstractSelector
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
				const basicTrait = game.i18n.localize("TRAITS.basic");

				partContext = {
					...partContext,
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
	 * @param {WFRP3eActor} actor The actor acquiring new action cards.
	 * @returns {Promise<WFRP3eItem[]>} An array of action cards to select from.
	 */
	static async buildOptionsList(actor)
	{
		let faithName = null,
			orderName = null;

		if(actor.system.priest) {
			const faithTalent = actor.itemTypes.talent.find(talent => talent.type === "faith"),
				  match = faithTalent.name.match(new RegExp(/([\w\s]+),?/));

			if(match)
				faithName = match[1];
		}

		if(actor.system.wizard) {
			const orderTalent = actor.itemTypes.talent.find(talent => talent.type === "order"),
				  match = orderTalent.name.match(new RegExp(/([\w\s]+), ?[\w\s]+, ?([\w\s]+)/));

			if(match)
				orderName = match[2] ?? match[1];
		}

		const ownedActionNames = actor.itemTypes.action.map(action => action.name),
			  actions = [];

		console.log(game.i18n.format("TRAITS.rank"))

		for(const pack of game.packs.filter(pack => pack.documentName === "Item"))
			actions.push(
				...pack.getDocuments({type: "action"}).then(actions => {
					return actions.filter(action => {
						return !ownedActionNames.includes(action.name)
							&& (["melee", "ranged", "support"].includes(action.system.type)
								|| (action.system.type === "blessing"
									&& actor.system.priest
									&& faithName
									&& action.system.reckless.traits.includes(faithName))
								|| (action.system.type === "spell"
									&& actor.system.wizard
									&& orderName
									&& action.system.reckless.traits.includes(orderName)))
					});
				})
			);

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
