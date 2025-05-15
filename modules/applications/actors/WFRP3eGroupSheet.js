import WFRP3eActorSheet from "./WFRP3eActorSheet.js";

/** @inheritDoc */
export default class WFRP3eGroupSheet extends WFRP3eActorSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			addSocket: this.#addSocket,
			decreaseAbilityTrack: this.#decreaseAbilityTrack,
			deleteSocket: this.#deleteSocket,
			editAbilityTrack: this.#editAbilityTrack,
			increaseAbilityTrack: this.#increaseAbilityTrack
		},
		classes: ["group"],
		position: {width: 800}
	};

	/** @inheritDoc */
	static PARTS = {
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		attributes: {template: "systems/wfrp3e/templates/applications/actors/group-sheet/attributes.hbs"},
		talents: {
			template: "systems/wfrp3e/templates/applications/actors/talents.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		actions: {
			template: "systems/wfrp3e/templates/applications/actors/actions.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		effects: {
			template: "systems/wfrp3e/templates/applications/actors/effects.hbs",
			scrollable: [".item-container", ".table-body"]
		},
		trappings: {template: "systems/wfrp3e/templates/applications/actors/trappings.hbs"},
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "attributes"},
				{id: "talents"},
				{id: "actions"},
				{id: "effects"},
				{id: "trappings"}
			],
			initial: "attributes",
			labelPrefix: "GROUP.TABS"
		}
	};

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		switch(partId) {
			case "attributes":
				partContext = {
					...partContext,
					enriched: {specialAbilities: []},
					fields: this.actor.system.schema.fields
				};

				for(const ability of this.actor.system.specialAbilities)
					partContext.enriched.specialAbilities.push(
						await foundry.applications.ux.TextEditor.enrichHTML(ability.description)
					);

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

		return data;
	}

	/**
	 * Adds a new socket to the Group.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #addSocket()
	{
		await this.actor.addNewSocket();
	}

	/**
	 * Decreases one of the Group's ability track by one.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #decreaseAbilityTrack(event, target)
	{
		const specialAbilities= this.actor.system.specialAbilities;

		specialAbilities[target.closest(".ability-track").dataset.index].values.pop();

		await this.actor.update({"system.specialAbilities": this.actor.system.specialAbilities});
	}

	/**
	 * Increases one of the Group's ability track by one.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #increaseAbilityTrack(event, target)
	{
		const specialAbilities= this.actor.system.specialAbilities,
			  index = target.closest(".ability-track").dataset.index;

		specialAbilities[index].values.push({content: specialAbilities[index].values.length});

		await this.actor.update({"system.specialAbilities": this.actor.system.specialAbilities});
	}

	/**
	 * Deletes a specific socket of the Group.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #deleteSocket(event, target)
	{
		await this.actor.deleteSocket(target.closest("[data-index]").dataset.index);
	}

	/**
	 * Toggles Group's Special Ability hidden inputs in order to edit it.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #editAbilityTrack(event, target)
	{
		const abilityTrack = target.closest(".ability-track"),
			  editElement = abilityTrack.querySelector(".edit"),
			  regularElement = abilityTrack.querySelector(".regular");

		if(editElement.classList.contains("active")) {
			editElement.classList.remove("active");
			regularElement.classList.remove("hidden");
			target.innerHTML = '<span class="fas fa-pen-to-square"></span>';
		}
		else {
			editElement.classList.add("active");
			regularElement.classList.add("hidden");
			target.innerHTML = '<span class="fas fa-check"></span>';
		}
	}
}