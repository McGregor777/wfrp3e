/**
 * @typedef {Object} ActionEffectEditorData
 * @property {WFRP3eItem} action
 * @property {string} face
 * @property {ActionEffect} effect
 * @property {string} [symbol]
 * @property {number} [index]
 */

/**
 * The Application class allowing to edit Action Effects.
 * @extends {ApplicationV2<ApplicationConfiguration & ActionEffectEditorData, ApplicationRenderOptions>}
 * @mixes HandlebarsApplication
 * @alias ActionEffectEditor
 */
export default class ActionEffectEditor extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	constructor(options={})
	{
		super(options);

		this.data = options.data;
		this.action = options.data.action;
		this.face = options.data.face;
		this.effect = options.data.effect;
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "action-effect-editor-{id}",
		classes: ["wfrp3e"],
		tag: "form",
		window: {title: "ACTIONEFFECTEDITOR.title"},
		form: {
			handler: this._handleForm,
			submitOnChange: false,
			closeOnSubmit: true
		},
		position: {width: 600}
	}

	/** @inheritDoc */
	static PARTS = {
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {template: "systems/wfrp3e/templates/applications/action-effects-editor/main.hbs"},
		script: {template: "systems/wfrp3e/templates/applications/action-effects-editor/script.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	}

	/** @inheritDoc */
	tabGroups = {primary: "main"};

	/**
	 * @type {ActionEffectEditorData}
	 */
	data;

	/**
	 * The Action which effect is edited.
	 * @type {WFRP3eItem}
	 */
	action;

	/**
	 * The face of the Action which effect is edited.
	 * @type {string}
	 */
	face;

	/**
	 * The edited Action effect.
	 * @type {ActionEffect}
	 */
	effect;

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			effect: this.effect,
			fields: this.action.system.schema.fields[this.face]
				.fields.effects.fields[this.data.symbol ?? "success"]
				.element.fields
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		switch(partId) {
			case "tabs":
				context.tabs = this._getTabs();
				break;
			case "main":
				context = {
					...context,
					enrichedDescription: await this._prepareEnrichedDescription(),
					index: this.data.index,
					symbol: this.effect.symbol ?? this.data.symbol,
					symbols: {...CONFIG.WFRP3e.symbols},
					tab: context.tabs[partId]
				};

				// Remove irrelevant symbols from symbol type selection.
				delete context.symbols.righteousSuccess;
				this.face === "conservative" ? delete context.symbols.exertion : delete context.symbols.delay;

				break;
			case "script":
				context.tab = context.tabs[partId];
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
		for(const element of this.element.querySelectorAll("section.main input, section.main prose-mirror, section.main select"))
			element.addEventListener("change", this._updateEnrichedProperty.bind(this, options))

		return super._onRender(context, options);
	}

	/**
	 * Prepends symbols to an enriched description of the effect.
	 * @protected
	 */
	async _prepareEnrichedDescription()
	{
		let enrichedDescription = await TextEditor.enrichHTML(this.effect.description);
		const symbolElements = '<span class="symbol-container">'
			+ `<span class="wfrp3e-font symbol ${CONFIG.WFRP3e.symbols[this.effect.symbol ?? this.data.symbol ?? "success"].cssClass}"></span>`.repeat(this.effect.symbolAmount)
			+ "</span>";

		if(this.effect.description.length > 0) {
			const match = enrichedDescription.match(new RegExp(/<\w+>/));
			enrichedDescription = match[0]
				+ symbolElements
				+ enrichedDescription.slice(match.index + match[0].length, enrichedDescription.length);
		}
		else
			enrichedDescription = symbolElements;

		return enrichedDescription;
	}

	/**
	 * Updates the property with an enriched value.
	 * @param options
	 * @param event {Event}
	 * @protected
	 */
	_updateEnrichedProperty(options, event)
	{
		foundry.utils.setProperty(this.effect, event.target.name, event.target.value);

		this.render(options);
	}

	/**
	 * Prepares an array of form header tabs.
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @protected
	 */
	_getTabs()
	{
		const tabs = {
			main: {id: "main", group: "primary", label: "ACTIONEFFECTEDITOR.TABS.main"},
			script: {id: "script", group: "primary", label: "ACTIONEFFECTEDITOR.TABS.script"},
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
		return [{type: "submit", icon: "fa-solid fa-save", label: "ACTIONEFFECTEDITOR.ACTIONS.submit"}]
	}

	/**
	 * Processes form submission for the Action Effect Editor.
	 * @this {ActionEffectEditor} The handler is called with the application as its bound scope.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _handleForm(event, form, formData)
	{
		const symbol = formData.object.symbol ?? this.data.symbol,
			  effects = this.action.system[this.face].effects[symbol];

		delete formData.object.symbol;

		// If the index exists, update the effect, else add the new effect.
		this.data.index ? effects[this.data.index] = formData.object : effects.push(formData.object);

		this.action.update({[`system.${this.face}.effects.${symbol}`]: effects})
	}
}