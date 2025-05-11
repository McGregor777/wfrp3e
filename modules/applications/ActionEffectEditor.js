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
	constructor(options = {})
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
		classes: ["wfrp3e action-effect-editor"],
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			title: "ACTIONEFFECTEDITOR.title"
		},
		form: {
			handler: this.#onActionEffectFormSubmit,
			submitOnChange: false,
			closeOnSubmit: true
		},
		position: {width: 600}
	};

	/** @inheritDoc */
	static PARTS = {
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {template: "systems/wfrp3e/templates/applications/action-effects-editor/main.hbs"},
		script: {template: "systems/wfrp3e/templates/applications/action-effects-editor/script.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "main", icon: "fa-solid fa-book"},
				{id: "script", icon: "fa-solid fa-code"}
			],
			initial: "main",
			labelPrefix: "ACTIONEFFECTEDITOR.TABS"
		}
	};

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
			buttons: [{type: "submit", icon: "fa-solid fa-save", label: "ACTIONEFFECTEDITOR.ACTIONS.submit"}],
			effect: this.effect,
			fields: this.action.system.schema.fields[this.face]
				.fields.effects.fields[this.data.symbol ?? "success"]
				.element.fields,
			rootId: this.id
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partContext.tabs && partId in partContext.tabs)
			partContext.tab = partContext.tabs[partId];

		if(partId === "main") {
			partContext = {
				...partContext,
				enrichedDescription: await this._prepareEnrichedDescription(),
				index: this.data.index,
				symbol: this.effect.symbol ?? this.data.symbol,
				symbols: {...CONFIG.WFRP3e.symbols}
			};

			// Remove irrelevant symbols from symbol type selection.
			delete partContext.symbols.righteousSuccess;
			this.face === "conservative" ? delete partContext.symbols.exertion : delete partContext.symbols.delay;
		}

		return partContext;
	}

	/** @inheritDoc */
	async _onChangeForm(formConfig, event)
	{
		// Show or hide reverse script textarea whether the effect is immediate.
		if(event.target.name === "immediate") {
			const form = event.currentTarget,
				  formData = new FormDataExtended(form),
				  reverseScriptContainer = form.querySelector(".reverse-script-container");

			reverseScriptContainer.style.display = formData.object.immediate ? "block" : "none";
		}

		super._onChangeForm(formConfig, event);
	}

	/**
	 * Prepends symbols to an enriched description of the effect.
	 * @protected
	 */
	async _prepareEnrichedDescription()
	{
		let enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(this.effect.description);
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
	 * Processes form submission for the Action Effect Editor.
	 * @this {ActionEffectEditor} The handler is called with the application as its bound scope.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #onActionEffectFormSubmit(event, form, formData)
	{
		const symbol = formData.object.symbol ?? this.data.symbol,
			  effects = this.action.system[this.face].effects[symbol],
			  data = foundry.utils.expandObject(formData.object);

		// If the index exists, update the effect, else add the new effect.
		this.data.index ? effects[this.data.index] = data : effects.push(data);

		this.action.update({[`system.${this.face}.effects.${symbol}`]: effects});
	}
}