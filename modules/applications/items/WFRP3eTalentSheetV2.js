/** @inheritDoc */
export default class WFRP3eTalentSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2)
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: ["wfrp3e", "sheet", "item", "talent"],
		form: {closeOnSubmit: true},
		position: {width: 600}
	}

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {template: "systems/wfrp3e/templates/applications/items/talent-sheet-v2/main.hbs"},
		effect: {template: "systems/wfrp3e/templates/applications/items/talent-sheet-v2/effect.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	}

	/** @inheritDoc */
	tabGroups = {primary: "main"}

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			document: this.document.toObject(),
			fields: this.item.schema.fields,
			system: this.item.system,
			tabs: this._getTabs()
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		switch(partId) {
			case "main":
				context = {
					...context,
					enriched: {description: await TextEditor.enrichHTML(this.item.system.description)},
					fields: this.item.system.schema.fields,
					tab: context.tabs[partId]
				};
				break;
			case "effect":
				context = {
					...context,
					fields: this.item.system.schema.fields.effect.fields,
					system: this.item.system.effect,
					tab: context.tabs[partId]
				};
				break;
			case "footer":
				context.buttons = this._getFooterButtons();
				break;
		}

		return context;
	}

	/** @inheritDoc */
	_onRender(context, options)
	{
		for(const element of this.element.querySelectorAll("prose-mirror"))
			element.addEventListener("change", this._updateEnrichedProperty.bind(this, options));

		return super._onRender(context, options);
	}

	/**
	 * Prepares an array of form header tabs.
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @private
	 */
	_getTabs()
	{
		const tabs = {
			main: {id: "main", group: "primary", label: "TALENT.TABS.main"},
			effect: {id: "effect", group: "primary", label: "TALENT.TABS.effect"}
		};

		for(const value of Object.values(tabs)) {
			value.active = this.tabGroups[value.group] === value.id;
			value.cssClass = value.active ? "active" : "";
		}

		return tabs;
	}

	/**
	 * Prepares an array of form footer buttons.
	 * @returns {Partial<FormFooterButton>[]}
	 */
	_getFooterButtons()
	{
		return [{type: "submit", icon: "fa-solid fa-save", label: "TALENT.ACTIONS.update"}]
	}

	/**
	 * Updates the property with an enriched value.
	 * @param options
	 * @param event {Event}
	 * @protected
	 */
	_updateEnrichedProperty(options, event)
	{
		foundry.utils.setProperty(this.item, event.target.name, event.target.value);

		this.render(options);
	}
}