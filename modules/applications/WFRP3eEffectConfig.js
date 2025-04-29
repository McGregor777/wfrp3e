export default class WFRP3eEffectConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.DocumentSheetV2)
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		classes: ["wfrp3e", "sheet", "active-effect"],
		actions: {
			addEffectChange: this._addEffectChange,
			deleteEffectChange: this._deleteEffectChange,
			editImage: this._editImage
		},
		window: {
			contentClasses: ["standard-form"]
		},
		position: {width: 580},
		form: {closeOnSubmit: true}
	};

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		details: {template: "systems/wfrp3e/templates/applications/active-effect-config/details.hbs"},
		duration: {template: "systems/wfrp3e/templates/applications/active-effect-config/duration.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/active-effect-config/effects.hbs"},
		scripts: {template: "systems/wfrp3e/templates/applications/active-effect-config/scripts.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/** @inheritDoc */
	tabGroups = {primary: "details"};

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			document: this.document.toObject(),
			fields: this.document.schema.fields
		}
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		switch(partId) {
			case "tabs":
				context.tabs = this._getMainTabs();
				break;
			case "details":
				const legacyTransfer = CONFIG.ActiveEffect.legacyTransferral;
				context = {
					...context,
					labels: {
						transfer: {
							name: game.i18n.localize(`EFFECT.Transfer${legacyTransfer ? "Legacy" : ""}`),
							hint: game.i18n.localize(`EFFECT.TransferHint${legacyTransfer ? "Legacy" : ""}`)
						}
					},
					enrichedDescription: await TextEditor.enrichHTML(
						this.document.description,
						{secrets: this.document.isOwner}
					),
					isActorEffect: this.document.parent.documentName === "Actor",
					isItemEffect: this.document.parent.documentName === "Item",
					statuses: CONFIG.statusEffects.map(status => {
						return {
							id: status.id,
							label: game.i18n.localize(status.name ?? /** @deprecated since v12 */ status.label),
							selected: context.document.statuses.includes(status.id) ? "selected" : ""
						};
					}),
					tab: context.tabs[partId]

				};
				break;
			case "duration":
				context = {
					...context,
					fields: this.document.schema.fields.duration.fields,
					duration: this.document.duration,
					tab: context.tabs[partId]
				};
				break;
			case "effects":
				context = {
					...context,
					modes: Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((object, effect) => {
						object[effect[1]] = game.i18n.localize(`EFFECT.MODE_${effect[0]}`);
						return object;
					}, {}),
					tab: context.tabs[partId]
				};
				break;
			case "scripts":
				context = {
					...context,
					fields: this.document.system.schema.fields,
					system: this.document.system,
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
			element.addEventListener("change", this._updateEnrichedProperty.bind(this, options))

		for(const element of this.element.querySelectorAll('[name="system.type"]'))
			element.addEventListener("change", this._onTypeChange.bind(this, options))

		return super._onRender(context, options);
	}

	/** @inheritdoc */
	async submit({updateData} = {})
	{
		const formConfig = this.options.form;

		if(!formConfig?.handler)
			throw new Error(`The ${this.constructor.name} DocumentSheetV2 does not support a single top-level form element.`);

		const form = this.element,
			  event = new Event("submit"),
			  formData = new FormDataExtended(form),
			  submitData = this._prepareSubmitData(event, form, formData);

		foundry.utils.mergeObject(submitData, updateData, {inplace: true});
		await this._processSubmitData(event, form, submitData);
	}

	/**
	 * Updates the property with an enriched value.
	 * @param options
	 * @param event {Event}
	 * @protected
	 */
	_updateEnrichedProperty(options, event)
	{
		foundry.utils.setProperty(this.document, event.target.name, event.target.value);

		this.render(options);
	}

	/**
	 * Prepares an array of form header tabs.
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @private
	 */
	_getMainTabs()
	{
		const tabs = {
			details: {id: "details", group: "primary", label: "EFFECT.TabDetails"},
			duration: {id: "duration", group: "primary", label: "EFFECT.TabDuration"},
			effects: {id: "effects", group: "primary", label: "EFFECT.TabEffects"},
			scripts: {id: "scripts", group: "primary", label: "EFFECT.TABS.scripts"}
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
	 * @protected
	 */
	_getFooterButtons()
	{
		return [{type: "submit", icon: "fa-solid fa-save", label: "EDITOR.Save"}]
	}

	/**
	 * Handle adding a new change to the changes array.
	 * @protected
	 */
	static async _addEffectChange()
	{
		this.document.changes.push({key: "", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: ""});

		await this.submit({
			preventClose: true,
			updateData: {"changes": this.document.changes}
		});
	}

	/**
	 * Handle adding a new change to the changes array.
	 * @protected
	 */
	static async _deleteEffectChange(event)
	{
		this.document.changes.splice(event.target.closest(".effect-change").dataset.index, 1);

		await this.submit({
			preventClose: true,
			updateData: {"changes": this.document.changes}
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

	async _onTypeChange(options, event)
	{
		foundry.utils.setProperty(this.document, event.target.name, event.target.value);

		await this.submit({
			preventClose: true,
			updateData: {"system.type": this.document.system.type}
		});
	}
}