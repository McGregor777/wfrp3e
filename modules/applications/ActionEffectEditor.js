/** @inheritDoc */
export default class ActionEffectEditor extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "action-effect-editor-{id}",
		classes: ["wfrp3e"],
		tag: "form",
		window: {title: "ACTIONEFFECTEDITOR.Title"},
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

	/** @inheritDoc */
	async _prepareContext(options)
	{
		const data = this.options.data,
			  symbols = {...CONFIG.WFRP3e.symbols},
			  symbolElements = '<span class="symbol-container">'
				  + `<span class="wfrp3e-font symbol ${symbols[data.effect.symbol ?? data.symbol ?? "success"].cssClass}"></span>`.repeat(data.effect.symbolAmount)
				  + "</span>";
		let enrichedDescription = await TextEditor.enrichHTML(data.effect.description);

		// Prepend symbols to the enriched description of the effect.
		if(data.effect.description.length > 0) {
			const match = enrichedDescription.match(new RegExp(/<\w+>/));

			enrichedDescription = match[0]
				+ symbolElements
				+ enrichedDescription.slice(match.index + match[0].length, enrichedDescription.length);
		}
		else
			enrichedDescription = symbolElements;

		// Remove irrelevant symbols from symbol type selection.
		delete symbols.righteousSuccess;
		data.face === "conservative" ? delete symbols.exertion : delete symbols.delay;

		return {
			buttons: [{type: "submit", icon: "fas fa-save", label: "ACTIONEFFECTEDITOR.Submit"}],
			enrichedDescription,
			fields: data.action.system.schema.fields[data.face].fields.effects.fields[data.symbol ?? "success"].element.fields,
			tabs: this.#getTabs(),
			...data,
			symbols
		};
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
			main: {id: "main", group: "primary", label: "ACTIONEFFECTEDITOR.TAB.Main"},
			script: {id: "script", group: "primary", label: "ACTIONEFFECTEDITOR.TAB.Script"},
		};

		for(const value of Object.values(tabs)) {
			value.active = this.tabGroups[value.group] === value.id;
			value.cssClass = value.active ? "active" : "";
		}

		return tabs;
	}
}