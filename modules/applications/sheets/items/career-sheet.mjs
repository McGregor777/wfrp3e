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
		classes: ["career"]
	};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		main: {template: "systems/wfrp3e/templates/applications/sheets/items/career-sheet/main.hbs"},
		advanceOptions: {template: "systems/wfrp3e/templates/applications/sheets/items/career-sheet/advance-options.hbs"},
		setting: {template: "systems/wfrp3e/templates/applications/sheets/items/career-sheet/setting.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/sheets/items/effects.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "main", icon: "fa-solid fa-book"},
				{id: "advanceOptions", icon: "fa-solid fa-chevron-up"},
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
			case "setting":
				partContext.fields = this.item.system.schema.fields;
				break;
		}

		return partContext;
	}

	/** @inheritDoc */
	_processFormData(event, form, formData)
	{
		const data = foundry.utils.expandObject(formData.object);

		if(data.system.sockets.element.type) {
			const socketData = data.system.sockets.element;
			const sockets = [];

			if(Array.isArray(socketData.type))
				for(let i = 0; i < socketData.type.length; i++) {
					sockets.push({type: socketData.type[i]});
				}
			else
				sockets.push({type: socketData.type});

			data.system.sockets = sockets;
		}

		// Make sure that race restriction "any" removes every other race restriction.
		if(data.system.raceRestrictions.includes("any") && !this.item.system.raceRestrictions.includes("any"))
			data.system.raceRestrictions = ["any"];
		else if(this.item.system.raceRestrictions.includes("any")
			&& data.system.raceRestrictions.find(value => value !== "any").length)
			data.system.raceRestrictions.splice(
				data.system.raceRestrictions.findIndex(value => value === "any"),
				1
			)

		return data;
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
