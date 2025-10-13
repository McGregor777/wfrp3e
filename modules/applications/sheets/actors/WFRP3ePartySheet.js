import WFRP3eActorSheet from "./WFRP3eActorSheet.js";

/** @inheritDoc */
export default class WFRP3ePartySheet extends WFRP3eActorSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			addSocket: this.#addSocket,
			adjustFortunePool: {handler: this.#adjustFortunePool, buttons: [0, 2]},
			decreaseTensionMeter: this.#decreaseTensionMeter,
			deleteSocket: this.#deleteSocket,
			editEvent: this.#editEvent,
			increaseTensionMeter: this.#increaseTensionMeter,
			removeMember: this.#removeMember
		},
		classes: ["party"],
		position: {width: 800}
	};

	/** @inheritDoc */
	static PARTS = {
		attributes: {
			template: "systems/wfrp3e/templates/applications/actors/party-sheet/attributes.hbs",
			scrollable: [".sockets"]
		},
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
			labelPrefix: "PARTY.TABS"
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
					enriched: {
						specialAbility: {
							description: await foundry.applications.ux.TextEditor.enrichHTML(
								this.actor.system.specialAbility.description
							)
						}
					},
					members: this.actor.system.members.map(member => fromUuidSync(member)),
					fields: this.actor.system.schema.fields
				};
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

	/** @inheritDoc */
	async _onDropActor(event, actor)
	{
		await this.actor.addNewPartyMember(actor);
	}

	/**
	 * Adds a new socket to the Party.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #addSocket()
	{
		await this.actor.addNewSocket();
	}

	/**
	 * Either increments or decrements the amount of fortune points in the Party pool depending on the clicked button.
	 * @param {PointerEvent} event
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #adjustFortunePool(event)
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

		await this.actor.update({"system.fortunePool": this.actor.system.fortunePool + amount});
	}

	/**
	 * Increases the Party's tension meter by one.
	 * @param {PointerEvent} event
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #increaseTensionMeter(event)
	{
		await this.actor.update({"system.tension.value": this.actor.system.tension.value + 1});
	}

	/**
	 * Decreases the Party's tension meter by one.
	 * @param {PointerEvent} event
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #decreaseTensionMeter(event)
	{
		await this.actor.update({"system.tension.max": this.actor.system.tension.max - 1});
	}

	/**
	 * Deletes a specific socket of the Party.
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
	 * Opens the Party Event Editor to edit a specific Party event.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #editEvent(event, target)
	{
		await this.actor.editPartyEvent(target.closest(".event[data-index]").dataset.index);
	}

	/**
	 * Removes a member from the Party's list of members.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 */
	static async #removeMember(event, target)
	{
		const actorUuid = target.closest(".member[data-uuid]").dataset.uuid;
		await this.actor.removeMember(await fromUuid(actorUuid) ?? actorUuid);
	}
}