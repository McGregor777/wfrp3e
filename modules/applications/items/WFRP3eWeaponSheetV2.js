import WFRP3eTrappingSheetV2 from "./WFRP3eTrappingSheetV2.js";

/** @inheritDoc */
export default class WFRP3eWeaponSheetV2 extends WFRP3eTrappingSheetV2
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			...this.DEFAULT_OPTIONS.actions,
			addQuality: this._onAddQuality,
			removeQuality: this._onRemoveQuality,
		},
		classes: [...this.DEFAULT_OPTIONS.classes, "weapon"]
	}

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {template: "systems/wfrp3e/templates/applications/items/weapon-sheet-v2/main.hbs"},
		details: {template: "systems/wfrp3e/templates/applications/items/details.hbs"},
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
					enriched: {special: await TextEditor.enrichHTML(this.item.system.special)},
					fields: this.item.system.schema.fields,
					qualitiesWithRating: ["attuned", "pierce", "unreliable"],
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
			case "footer":
				context.buttons = this._getFooterButtons();
				break;
		}

		return context;
	}

	/**
	 * Prepares an array of form footer buttons.
	 * @returns {Partial<FormFooterButton>[]}
	 */
	_getFooterButtons()
	{
		return [{type: "submit", icon: "fa-solid fa-save", label: "WEAPON.ACTIONS.update"}]
	}

	/**
	 * Performs follow-up operations after clicks on a Quality addition icon.
	 * @param {MouseEvent} event
	 * @returns {Promise<void>}
	 * @private
	 */
	static async _onAddQuality(event)
	{
		this.item.addNewQuality();
	}

	/**
	 * Performs follow-up operations after clicks on a Quality removal icon.
	 * @param {MouseEvent} event
	 * @returns {Promise<void>}
	 * @private
	 */
	static async _onRemoveQuality(event)
	{
		this.item.removeQuality(event.target.closest(".quality-container").dataset.index);
	}
}