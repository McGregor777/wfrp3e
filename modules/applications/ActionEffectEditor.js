/** @inheritDoc */
export default class ActionEffectEditor extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "action-effect-editor-{id}",
		classes: ["wfrp3e"],
		tag: "form",
		window: {title: "ACTIONEFFECTEDITOR.title"},
		form: {
			handler: ActionEffectEditor.handleForm,
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
	tabGroups = {primary: "main"}

	/** @inheritDoc */
	async _prepareContext(options)
	{
		const data = this.options.data;

		return {
			...await super._prepareContext(options),
			...data,
			fields: data.action.system.schema.fields[data.face].fields.effects.fields[data.symbol ?? "success"].element.fields,
			tabs: this.#getTabs()
		};
	}

	/** @override */
	async _preparePartContext(partId, context)
	{
		switch(partId) {
			case "main":
				context.symbols = {...CONFIG.WFRP3e.symbols};
				context.tab = context.tabs.main;

				let enrichedDescription = await TextEditor.enrichHTML(context.effect.description);
				const symbolElements = '<span class="symbol-container">'
					+ `<span class="wfrp3e-font symbol ${context.symbols[context.effect.symbol ?? context.symbol ?? "success"].cssClass}"></span>`.repeat(context.effect.symbolAmount)
					+ "</span>";

				// Prepend symbols to the enriched description of the effect.
				if(context.effect.description.length > 0) {
					const match = enrichedDescription.match(new RegExp(/<\w+>/));

					enrichedDescription = match[0]
						+ symbolElements
						+ enrichedDescription.slice(match.index + match[0].length, enrichedDescription.length);
				}
				else
					enrichedDescription = symbolElements;

				context.enrichedDescription = enrichedDescription;

				// Remove irrelevant symbols from symbol type selection.
				delete context.symbols.righteousSuccess;
				context.face === "conservative" ? delete context.symbols.exertion : delete context.symbols.delay;

				break;
			case "script":
				context.tab = context.tabs.script;
				break;
			case "footer":
				context.buttons = this.#getFooterButtons();
				break;
		}

		return context;
	}

	/** @inheritDoc */
	_onRender(context, options)
	{
		for(const element of this.element.querySelectorAll("section.main input, section.main prose-mirror, section.main select"))
			element.addEventListener("change", this._updateEnrichedDescription.bind(this, options))

		return super._onRender(context, options);
	}

	/**
	 * Updates the effect properties in order to properly update the enriched description of the effect.
	 * @protected
	 */
	_updateEnrichedDescription(options, event)
	{
		this.options.data.effect[event.target.name] = event.target.value;

		this.render(options);
	}

0	/**
	 * Prepare an array of form header tabs.
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @private
	 */
	#getTabs()
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
	 * Prepare an array of form footer buttons.
	 * @returns {Partial<FormFooterButton>[]}
	 */
	#getFooterButtons()
	{
		return [{type: "submit", icon: "fa-solid fa-save", label: "ACTIONEFFECTEDITOR.ACTIONS.submit"}]
	}

	/**
	 * Process form submission for the Action Effect Editor.
	 * @this {ActionEffectEditor} The handler is called with the application as its bound scope.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 * @returns {Promise<void>}
	 */
	static async handleForm(event, form, formData)
	{
		const data = this.options.data,
			  symbol = formData.object.symbol ?? data.symbol,
			  effects = data.action.system[data.face].effects[symbol];

		delete formData.object.symbol;

		// If the index exists, update the effect, else add the new effect.
		data.index ? effects[data.index] = formData.object : effects.push(formData.object);

		data.action.update({[`system.${data.face}.effects.${symbol}`]: effects})
	}
}