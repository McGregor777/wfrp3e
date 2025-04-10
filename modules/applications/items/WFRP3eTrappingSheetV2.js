import WFRP3eItemSheetV2 from "./WFRP3eItemSheetV2.js";

/** @inheritDoc */
export default class WFRP3eTrappingSheetV2 extends WFRP3eItemSheetV2
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: [...this.DEFAULT_OPTIONS.classes, "trapping"]
	}

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {template: "systems/wfrp3e/templates/applications/items/trapping-sheet-v2/main.hbs"},
		details: {template: "systems/wfrp3e/templates/applications/items/details.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/items/effects.hbs"}
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		switch(partId) {
			case "tabs":
				context.tabs = this._getMainTabs();
				break;
			case "main":
				context = {
					...context,
					fields: this.item.system.schema.fields,
					tab: context.tabs[partId]
				};
				break;
			case "details":
				context = {
					...context,
					enriched: {description: await TextEditor.enrichHTML(this.item.system.description)},
					fields: this.item.system.schema.fields,
					tab: context.tabs[partId]
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
	 * @private
	 */
	_getMainTabs()
	{
		const tabs = {
			main: {id: "main", group: "primary", label: "TRAPPING.TABS.main"},
			details: {id: "details", group: "primary", label: "TRAPPING.TABS.details"},
			effects: {id: "effects", group: "primary", label: "TRAPPING.TABS.effects"}
		};

		for(const tab of Object.values(tabs)) {
			tab.active = this.tabGroups[tab.group] === tab.id;
			tab.cssClass = tab.active ? "active" : "";
		}

		return tabs;
	}
}