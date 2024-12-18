/** @inheritDoc */
export default class WFRP3eCareerSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2)
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: ["wfrp3e", "sheet", "item", "career"],
		actions: {
			addRaceRestriction: this._addRaceRestriction,
			removeRaceRestriction: this._removeRaceRestriction,
			addSocket: this._addSocket,
			removeSocket: this._removeSocket
		},
		form: {closeOnSubmit: true},
		position: {width: 550}
	}

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {template: "systems/wfrp3e/templates/applications/items/career-sheet-v2/main.hbs"},
		advanceOptions: {template: "systems/wfrp3e/templates/applications/items/career-sheet-v2/advance-options.hbs"},
		setting: {template: "systems/wfrp3e/templates/applications/items/career-sheet-v2/setting.hbs"},
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
			main: {id: "main", group: "primary", label: "CAREER.TABS.main"},
			advanceOptions: {id: "advanceOptions", group: "primary", label: "CAREER.TABS.advanceOptions"},
			setting: {id: "setting", group: "primary", label: "CAREER.TABS.setting"}
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
		return [{type: "submit", icon: "fa-solid fa-save", label: "CAREER.ACTIONS.update"}]
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