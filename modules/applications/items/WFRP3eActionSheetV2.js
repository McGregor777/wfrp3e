/** @inheritDoc */
export default class WFRP3eActionSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2)
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: ["wfrp3e", "sheet", "item", "action"],
		actions: {
			addEffect: this._addEffect,
			editEffect: this._editEffect,
			removeEffect: this._removeEffect,
			editImage: this._editImage
		},
		form: {closeOnSubmit: true},
		position: {width: 600}
	}

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		type:  {template: "systems/wfrp3e/templates/applications/items/action-sheet-v2/type.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		conservative: {template: "systems/wfrp3e/templates/applications/items/action-sheet-v2/main.hbs"},
		reckless: {template: "systems/wfrp3e/templates/applications/items/action-sheet-v2/main.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	}

	/** @inheritDoc */
	tabGroups = {
		primary: "conservative",
		conservative: "conservative_main",
		reckless: "reckless_main"
	}

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			document: this.document.toObject(),
			fields: this.item.schema.fields,
			system: this.item.system,
			tabs: this._getMainTabs()
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		switch(partId) {
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
			case "footer":
				context.buttons = this._getFooterButtons();
				break;
		}

		return context;
	}

	/** @inheritDoc */
	_onRender(context, options)
	{
		for(const element of this.element.querySelectorAll("file-picker, file-picker input"))
			element.addEventListener("change", this._updateImages.bind(this, options));

		for(const element of this.element.querySelectorAll("prose-mirror"))
			element.addEventListener("change", this._updateEnrichedProperty.bind(this, options));

		return super._onRender(context, options);
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
			reckless: {id: "reckless", group: "primary", label: "STANCES.reckless"}
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
	 * Prepares an array of form footer buttons.
	 * @returns {Partial<FormFooterButton>[]}
	 * @protected
	 */
	_getFooterButtons()
	{
		return [{type: "submit", icon: "fa-solid fa-save", label: "ACTION.ACTIONS.update"}]
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
	 * Updates images which input have changed.
	 * @param options
	 * @param event {Event}
	 * @protected
	 */
	_updateImages(options, event)
	{
		const rootElement = event.target.closest("[name]");

		for(const element of this.element.querySelectorAll(`img[data-edit="${rootElement.name}"]`))
			element.src = rootElement.value;
	}

	/**
	 * Opens the Action Effect Editor in order to add a new effect to the Action.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _addEffect(event)
	{
		await this.item.createActionEffect(event.target.closest("section[data-stance]").dataset.stance);
	}

	/**
	 * Opens the Action Effect Editor in order to edit a specific effect of the Action.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _editEffect(event)
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
	static async _removeEffect(event)
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

	// TODO: Remove _editImage() method in V13
	/**
	 * Handles changing a Document's image.
	 * @param {MouseEvent} event  The click event.
	 * @returns {Promise}
	 * @protected
	 */
	static async _editImage(event)
	{
		const picker = new FilePicker({
			type: "image",
			current: foundry.utils.getProperty(this.document, event.target.dataset.edit),
			allowUpload: true,
			callback: src => {
				for(const element of this.element.querySelectorAll(`img[data-edit="${event.target.dataset.edit}"]`))
					element.src = src;

				for(const element of this.element.querySelectorAll(
					`input[name="${event.target.dataset.edit}"], file-picker[name="${event.target.dataset.edit}"]`
				))
					element.value = src;
			}
		});

		return picker.browse();
	}
}