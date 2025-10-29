import ItemSheet from "./item-sheet.mjs";

/** @inheritDoc */
export default class ActionSheet extends ItemSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			addActionEffect: this.#addActionEffect,
			editActionEffect: this.#editActionEffect,
			removeActionEffect: this.#removeActionEffect
		},
		classes: ["action"]
	};

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/sheets/items/action-sheet/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		conservative: {template: "systems/wfrp3e/templates/applications/sheets/items/action-sheet/main.hbs"},
		reckless: {template: "systems/wfrp3e/templates/applications/sheets/items/action-sheet/main.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/sheets/items/effects.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "conservative", icon: "fa-solid fa-hourglass"},
				{id: "reckless", icon: "fa-solid fa-droplet"},
				{id: "effects", icon: "fa-fw fa-solid fa-person-rays"}
			],
			initial: "conservative",
			labelPrefix: "ACTION.TABS"
		},
		conservative: {
			tabs: [
				{id: "main", icon: "fa-solid fa-book"},
				{id: "effects", icon: "fa-solid fa-gears"}
			],
			initial: "main",
			labelPrefix: "ACTION.TABS"
		},
		reckless: {
			tabs: [
				{id: "main", icon: "fa-solid fa-book"},
				{id: "effects", icon: "fa-solid fa-gears"},
			],
			initial: "main",
			labelPrefix: "ACTION.TABS"
		}
	};

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		switch(partId) {
			case "tabs":
				partContext.tabs = this._prepareTabs("sheet");
				break;
			case "type":
				partContext.fields = this.item.system.schema.fields;
				break;
			case "conservative":
			case "reckless":
				partContext = {
					...partContext,
					fields: this.item.system.schema.fields[partId].fields,
					stance: partId,
					symbols: {...CONFIG.WFRP3e.symbols},
					system: this.item.system[partId],
					tabs: this._prepareTabs(partId)
				};
				break;
		}

		return partContext;
	}

	/**
	 * Opens the Action Effect Editor in order to add a new effect to the Action.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #addActionEffect(event, target)
	{
		await this.item.createActionEffect(target.closest("section[data-stance]").dataset.stance);
	}

	/**
	 * Opens the Action Effect Editor in order to edit a specific effect of the Action.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #editActionEffect(event, target)
	{
		await this.item.editActionEffect(
			target.closest("section[data-stance]").dataset.stance,
			target.closest("div.effect-group[data-symbol]").dataset.symbol,
			target.closest("div.effect[data-index]").dataset.index
		);
	}

	/**
	 * Asks for confirmation for a specific Action effect definitive removal.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #removeActionEffect(event, target)
	{
		await foundry.applications.api.DialogV2.confirm({
			window: {title: game.i18n.localize("DIALOG.TITLE.EffectDeletion")},
			modal: true,
			content: `<p>${game.i18n.localize("DIALOG.DESCRIPTION.EffectDeletion")}</p>`,
			submit: async (result) => {
				if(result)
					await this.item.removeActionEffect(
						target.closest("section[data-stance]").dataset.stance,
						target.closest("div.effect-group[data-symbol]").dataset.symbol,
						target.closest("div.effect[data-index]").dataset.index
					);
			}
		});
	}
}
