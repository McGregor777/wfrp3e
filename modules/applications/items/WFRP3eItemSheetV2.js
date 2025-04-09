/** @inheritDoc */
export default class WFRP3eItemSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2)
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			addEffect: this._addEffect,
			editEffect: this._editEffect,
			removeEffect: this._removeEffect,
			editImage: this._editImage
		},
		classes: ["wfrp3e", "sheet", "item"],
		form: {closeOnSubmit: true},
		position: {width: 600}
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
	 * Adds a new effect to the Ability.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _addEffect(event)
	{
		await this.item.createEffect();
	}

	/**
	 * Opens the WFRP3eEffect editor.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _editEffect(event)
	{
		await fromUuid(event.target.closest(".effect[data-uuid]").dataset.uuid).then(
			effect => effect.sheet.render(true)
		);
	}

	/**
	 * Asks for confirmation for a specific WFRP3eEffect definitive removal.
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
			submit: async (result) => {
				if(result)
					await fromUuid(event.target.closest(".effect[data-uuid]").dataset.uuid).then(
						effect => effect.delete()
					);
			}
		});
	}

	// TODO: Remove _editImage() method in V13
	/**
	 * Handles changing a Document's image.
	 * @param {MouseEvent} event The click event.
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