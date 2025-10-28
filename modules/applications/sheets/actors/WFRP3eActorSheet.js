/** @inheritDoc */
export default class WFRP3eActorSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2)
{
	constructor(options = {})
	{
		super(options);
		this.searchFilters = {
			actions: {text: "", type: "all"},
			talents: {text: "", type: "all"}
		};
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			addActiveEffect: this.#addActiveEffect,
			adjustImpairment: {handler: this.#adjustImpairment, buttons: [0, 2]},
			adjustQuantity: {handler: this.#adjustQuantity, buttons: [0, 2]},
			adjustRechargeTokens: {handler: this.#adjustRechargeTokens, buttons: [0, 2]},
			adjustStanceMeter: {handler: this.#adjustStanceMeter, buttons: [0, 2]},
			deleteDocument: this.#deleteDocument,
			editDocument: this.#editDocument,
			flip: this.#flip,
			openFilters: this.#openFilters,
			rollCharacteristicCheck: this.#rollCharacteristicCheck,
			rollItem: this.#rollItem,
			useDocument: {handler:  this.#useDocument, buttons: [0, 2]},
			switchDisplayMode: this.#switchItemsDisplayMode,
			toggleItemDetails: this.#toggleItemDetails
		},
		classes: ["wfrp3e", "sheet", "actor"],
		form: {submitOnChange: true},
		window: {
			contentClasses: ["standard-form"],
			controls: [{
				action: "switchDisplayMode",
				icon: "fa-solid fa-display",
				label: "ACTOR.CONTROLS.switchDisplayMode",
				ownership: "OWNER"
			}]
		}
	};

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			system: this.actor.system
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partContext.tabs && partId in partContext.tabs)
			partContext.tab = partContext.tabs[partId];

		const textEditor = foundry.applications.ux.TextEditor.implementation,
			  enrichment = {};
		switch(partId) {
			case "talents":
				let items = [...this.actor.itemTypes.talent, ...this.actor.itemTypes.ability];

				if(this.searchFilters.talents.text || this.searchFilters.talents.type !== "all") {
					const filters = [];

					if(this.searchFilters.talents.type in CONFIG.WFRP3e.talentTypes)
						filters.push({
							field: "type",
							operator: "contains",
							value: ["talent"]
						}, {
							field: "system.type",
							operator: "equals",
							value: this.searchFilters.talents.type
						});
					else if(this.searchFilters.talents.type === "ability")
						filters.push({
							field: "type",
							operator: "contains",
							value: ["ability"]
						});

					items = this.actor.items.search({query: this.searchFilters.talents.text ?? "", filters});
				}

				if(this.actor.getFlag("wfrp3e", "embeddedItemsDisplayMode") === "cards")
					for(const item of items)
						enrichment[item.uuid] = await textEditor.enrichHTML(
							item.system.description
						);

				partContext = {
					...partContext,
					enrichment,
					fields: this.actor.system.schema.fields,
					items: items.sort((a, b) => a.name.localeCompare(b.name)),
					searchFilters: this.searchFilters?.talents,
					socketsByType: await this.actor.buildSocketList(),
					types: {
						all: "ACTOR.SHEET.all",
						ability: "ABILITY.plural",
						...CONFIG.WFRP3e.talentTypes
					}
				};
				break;
			case "actions":
				let actions = this.actor.itemTypes.action;

				if(this.searchFilters.actions.text || this.searchFilters.actions.type !== "all") {
					const filters = [{
						field: "type",
						operator: "equals",
						value: "action"
					}];

					if(this.searchFilters.actions.type !== "all")
						filters.push({
							field: "system.type",
							operator: "equals",
							value: this.searchFilters.actions.type
						});

					actions = this.actor.items.search({query: this.searchFilters.actions.text ?? "", filters});
				}

				if(this.actor.getFlag("wfrp3e", "embeddedItemsDisplayMode") === "cards")
					for(const action of actions)
						for(const stance of Object.keys(CONFIG.WFRP3e.stances)) {
							if(action.system[stance].requirements)
								enrichment[`${action.uuid}-${stance}.requirements`] = await textEditor.enrichHTML(
									action.system[stance].requirements
								);

							if(action.system[stance].special)
								enrichment[`${action.uuid}-${stance}.special`] = await textEditor.enrichHTML(
									action.system[stance].special
								);

							if(action.system[stance].uniqueEffect)
								enrichment[`${action.uuid}-${stance}.uniqueEffect`] = await textEditor.enrichHTML(
									action.system[stance].uniqueEffect
								);

							for(const symbol of Object.keys(CONFIG.WFRP3e.symbols))
								for(const [key, effect] of Object.entries(action.system[stance].effects[symbol]))
									enrichment[`${action.uuid}-${stance}.${symbol}.${key}`] = await textEditor.enrichHTML(
										effect.description
									);
						}

				partContext = {
					...partContext,
					actions: actions.sort((a, b) => a.name.localeCompare(b.name)),
					defaultStance: this.actor.system.defaultStance,
					enrichment,
					fields: this.actor.system.schema.fields,
					searchFilters: this.searchFilters?.actions,
					stances: CONFIG.WFRP3e.stances,
					symbols: CONFIG.WFRP3e.symbols,
					types: {
						all: "ACTOR.SHEET.all",
						...CONFIG.WFRP3e.actionTypes
					}
				};
				break;
			case "trappings":
				partContext = {
					...partContext,
					armours: this.actor.itemTypes.armour.sort((a, b) => a.name.localeCompare(b.name)),
					fields: this.actor.system.schema.fields,
					money: this.actor.itemTypes.money.sort((a, b) => a.name.localeCompare(b.name)),
					weaponGroups: CONFIG.WFRP3e.weapon.groups,
					weaponQualities: CONFIG.WFRP3e.weapon.qualities,
					weaponRanges: CONFIG.WFRP3e.weapon.ranges,
					trappings: this.actor.itemTypes.trapping.sort((a, b) => a.name.localeCompare(b.name)),
					weapons: this.actor.itemTypes.weapon.sort((a, b) => a.name.localeCompare(b.name))
				};
				break;
			case "effects":
				partContext = {
					...partContext,
					durations: CONFIG.WFRP3e.conditionDurations,
					effects: this.actor.effects,
					items: [
						...this.actor.itemTypes.condition,
						...this.actor.itemTypes.criticalWound,
						...this.actor.itemTypes.disease,
						...this.actor.itemTypes.insanity,
						...this.actor.itemTypes.miscast,
						...this.actor.itemTypes.mutation
					].sort((a, b) => a.name.localeCompare(b.name)),
					symptoms: CONFIG.WFRP3e.disease.symptoms,
					types: {
						all: "ACTOR.SHEET.all",
						condition: "CONDITION.plural",
						criticalWound: "CRITICALWOUND.plural",
						disease: "DISEASE.plural",
						insanity: "INSANITY.plural",
						miscast: "MISCAST.plural",
						mutation: "MUTATION.plural",
					}
				};
				break;
		}

		return partContext;
	}

	/** @inheritDoc */
	_prepareTabs(group)
	{
		const tabs = super._prepareTabs(group);

		if(this.actor.type in ["character", "creature"]) {
			if((this.actor.itemTypes.ability.length + this.actor.itemTypes.talent.length) <= 0)
				tabs.talents.cssClass += " hidden";

			if(this.actor.itemTypes.action.length <= 0)
				tabs.actions.cssClass += " hidden";

			if((this.actor.itemTypes.armour.length
				+ this.actor.itemTypes.money.length
				+ this.actor.itemTypes.trapping.length
				+ this.actor.itemTypes.weapon.length) <= 0)
				tabs.trappings.cssClass += " hidden";
		}

		return tabs;
	}

	/** @inheritDoc */
	async _onFirstRender(context, options)
	{
		await super._onFirstRender(context, options);

		this._createContextMenu(this._getContextMenuOptions, ".item", {fixed: true});
		this._createContextMenu(this._getContextMenuOptions, ".context-menu", {eventName : "click", fixed: true});
	}

	/** @inheritDoc */
	async _onRender(context, options)
	{
		await super._onRender(context, options);

		for(const element of this.element.querySelectorAll(".search-bar input.search-filter"))
			element.addEventListener("change", this._onSearchChange.bind(this, options));

		for(const element of this.element.querySelectorAll(".item-input"))
			element.addEventListener("change", this._onItemInput.bind(this, options));
	}

	/**
	 * Find all Documents which match a given search term using a full-text search against their indexed HTML fields and
	 * their name. If filters are provided, results are filtered to only those that match the provided values.
	 * @param options
	 * @param event {Event}
	 * @protected
	 */
	async _onSearchChange(options, event)
	{
		event.preventDefault();
		event.stopPropagation();

		foundry.utils.setProperty(this, event.target.name, event.target.value);

		await this.render(options);
	}

	async _onItemInput(options, event)
	{
		event.preventDefault();
		event.stopPropagation();

		const item = await this._getByUuid(event),
			  input = event.target,
			  name = input.name,
			  property = input.dataset.property;
		let value = input.value;

		if(value === "on")
			value = true;
		else if(value === "")
			value = null;

		if(this.element.querySelectorAll(`input[name="${name}"][type="checkbox"]`).length > 1
			&& foundry.utils.getProperty(item, name) === Number(value))
			Number(value--);

		if(property) {
			foundry.utils.setProperty(item, name, value);
			await item.update({[property]: foundry.utils.getProperty(item, property)});
		}
		else
			await item.update({[name]: value});
	}

	/**
	 * Get the set of ContextMenu options which should be used for journal entry pages in the sidebar.
	 * @returns {ContextMenuEntry[]}
	 * @protected
	 */
	_getContextMenuOptions()
	{
		return [{
			name: "ACTOR.ACTIONS.rollItem",
			icon: '<i class="fa-solid fa-dice-d20"></i>',
			condition: async html => {
				const document = await fromUuid(html.closest("[data-uuid]").dataset.uuid);
				return this.isEditable
					&& document.canUserModify(game.user, "update")
					&& ["action", "skill", "weapon"].includes(document.type)
			},
			callback: async html => {
				const documentElement = html.closest("[data-uuid]"),
					  options = {},
					  face = html.querySelector(".face")?.dataset.face;

				if(face)
					options.face = face;

				await fromUuid(documentElement.dataset.uuid).then(item => item.useItem(options));
			}
		}, {
			name: "Expand",
			icon: '<i class="fa-solid fa-chevron-down"></i>',
			condition: html => html.closest(".row:not(.expanded)"),
			callback: async html => WFRP3eActorSheet.#toggleItemDetails(null, html)
		}, {
			name: "Collapse",
			icon: '<i class="fa-solid fa-chevron-up"></i>',
			condition: html => html.closest(".row.expanded"),
			callback: async html => WFRP3eActorSheet.#toggleItemDetails(null, html)
		}, {
			name: "ACTOR.ACTIONS.flip",
			icon: '<i class="fa-solid fa-undo"></i>',
			condition: html => html.closest(".face") || html.querySelector(".face"),
			callback: async html => {
				const documentElement = html.closest(".item"),
					  activeFaceElements = documentElement.querySelectorAll(".face.active"),
					  inactiveFaceElements = documentElement.querySelectorAll(".face:not(.active)");

				activeFaceElements.forEach(html => html.classList.remove("active"));
				inactiveFaceElements.forEach(html => html.classList.add("active"));
			}
		}, {
			name: "ACTOR.ACTIONS.editDocument",
			icon: '<i class="fa-solid fa-pen-to-square"></i>',
			condition: html => this.isEditable
				&& fromUuidSync(html.closest("[data-uuid]").dataset.uuid).canUserModify(game.user, "update"),
			callback: async html => await fromUuid(html.closest("[data-uuid]").dataset.uuid)
				.then(document => document.sheet.render(true))
		}, {
			name: "Delete",
			icon: '<i class="fa-solid fa-trash"></i>',
			condition: html => this.isEditable
				&& fromUuidSync(html.closest("[data-uuid]").dataset.uuid).canUserModify(game.user, "update"),
			callback: async html => {
				const document = await fromUuid(html.closest("[data-uuid]").dataset.uuid);

				await foundry.applications.api.DialogV2.confirm({
					window: {title: game.i18n.localize("APPLICATION.TITLE.DeleteItem")},
					modal: true,
					content: `<p>${game.i18n.format("APPLICATION.DESCRIPTION.DeleteItem", {item: document.name})}</p>`,
					submit: async (result) => {
						if(result)
							await this.actor.deleteEmbeddedDocuments("Item", [document._id]);
					}
				});
			}
		}];
	}

	/**
	 * Get a Document from its UUID.
	 * @param {Event} event
	 * @returns {Promise<Document>}
	 * @protected
	 */
	async _getByUuid(event)
	{
		return await fromUuid(event.target.closest("[data-uuid]").dataset.uuid);
	}

	/**
	 * Adds a new effect to the Actor.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #addActiveEffect()
	{
		await this.actor.createEffect();
	}

	/**
	 * Either increments or decrements a specific impairment value depending on the clicked button.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #adjustImpairment(event, target)
	{
		let amount = 0;

		switch(event.button) {
			case 0:
				amount = 1;
				break;
			case 2:
				amount = -1;
				break;
		}

		await this.actor.adjustImpairment(target.closest("[data-impairment]").dataset.impairment, amount);
	}

	/**
	 * Either increments or decrements the quantity of a trapping depending on the clicked button.
	 * @param {PointerEvent} event
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #adjustQuantity(event)
	{
		let amount = 0;

		switch(event.button) {
			case 0:
				amount = 1;
				break;
			case 2:
				amount = -1;
				break;
		}

		await this._getByUuid(event).changeQuantity(event.ctrlKey ? amount * 10 : amount);
	}

	/**
	 * Either adds or removes a recharge token on a WFRP3eItem depending on the clicked button.
	 * @param {PointerEvent} event
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #adjustRechargeTokens(event)
	{
		const item = await this._getByUuid(event);
		let amount = 0;

		switch(event.button) {
			case 0:
				amount = 1;
				break;
			case 2:
				amount = -1;
				break;
		}

		await item.update({"system.rechargeTokens": item.system.rechargeTokens + amount});
	}

	/**
	 * Either increases or decrements the amount of segment of the Actor's stance meter, depending on the clicked button
	 * and the type of segment clicked.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #adjustStanceMeter(event, target)
	{
		let amount = 0;

		switch(event.button) {
			case 0:
				amount = 1;
				break;
			case 2:
				amount = -1;
				break;
		}

		await this.actor.adjustStanceMeter(target.closest("[data-stance]").dataset.stance, amount);
	}

	/**
	 * Asks for confirmation for a specific Document definitive removal.
	 * @param {PointerEvent} event
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #deleteDocument(event)
	{
		const document = await this._getByUuid(event);

		await foundry.applications.api.DialogV2.confirm({
			window: {title: game.i18n.localize("APPLICATION.TITLE.DeleteItem")},
			modal: true,
			content: `<p>${game.i18n.format("APPLICATION.DESCRIPTION.DeleteItem", {item: document.name})}</p>`,
			submit: async (result) => {
				if(result)
					await this.actor.deleteEmbeddedDocuments("Item", [document._id]);
			}
		});
	}

	/**
	 * Opens a Document's sheet.
	 * @param {PointerEvent} event
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #editDocument(event)
	{
		await this._getByUuid(event).then(document => document.sheet.render(true));
	}

	/**
	 * Appends an element with additional details about an item, or removes the element if it already exists.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #toggleItemDetails(event, target)
	{
		const itemElement = target.closest(".item[data-uuid]"),
			  toggleLinks = itemElement.querySelectorAll('a[data-action="#toggleItemDetails"]');

		if(itemElement.classList.contains("expanded")) {
			// Toggle expansion for an item
			const detailsElement = itemElement.querySelector(".details");
			$(detailsElement).slideUp(200, () => detailsElement.remove());

			for(const element of toggleLinks)
				element.dataset.tooltip = game.i18n.localize("Expand");
		}
		else {
			// Add the item details below the row.
			const item = await fromUuid(itemElement.dataset.uuid),
				  detailsElement = document.createElement("div"),
				  options = {},
				  activeFace = itemElement.querySelector(".active[data-face]")?.dataset.face;

			if(activeFace)
				options.face = activeFace;

			detailsElement.classList.add("details");
			detailsElement.innerHTML = await item.getDetails(options);

			itemElement.append(detailsElement);
			$(detailsElement).hide();
			$(detailsElement).slideDown(200);

			for(const element of toggleLinks)
				element.dataset.tooltip = game.i18n.localize("Collapse");
		}

		itemElement.classList.toggle("expanded");
	}

	/**
	 * Switches between two faces of a Document.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #flip(event, target)
	{
		const itemElement = target.closest(".item"),
			  activeFace = itemElement.querySelector(".face.active"),
			  inactiveFace = itemElement.querySelector(".face:not(.active)");

		activeFace.classList.remove("active");
		inactiveFace.classList.add("active");
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
	 * Initiates a check based on the clicked characteristic.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @private
	 */
	static async #rollCharacteristicCheck(event, target)
	{
		await this.actor.performCharacteristicCheck(target.dataset.characteristic);
	}

	/**
	 * Makes usage of an Item depending on its type.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #rollItem(event, target)
	{
		const options = {},
			  face = target.closest(".face")?.dataset.face;

		if(face)
			options.face = face;

		await this._getByUuid(event).then(item => item.useItem(options));
	}

	/**
	 * Switches the display mode of the Actor's embedded Items, between cards/game sheets or tables.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #switchItemsDisplayMode()
	{
		this.actor.setFlag(
			"wfrp3e",
			"embeddedItemsDisplayMode",
			this.actor.getFlag("wfrp3e", "embeddedItemsDisplayMode") !== "tables" ? "tables" : "cards"
		);
	}

	/**
	 * Makes usage of an Item depending on its type.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #useDocument(event, target)
	{
		const document = await this._getByUuid(event);

		if(event.button === 0 && ["ability", "action", "skill", "talent", "weapon"].includes(document.type)) {
			const options = {},
				  face = target.closest(".face")?.dataset.face;

			if(face)
				options.face = face;

			document.useItem(options);
		}
		else
			await document.sheet.render(true);
	}
}