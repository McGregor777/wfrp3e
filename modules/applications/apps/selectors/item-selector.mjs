import Selector from "./selector.mjs";

/** @inheritDoc */
export default class ItemSelector extends Selector
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);

		this._prepareTypes();
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "item-selector-{id}",
		actions: {flip: this.#flip},
		classes: ["item-selector-selector"],
		window: {title: "ITEMSELECTOR.title"}
	};

	/** @inheritDoc */
	static type = "item";

	/**
	 * The item types that are present among the selectable items.
	 * @type {Object}
	 */
	types = {};


	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			buttons: [{type: "submit", icon: "fa-solid fa-check", label: "ITEMSELECTOR.ACTIONS.chooseItem"}]
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		switch(partId) {
			case "main":
				const stances = wfrp3e.data.actors.Actor.STANCES,
					  symbols = wfrp3e.dice.terms.Die.SYMBOLS,
					  textEditor = foundry.applications.ux.TextEditor.implementation,
					  basicTrait = game.i18n.localize("TRAITS.basic"),
					  enrichment = {};

				for(const item of this.items)
					if(item.type === "action")
						for(const stance of Object.keys(stances)) {
							if(item.system[stance].requirements)
								enrichment[`${item.uuid}-${stance}.requirements`] = await textEditor.enrichHTML(
									item.system[stance].requirements
								);

							if(item.system[stance].special)
								enrichment[`${item.uuid}-${stance}.special`] = await textEditor.enrichHTML(
									item.system[stance].special
								);

							if(item.system[stance].uniqueEffect)
								enrichment[`${item.uuid}-${stance}.uniqueEffect`] = await textEditor.enrichHTML(
									item.system[stance].uniqueEffect
								);

							for(const symbol of Object.keys(symbols))
								for(const [key, effect] of Object.entries(item.system[stance].effects[symbol]))
									enrichment[`${item.uuid}-${stance}.${symbol}.${key}`] = await textEditor.enrichHTML(
										effect.description
									);
						}
					else
						enrichment[item.uuid] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
							item.system.description
						);

				partContext = {
					...partContext,
					enrichment,
					items: partContext.items.sort((a, b) => {
						if(a.system.conservative?.traits?.includes(basicTrait)
							&& !b.system.conservative?.traits?.includes(basicTrait))
							return -1;
						else if(!a.system.conservative?.traits?.includes(basicTrait)
							&& b.system.conservative?.traits?.includes(basicTrait))
							return 1
						else
							return a.name.localeCompare(b.name);
					}),
					stances,
					symbols
				};
				break;
			case "search":
				partContext.types = {all: "SELECTOR.all", ...this.types};
				break;
		}

		return partContext;
	}

	/**
	 * Prepares the item types that are present among the selectable items.
	 * @protected
	 */
	_prepareTypes()
	{
		for(const [key, label] of Object.entries(CONFIG.Item.typeLabels))
			if(this.items.some(item => item.type === key))
				this.types[key] = label;
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
