import WFRP3eItemSheetV2 from "./WFRP3eItemSheetV2.js";

/** @inheritDoc */
export default class WFRP3eActionSheetV2 extends WFRP3eItemSheetV2
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: [...this.DEFAULT_OPTIONS.classes, "action"],
		actions: {
			...this.DEFAULT_OPTIONS.actions,
			addActionEffect: this._addActionEffect,
			editActionEffect: this._editActionEffect,
			removeActionEffect: this._removeActionEffect
		}
	}

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		type: {template: "systems/wfrp3e/templates/applications/items/action-sheet-v2/type.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		conservative: {template: "systems/wfrp3e/templates/applications/items/action-sheet-v2/main.hbs"},
		reckless: {template: "systems/wfrp3e/templates/applications/items/action-sheet-v2/main.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/items/effects.hbs"}
	}

	/** @inheritDoc */
	tabGroups = {
		primary: "conservative",
		conservative: "conservative_main",
		reckless: "reckless_main"
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		switch(partId) {
			case "tabs":
				context.tabs = this._getMainTabs();
				break;
			case "type":
				context.fields = this.item.system.schema.fields;
				break;
			case "conservative":
			case "reckless":
				context = {
					...context,
					enriched: {
						requirements: await TextEditor.enrichHTML(context.system[partId].requirements),
						special: await TextEditor.enrichHTML(context.system[partId].special),
						uniqueEffect: await TextEditor.enrichHTML(context.system[partId].uniqueEffect)
					},
					fields: this.item.system.schema.fields[partId].fields,
					stance: partId,
					symbols: {...CONFIG.WFRP3e.symbols},
					system: this.item.system[partId],
					tab: context.tabs[partId],
					tabs: this._getSubTabs(partId)
				};
				break;
			case "effects":
				context = {
					...context,
					effects: this.document.effects,
					tab: context.tabs[partId]
				}
				break;
		}

		return context;
	}

	/**
	 * Prepares an array of form header tabs.
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @protected
	 */
	_getMainTabs()
	{
		const tabs = {
			conservative: {id: "conservative", group: "primary", label: "STANCES.conservative"},
			reckless: {id: "reckless", group: "primary", label: "STANCES.reckless"},
			effects: {id: "effects", group: "primary", label: "ACTION.TABS.effects"}
		};

		for(const value of Object.values(tabs)) {
			value.active = this.tabGroups[value.group] === value.id;
			value.cssClass = value.active ? "active" : "";
		}

		return tabs;
	}

	/**
	 * Prepares an array of form sub tabs.
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @protected
	 */
	_getSubTabs(faceName)
	{
		const tabs = {
			main: {id: `${faceName}_main`, group: faceName, label: "ACTION.TABS.main"},
			effects: {id: `${faceName}_effects`, group: faceName, label: "ACTION.TABS.effects"}
		};

		for(const value of Object.values(tabs)) {
			value.active = this.tabGroups[value.group] === value.id;
			value.cssClass = value.active ? "active" : "";
		}

		return tabs;
	}

	/**
	 * Opens the Action Effect Editor in order to add a new effect to the Action.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _addActionEffect(event)
	{
		await this.item.createActionEffect(event.target.closest("section[data-stance]").dataset.stance);
	}

	/**
	 * Opens the Action Effect Editor in order to edit a specific effect of the Action.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _editActionEffect(event)
	{
		await this.item.editActionEffect(
			event.target.closest("section[data-stance]").dataset.stance,
			event.target.closest("div.effect-group[data-symbol]").dataset.symbol,
			event.target.closest("div.effect[data-index]").dataset.index
		);
	}

	/**
	 * Asks for confirmation for a specific Action effect definitive removal.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _removeActionEffect(event)
	{
		await foundry.applications.api.DialogV2.confirm({
			window: {title: game.i18n.localize("DIALOG.TITLE.EffectDeletion")},
			modal: true,
			content: `<p>${game.i18n.localize("DIALOG.DESCRIPTION.EffectDeletion")}</p>`,
			submit: (result) => {
				if(result)
					this.item.removeActionEffect(
						event.target.closest("section[data-stance]").dataset.stance,
						event.target.closest("div.effect-group[data-symbol]").dataset.symbol,
						event.target.closest("div.effect[data-index]").dataset.index
					);
			}
		});
	}
}