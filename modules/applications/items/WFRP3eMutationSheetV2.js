import WFRP3eItemSheetV2 from "./WFRP3eItemSheetV2.js";

/** @inheritDoc */
export default class WFRP3eMutationSheetV2 extends WFRP3eItemSheetV2
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: [...this.DEFAULT_OPTIONS.classes, "mutation"]
	}

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {template: "systems/wfrp3e/templates/applications/items/mutation-sheet-v2/main.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/items/effects.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	}

	/**
	 * Prepares an array of form header tabs.
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @private
	 */
	_getMainTabs()
	{
		const tabs = {
			main: {id: "main", group: "primary", label: "MUTATION.TABS.main"},
			effects: {id: "effects", group: "primary", label: "MUTATION.TABS.effects"}
		};

		for(const tab of Object.values(tabs)) {
			tab.active = this.tabGroups[tab.group] === tab.id;
			tab.cssClass = tab.active ? "active" : "";
		}

		return tabs;
	}

	/**
	 * Prepares an array of form footer buttons.
	 * @returns {Partial<FormFooterButton>[]}
	 */
	_getFooterButtons()
	{
		return [{type: "submit", icon: "fa-solid fa-save", label: "MUTATION.ACTIONS.update"}]
	}
}