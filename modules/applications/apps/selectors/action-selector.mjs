import ItemSelector from "./item-selector.mjs";

/** @inheritDoc */
export default class ActionSelector extends ItemSelector
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "action-selector-{id}",
		classes: ["action-selector"],
		window: {title: "ACTIONSELECTOR.title"},
		position: {width: 940}
	};

	/** @inheritDoc */
	static type = "action";

	/**
	 * The action types that are present among the selectable actions.
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

	/**
	 * Prepares the Action types that are present among the selectable Items.
	 * @protected
	 */
	_prepareTypes()
	{
		for(const [key, type] of Object.entries(wfrp3e.data.items.Action.TYPES))
			if(this.items.some(action => action.system.type === key))
				this.types[key] = type;
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

		for(const action of game.items.search({filters: [{field: "type", operator: "equals", value: "action"}]}))
			if(await this.#filterAction(action, actor, ownedActionNames, options?.basic))
				actions.push(action);

		for(const pack of game.packs)
			if(pack.documentName === "Item")
				for(const action of await pack.getDocuments({type: "action"}))
					if(await this.#filterAction(action, actor, ownedActionNames, options?.basic))
						actions.push(action);

		return actions;
	}

	/**
	 * Verifies that an action fulfills the requirements to be shown in the selector.
	 * @param {Item} action The action to check up.
	 * @param {Actor} actor The actor concerned by the action selection.
	 * @param {string[]} ownedActionNames The names of the actions owned action.
	 * @param {boolean} allowBasic Whether basic actions are allowed in the selector.
	 * @returns {Promise<boolean>}
	 * @private
	 */
	static async #filterAction(action, actor, ownedActionNames, allowBasic)
	{
		return (allowBasic === true || !action.system.reckless.traits.includes(game.i18n.localize("TRAITS.basic")))
			&& await action.checkRequirements({actor})
			&& !ownedActionNames.includes(action.name);
	}
}
