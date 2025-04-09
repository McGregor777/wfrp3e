import WFRP3eItemSheetV2 from "./WFRP3eItemSheetV2.js";

/** @inheritDoc */
export default class WFRP3eMutationSheetV2 extends WFRP3eItemSheetV2
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: [...this.DEFAULT_OPTIONS.classes, "skill"]
	}

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {template: "systems/wfrp3e/templates/applications/items/skill-sheet-v2/main.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/items/effects.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
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
					enriched: {description: await TextEditor.enrichHTML(this.item.system.description)},
					fields: this.item.system.schema.fields,
					parent: this.document.parent,
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
			case "footer":
				context.buttons = this._getFooterButtons();
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
			main: {id: "main", group: "primary", label: "SKILL.TABS.main"},
			effects: {id: "effects", group: "primary", label: "SKILL.TABS.effects"}
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
		return [{type: "submit", icon: "fa-solid fa-save", label: "SKILL.ACTIONS.update"}]
	}
}