import WFRP3eItemSheetV2 from "./WFRP3eItemSheetV2.js";

/** @inheritDoc */
export default class WFRP3eCareerSheetV2 extends WFRP3eItemSheetV2
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: [...this.DEFAULT_OPTIONS.classes, "career"]
	}

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {template: "systems/wfrp3e/templates/applications/items/career-sheet-v2/main.hbs"},
		advanceOptions: {template: "systems/wfrp3e/templates/applications/items/career-sheet-v2/advance-options.hbs"},
		setting: {template: "systems/wfrp3e/templates/applications/items/career-sheet-v2/setting.hbs"},
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
					system: this.item.system,
					tab: context.tabs[partId]
				};
				break;
			case "advanceOptions":
				context = {
					...context,
					fields: this.item.system.schema.fields.advanceOptions.fields,
					system: this.item.system.advanceOptions,
					tab: context.tabs[partId]
				};
				break;
			case "setting":
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
			main: {id: "main", group: "primary", label: "CAREER.TABS.main"},
			advanceOptions: {id: "advanceOptions", group: "primary", label: "CAREER.TABS.advanceOptions"},
			setting: {id: "setting", group: "primary", label: "CAREER.TABS.setting"},
			effects: {id: "effects", group: "primary", label: "CAREER.TABS.effects"}
		};

		for(const value of Object.values(tabs)) {
			value.active = this.tabGroups[value.group] === value.id;
			value.cssClass = value.active ? "active" : "";
		}

		return tabs;
	}

	/**
	 * Creates a new race restriction for the edited Career.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _addRaceRestriction(event)
	{
		this.item.addNewRaceRestriction();
	}

	/**
	 * Asks for confirmation for a specific race restriction removal.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _removeRaceRestriction(event)
	{
		this.item.removeLastRaceRestriction();
	}

	/**
	 * Creates a new socket for the edited Career.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _addSocket(event)
	{
		this.item.addNewSocket();
	}

	/**
	 * Asks for confirmation for a specific socket removal.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _removeSocket(event)
	{
		this.item.removeLastSocket();
	}
}