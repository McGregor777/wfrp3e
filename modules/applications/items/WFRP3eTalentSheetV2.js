/** @inheritDoc */
export default class WFRP3eTalentSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2)
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			addEffect: this._addEffect,
			removeEffect: this._removeEffect,
		},
		classes: ["wfrp3e", "sheet", "item", "talent"],
		form: {closeOnSubmit: true},
		position: {width: 600}
	}

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {template: "systems/wfrp3e/templates/applications/items/talent-sheet-v2/main.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/items/talent-sheet-v2/effects.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	}

	/** @inheritDoc */
	tabGroups = {
		primary: "main",
		effects: "0"
	}

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			document: this.document.toObject(),
			fields: this.item.schema.fields,
			system: this.item.system
		};
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
					tab: context.tabs[partId]
				};
				break;
			case "effects":
				context = {
					...context,
					fields: this.item.system.schema.fields,
					effects: this.item.system.effects,
					tab: context.tabs[partId],
					tabs: this._getEffectTabs()
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
	_getMainTabs()
	{
		const tabs = {
			main: {id: "main", group: "primary", label: "TALENT.TABS.main"},
			effects: {id: "effects", group: "primary", label: "TALENT.TABS.effects"}
		};

		for(const tab of Object.values(tabs)) {
			tab.active = this.tabGroups[tab.group] === tab.id;
			tab.cssClass = tab.active ? "active" : "";
		}

		return tabs;
	}

	/**
	 * Prepares an array of effect tabs.
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @private
	 */
	_getEffectTabs()
	{
		const tabs = this.item.system.effects.reduce((tabs, effect, index) => {
			tabs[index] = {id: index.toString(), group: "effects", label: effect.type};
			return tabs;
		}, {});

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

	/**
	 * Adds a new effect to the Talent.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _addEffect(event)
	{
		await this.item.createTalentEffect();
	}

	/**
	 * Asks for confirmation for a specific Talent effect definitive removal.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _removeEffect(event)
	{
		await foundry.applications.api.DialogV2.confirm({
			window: {title: game.i18n.localize("DIALOG.TITLE.EffectDeletion")},
			modal: true,
			content: `<p>${game.i18n.localize("DIALOG.DESCRIPTION.EffectDeletion")}</p>`,
			submit: (result) => {
				if(result)
					this.item.removeTalentEffect(event.target.closest("section.effect[data-index]").dataset.index);
			}
		});
	}
}