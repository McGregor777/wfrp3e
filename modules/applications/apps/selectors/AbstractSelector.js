import {capitalize} from "../../../helpers.js";

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
			throw new Error("An Array of Objects is needed for any Selector.");
		this.items = options.items;

		if(options.size)
			this.size = options.size;

		this.strictSelection = !(options.strictSelection ?? this.size > 1);

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
		form: {handler: this.#onSelectorFormSubmit},
		position: {width: 850}
	};

	/** @inheritDoc */
	static PARTS = {
		search: {template: "systems/wfrp3e/templates/applications/apps/selectors/search.hbs"},
		main: {
			template: "systems/wfrp3e/templates/applications/apps/selectors/main.hbs",
			scrollable: [".item-container"]
		},
		selection: {template: "systems/wfrp3e/templates/applications/apps/selectors/selection.hbs"},
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
	size = 1;

	/**
	 * Whether selection has to be thoroughly completed to submit it.
	 * If true, a warning is raised on submission of an incomplete selection.
	 * If false, the user is prompted to confirm the submission of an incomplete selection.
	 * @type {boolean}
	 */
	strictSelection = true;

	/**
	 * The type of the Selector.
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
	 * Checks for any error in the current selection and returns the type error if any is found.
	 * @returns {string|false} The type of error, or false if no error has been found.
	 * @protected
	 */
	_checkForError()
	{
		if(this.remainingSelectionSize < 0)
			return "tooManySelection";

		return false;
	}

	/**
	 * Checks for any warning in the current selection and returns the type warning if any is found.
	 * @returns {string|false} The type of warning, or false if no warning has been found.
	 * @protected
	 */
	_checkForWarning()
	{
		if(!this.selection.length)
			return "noSelection";
		else if(this.remainingSelectionSize !== 0)
			return "notEnoughSelection";

		return false;
	}

	/**
	 * Prompts the user to confirm the selection submission.
	 * @param {string} [warning] The type of warning described in the dialog.
	 * @returns {Promise<boolean>} {} The choice of the user, true if confirmed, false otherwise.
	 */
	async _askConfirmation(warning)
	{
		const selectorType = this.constructor.name,
			  warningKey = `${capitalize(selectorType)}.WARNINGS.${warning}`;
		let title = game.i18n.localize(`${warningKey}.title`),
			content = game.i18n.localize(`${warningKey}.description`);

		// Ensure that the Dialog's title and content have a fallback translation.
		if(title === `${warningKey}.title`)
			title = game.i18n.localize(`SELECTOR.WARNINGS.${warning}.title`);
		if(content === `${warningKey}.description`)
			content = game.i18n.localize(`SELECTOR.WARNINGS.${warning}.description`);

		content = `<p>${content} ${game.i18n.localize("SELECTOR.proceedDialog")}</p>`;

		return await foundry.applications.api.DialogV2.confirm({
			window: {title},
			modal: true,
			content
		});
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
		const error = this._checkForError();
		if(error)
			return ui.notifications.error(game.i18n.format("SELECTOR.WARNINGS.cannotSubmit", {
				error: game.i18n.localize(`${capitalize(this.constructor.name)}.WARNINGS.${error}`)
			}));

		const warning = this._checkForWarning();
		if(warning && this.strictSelection)
			return ui.notifications.warn(game.i18n.format("SELECTOR.WARNINGS.cannotSubmit", {
				error: game.i18n.localize(`${capitalize(this.constructor.name)}.WARNINGS.${warning}.description`)
			}));

		if(!warning || await this._askConfirmation(warning)) {
			this.options.submit(formData.object.selection);
			await this.close({submitted: true});
		}
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
