/**
 * @inheritDoc
 * @abstract
 */
export default class AbstractSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);

		if(!options.items)
			throw new Error("An Array of WFRP3eItems is needed for any Selector.");

		this.items = options.items;
		if(options.size)
			this.size = options.size;

		this.searchFilters = {text: "", type: "all"};
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "selector-{id}",
		classes: ["wfrp3e", "selector"],
		tag: "form",
		actions: {openFilters: this.#openFilters},
		window: {
			contentClasses: ["standard-form"],
			title: "SELECTOR.title"
		},
		form: {
			handler: this.#onSelectorFormSubmit,
			closeOnSubmit: true
		},
		position: {width: 850}
	};

	/** @inheritDoc */
	static PARTS = {
		search: {template: "systems/wfrp3e/templates/applications/selectors/search.hbs"},
		main: {
			template: "systems/wfrp3e/templates/applications/selectors/main.hbs",
			scrollable: [".item-container"]
		},
		selection: {template: "systems/wfrp3e/templates/applications/selectors/selection.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/**
	 * The array of WFRP3eItem the Selector allows to choose from.
	 * @type {WFRP3eItem[]}
	 */
	items = [];

	/**
	 * The array of selected items.
	 * @type {any[]}
	 */
	selection = [];

	/**
	 * The number of items to select.
	 * @type {number}
	 */
	size= 1;

	/**
	 * The type of WFRP3eItem concerned by the Selector.
	 * @type {string}
	 */
	type = "";

	/**
	 * Returns the number of specialisations remaining to select.
	 * @returns {number}
	 */
	get remainingSelectionSize()
	{
		return this.size - this.selection.length;
	}

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			rootId: this.id
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partContext.tabs && partId in partContext.tabs)
			partContext.tab = partContext.tabs[partId];

		switch(partId) {
			case "main":
				const regex = new RegExp(RegExp.escape(this.searchFilters.text), "i");
				partContext = {
					...partContext,
					items: this.items
						.filter(item => ((!this.searchFilters.text
							|| AbstractSelector.#searchTextFields(item, DocumentCollection.getSearchableFields(item.documentName, item.type), regex))
							&& (this.searchFilters.type === "all" || this.searchFilters.type === item.system.type)))
						.sort((a, b) => a.name.localeCompare(b.name)),
					selection: this.selection
				};
				break;
			case "search":
				partContext.searchFilters = this.searchFilters;
				break;
			case "selection":
				partContext = {
					...partContext,
					selectedItems: this._getSelectedItems(),
					type: this.type
				}
				break;
		}

		return partContext;
	}

	/** @inheritDoc */
	async _onChangeForm(formConfig, event)
	{
		switch(event.target.name) {
			case "selection":
				this._handleNewSelection(event.target.value, formConfig, event);
				break;
			case "searchFilters.text":
			case "searchFilters.type":
				foundry.utils.setProperty(this, event.target.name, event.target.value);
				break;
		}

		super._onChangeForm(formConfig, event);

		this.render();
	}

	/**
	 * Performs action following a new selection.
	 * @param {any} value The new selection.
	 * @param {ApplicationFormConfiguration} formConfig The form configuration for which this handler is bound.
	 * @param {Event} event An input change event within the form.
	 * @protected
	 */
	_handleNewSelection(value, formConfig, event)
	{
		if((typeof value === "object" && this.selection.map(selection => JSON.stringify(selection)).includes(JSON.stringify(value)))
			|| this.selection.includes(value))
			ui.notifications.warn(game.i18n.localize("SELECTOR.WARNINGS.alreadySelected"));
		else if(this.size === 1 && !Array.isArray(value))
			this.selection = [value];
		else if(this.remainingSelectionSize < 1
			|| Array.isArray(value) && value.length + this.selection.length > this.remainingSelectionSize)
			ui.notifications.warn(game.i18n.localize("SELECTOR.WARNINGS.maximumSelectionSizeReached"));
		else
			Array.isArray(value) ? this.selection.push(...value) : this.selection.push(value);
	}

	/**
	 * Fetches every item which UUID is in the selection.
	 * @returns {WFRP3eItem[]}
	 * @protected
	 */
	_getSelectedItems()
	{
		return this.selection.map(selection => fromUuidSync(selection));
	}

	/**
	 * Spawns a Selector and waits for it to be dismissed or submitted.
	 * @param {ApplicationConfiguration} [config]
	 * @returns {Promise<any>} Resolves to the selected item(s).
	 */
	static async wait(config = {})
	{
		return new Promise(async (resolve, reject) => {
			// Wrap the submission handler with Promise resolution.
			config.submit = async result => {resolve(result)};
			const selector = new this(config);
			selector.addEventListener("close", event => reject(), {once: true});
			selector.render({force: true});
		});
	}

	/**
	 * Processes form submission for the Selector.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 */
	static async #onSelectorFormSubmit(event, form, formData)
	{
		if(!this.selection.length)
			return ui.notifications.warn(game.i18n.format("SELECTOR.WARNINGS.cannotSubmit", {
				error: game.i18n.localize("SELECTOR.WARNINGS.noSelection")
			}));
		else if(this.selection.length < this.size)
			return ui.notifications.warn(game.i18n.format("SELECTOR.WARNINGS.cannotSubmit", {
				error: game.i18n.localize("SELECTOR.WARNINGS.notEnoughSelection")
			}));
		else
			this.options.submit(formData.object.selection);
	}

	/**
	 * Shows an element containing filters allowing to refine search queries.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @private
	 */
	static #openFilters(event, target)
	{
		target.closest(".search-bar").querySelector(".filter-container").classList.toggle("show");
	}

	/**
	 * Recursively search text fields.
	 * @param {object} data
	 * @param {Record<string, SearchableField>} searchFields
	 * @param {RegExp} regex
	 * @param {DOMParser} [domParser]
	 */
	static #searchTextFields(data, searchFields, regex, domParser) {
		for(const [key, field] of Object.entries(searchFields)) {
			let value = data[key];

			if(!value)
				continue;

			const typeValue = foundry.utils.getType(value);

			if(typeValue === "string") {
				if(field instanceof foundry.data.fields.HTMLField) {
					domParser ??= new DOMParser();
					// TODO: Ideally we would search the text content of enriched HTML
					value = domParser.parseFromString(value, "text/html").body.textContent;
				}

				if(foundry.applications.ux.SearchFilter.testQuery(regex, value))
					return true;
			}
			else if(typeValue === "Array") {
				if(value.some(x => foundry.applications.ux.SearchFilter.testQuery(regex, x)))
					return true;
			}
			else if(typeValue === "Object") {
				const match = this.#searchTextFields(value, field, regex, domParser);

				if(match)
					return true;
			}
		}

		return false;
	}
}