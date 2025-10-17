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
	 * Builds an array of Actions eligible for an Advance, whether non-career or not.
	 * @param {WFRP3eActor} actor The Actor buying the advance.
	 * @returns {Promise<WFRP3eItem[]>}
	 */
	static async buildAdvanceOptionsList(actor)
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

		const ownedActionNames = actor.itemTypes.action.map(action => action.name);

		return game.packs.filter(pack => pack.documentName === "Item").reduce(async (actions, pack) => {
			return [
				...await actions,
				...await pack.getDocuments({type: "action"}).then(foundActions => {
					const actions = foundActions.filter(action => {
						return ["melee", "ranged", "support"].includes(action.system.type)
							&& !ownedActionNames.includes(action.name)
					});

					if(actor.system.priest && faithName)
						actions.push(...foundActions.filter(action => action.system.type === "blessing"
							&& action.system.reckless.traits.includes(faithName)
							&& !ownedActionNames.includes(action.name)));

					if(actor.system.wizard && orderName)
						actions.push(...foundActions.filter(action => action.system.type === "spell"
							&& action.system.reckless.traits.includes(orderName)
							&& !ownedActionNames.includes(action.name)));

					return actions;
				})
			];
		}, []);
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