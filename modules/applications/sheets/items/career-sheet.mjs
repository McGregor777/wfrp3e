import ItemSheet from "./item-sheet.mjs";

/** @inheritDoc */
export default class CareerSheet extends ItemSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			addSocket: this.#addSocket,
			deleteSocket: this.#deleteSocket
		},
		classes: ["career"],
		position: {width: 740}
	};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		main: {template: "systems/wfrp3e/templates/applications/sheets/items/career-sheet/main.hbs"},
		advanceOptions: {template: "systems/wfrp3e/templates/applications/sheets/items/career-sheet/advance-options.hbs"},
		advances: {template: "systems/wfrp3e/templates/applications/sheets/items/career-sheet/advances.hbs"},
		setting: {template: "systems/wfrp3e/templates/applications/sheets/items/career-sheet/setting.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/sheets/items/effects.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "main", icon: "fa-solid fa-book"},
				{id: "advanceOptions", icon: "fa-solid fa-gear"},
				{id: "advances", icon: "fa-solid fa-chevrons-up"},
				{id: "setting", icon: "fa-solid fa-scroll"},
				{id: "effects", icon: "fa-fw fa-solid fa-person-rays"}
			],
			initial: "main",
			labelPrefix: "CAREER.TABS"
		}
	};

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		switch(partId) {
			case "advanceOptions":
				partContext = {
					...partContext,
					fields: this.item.system.schema.fields.advanceOptions.fields,
					system: this.item.system.advanceOptions
				};
				break;
			case "advances":
				partContext = {
					...partContext,
					fields: this.item.system.schema.fields.advances.fields,
					system: this.item.system.advances
				};
				break;
			case "setting":
				partContext.fields = this.item.system.schema.fields;
				break;
		}

		return partContext;
	}

	/** @inheritDoc */
	_prepareTabs(group)
	{
		const tabs = super._prepareTabs(group);

		if(!this.item.parent)
			tabs.advances.cssClass += " hidden";

		return tabs;
	}

	/** @inheritDoc */
	_processFormData(event, form, formData)
	{
		const data = foundry.utils.expandObject(formData.object);

		if(data.system.advances.open.element)
			data.system.advances.open = this.#processArrayField(data.system.advances.open.element);

		if(data.system.advances.nonCareer.element)
			data.system.advances.nonCareer = this.#processArrayField(data.system.advances.nonCareer.element);

		if(data.system.sockets.element)
			data.system.sockets = this.#processArrayField(data.system.sockets.element);

		// Make sure that race restriction "any" removes every other race restriction.
		const raceRestrictions = data.system.raceRestrictions,
			  careerCurrentlyForAny = this.item.system.raceRestrictions.includes("any");

		if(!careerCurrentlyForAny && raceRestrictions.includes("any"))
			data.system.raceRestrictions = ["any"];
		else if(careerCurrentlyForAny && raceRestrictions.find(value => value !== "any")?.length)
			data.system.raceRestrictions.splice(raceRestrictions.indexOf("any"), 1);

		return data;
	}

	/**
	 * Processes elements of an array field coming from submitted form data to send back a properly formatted array.
	 * @param {Object} data Raw data for an array field.
	 * @returns {Object[]} Processed array field data.
	 */
	#processArrayField(data)
	{
		const newArray = [];

		for(const [key, value] of Object.entries(data))
			if(Array.isArray(value))
				for(let i = 0; i < value.length; i++)
					// Either push a new element into the array, or add a new property to the existing element.
					newArray.length <= i ? newArray.push({[key]: value[i]}) : newArray[i][key] = value[i];
			else
				newArray.length <= 0 ? newArray.push({[key]: value}) : newArray[key] = value;

		return newArray;
	}

	/**
	 * Creates a new socket for the edited career.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #addSocket()
	{
		await this.item.addNewSocket();
	}

	/**
	 * Deletes a specific socket of the career.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #deleteSocket(event, target)
	{
		await this.item.deleteSocket(target.closest("[data-index]").dataset.index);
	}
}
