import {capitalize} from "../helpers.mjs";

/**
 * The client-side Actor document which extends the common Actor model.
 * @event hookEvents.applyCompendiumArt
 * @event hookEvents.modifyTokenAttribute
 * @mixes ClientDocumentMixin
 * @see Actors The world-level collection of Actor documents.
 * @see ActorSheet The actor configuration application.
 */
export default class Actor extends foundry.documents.Actor
{
	/** @inheritDoc */
	_onCreate(data, options, userId)
	{
		super._onCreate(data, options, userId);

		try {
			const functionName = `_on${capitalize(this.type)}Create`;

			if(this[functionName])
				this[functionName](data, options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when updating the Actor ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/** @inheritDoc */
	_onDelete(options, userId)
	{
		super._onDelete(options, userId);

		try {
			const functionName = `_on${capitalize(this.type)}Delete`;

			if(this[functionName])
				this[functionName](options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when updating the Actor ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/** @inheritDoc */
	_onUpdate(changed, options, userId)
	{
		super._onUpdate(changed, options, userId);

		try {
			const functionName = `_on${capitalize(this.type)}Update`;

			if(this[functionName])
				this[functionName](changed, options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when updating the Actor ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/**
	 * Creates a new active effect for the actor.
	 * @param {Object} [data] An Object of optional data for the new active effect.
	 * @returns {Promise<void>}
	 */
	async createEffect(data = {})
	{
		await wfrp3e.documents.ActiveEffect.create({
			name: game.i18n.localize("DOCUMENT.ActiveEffect"),
			img: "icons/svg/dice-target.svg",
			...data
		}, {parent: this});
	}

	/**
	 * Prepares a characteristic check and shows a Check Builder to edit it. Rolls the check once edition is finished.
	 * @param {string} characteristic The name of the checked characteristic.
	 * @returns {Promise<void>}
	 */
	async performCharacteristicCheck(characteristic)
	{
		const diePool = await wfrp3e.applications.dice.CheckBuilder.wait({
			diePool: await wfrp3e.dice.DiePool.createFromCharacteristic(
				this,
				{name: characteristic, ...this.system.characteristics[characteristic]}
			)
		});
		await diePool.roll();
	}

	/**
	 * Adjusts the fortune pool of the Actor.
	 * @param {Number} value The value to add to the fortune pool or to remove from it.
	 * @returns {Promise<void>}
	 */
	async adjustFortune(value)
	{
		switch(this.type) {
			case "character":
				const newValue = this.system.fortune.value + value;

				if(newValue > this.system.fortune.max)
					ui.notifications.error(game.i18n.format("ACTOR.WARNINGS.maximumFortuneReached", {
						max: this.system.fortune.max
					}));

				await this.update({"system.fortune.value": newValue});
				break;
			case "party":
				await this.update({"system.fortunePool": this.system.fortunePool + value});
				break;
			default:
				return ui.notifications.error(`Unable to adjust the fortune pool of an Actor of type ${this.type}.`);
		}
	}

	/**
	 * Adjusts one of the Actor's impairment values.
	 * @param {string} impairment The impairment to update.
	 * @param {Number} value The value to add to the impairment.
	 * @returns {Promise<void>}
	 */
	async adjustImpairment(impairment, value)
	{
		await this.update({[`system.impairments.${impairment}`]: this.system.impairments[impairment] + value});
	}

	/**
	 * Adds or removes a specified number of segments on either side on the stance meter.
	 * @param {string} stance The name of the stance meter part that is getting adjusted.
	 * @param {number} number The number of segments added or removed.
	 * @returns {Promise<void>}
	 */
	async adjustStanceMeter(stance, number)
	{
		if(this.system.stance[stance] + number < 0)
			ui.notifications.warn(game.i18n.localize("ACTOR.WARNINGS.minimumSegment"));

		await this.update({[`system.stance.${stance}`]: this.system.stance[stance] + number});
	}

	/**
	 * Adjusts one of the Actor's number of wounds.
	 * @param {Number} number The number of wounds to add or remove.
	 * @returns {Promise<void>}
	 */
	async adjustWounds(number)
	{
		await this.update({"system.wounds.value": this.system.wounds.value + number});
	}

	/**
	 * Adds a certain number of damages to the Actor, converted into wounds, even adding Critical Wounds if too many damages are inflicted.
	 * @param {number} damages The damages inflicted.
	 * @param {number} criticalDamages The critical damages inflicted.
	 * @returns {Promise<{damages: number, criticalWounds: Item[]|number}>} The total number of damages inflicted, alonside the Critical Wounds
	 */
	async sufferDamages(damages, criticalDamages)
	{
		let criticalWounds = null;
		damages -= this.system.damageReduction;

		// If the attack inflicts 0 damages in spite of hitting the Actor, the target still suffers one damage
		// plus the initial number of critical damages that was supposed to be inflicted
		// (no critical wounds are inflicted though).
		if(damages <= 0)
			damages = 1 + criticalDamages;
		else if(damages > 0) {
			// If the attack inflicts more damages than the target's wound threshold, one damage becomes critical.
			if(damages > this.system.wounds.value)
				criticalDamages++;

			if(criticalDamages > 0)
				criticalWounds = await this.createEmbeddedDocuments(
					"Item",
					await this.drawCriticalWoundsRandomly(criticalDamages)
				);
		}

		await this.update({"system.wounds.value": this.system.wounds.value - damages});
		return {damages, criticalWounds: criticalWounds ?? criticalDamages};
	}

	/**
	 * Draws one or several Critical Wounds randomly from the Critical Wounds roll table.
	 * @param {Number} number The number of Critical Wounds to draw.
	 * @returns {Promise<Item[]>} The Critical Wounds inflicted to the Actor.
	 */
	static async drawCriticalWoundsRandomly(number)
	{
		const criticalWounds = [],
			  /** @var {RollTable} criticalWoundRollTable */
			  criticalWoundRollTable = await fromUuid("Compendium.wfrp3e.roll-tables.RollTable.KpiwJKBdJ8qAyQjs"),
			  drawnResult = await criticalWoundRollTable.drawMany(number, {displayChat: false});

		// If Dice So Nice! module is enabled, show the roll.
		game.dice3d?.showForRoll(drawnResult.roll);

		for(const result of drawnResult.results) {
			const document = await fromUuid(result.documentUuid);
			document.type === "criticalWound"
				? criticalWounds.push(document)
				: ui.notifications.info(result.description);
		}

		return criticalWounds;
	}

	/**
	 * Builds up the list of talent sockets available for the actor by talent type.
	 * @returns {Promise<void>}
	 */
	async buildSocketList()
	{
		const talentTypes = wfrp3e.data.items.Talent.TYPES,
			  socketsByType = Object.fromEntries(
				  ["any", ...Object.keys(talentTypes), "insanity"].map(key => [key, {}])
			  ),
			  currentCareer = this.system.currentCareer,
			  currentParty = this.system.currentParty;

		if(currentCareer) {
			const socketedItems = this.items.search({
				filters: [{
					field: "system.socket",
					operator: "is_empty",
					negate: true
				}]
			});

			for(const index in currentCareer.system.sockets) {
				const socket = currentCareer.system.sockets[index],
					  // Find a potential Item that would be socketed in that socket.
					  item   = socketedItems.find(item => item.system.socket === `${currentCareer.uuid}_${index}`);

				socketsByType[socket.type][currentCareer.uuid + "_" + index] = `${currentCareer.name} - ${item
					? game.i18n.format("TALENT.SOCKET.taken", {
						type: game.i18n.localize(`TALENT.TYPES.${socket.type}`),
						talent: item.name
					})
					: game.i18n.format("TALENT.SOCKET.available", {
						type: game.i18n.localize(`TALENT.TYPES.${socket.type}`)
					})}`;
			}
		}

		if(currentParty)
			for(const socketIndex in currentParty.system.sockets) {
				const socket = currentParty.system.sockets[socketIndex];
				let item = null;

				for(const member of currentParty.system.members) {
					// Find a potential Item that would be socketed in that socket.
					const actor = await fromUuid(member);

					item = actor?.items.search({
						filters: [{
							field: "system.socket",
							operator: "is_empty",
							negate: true
						}, {
							field: "system.socket",
							operator: "equals",
							negate: false,
							value: `${currentParty.uuid}_${socketIndex}`
						}]
					})[0];

					if(item)
						break;
				}

				socketsByType[socket.type][currentParty.uuid + "_" + socketIndex] = `${currentParty.name} - ${item
					? game.i18n.format("TALENT.SOCKET.taken", {
						type: game.i18n.localize(`TALENT.TYPES.${socket.type}`),
						talent: item.name
					})
					: game.i18n.format("TALENT.SOCKET.available", {
						type: game.i18n.localize(`TALENT.TYPES.${socket.type}`)
					})}`;
			}

		for(const itemType of Object.keys(talentTypes))
			Object.assign(socketsByType[itemType], socketsByType["any"]);

		return socketsByType;
	}

	/**
	 * Searches for items sharing the same socket as the one passed as parameter. If any is found, removes its socket value.
	 * @param {Item} item The item which socket must be matched.
	 */
	preventMultipleItemsOnSameSocket(item)
	{
		const actors = this.system.currentParty
			? this.system.currentParty.system.members.map(member => fromUuidSync(member))
			: [this];

		for(const actor of actors) {
			const foundItems = actor.items.search({
				filters: [{
					field: "system.socket",
					operator: "is_empty",
					negate: true
				}, {
					field: "uuid",
					operator: "equals",
					negate: true,
					value: item.uuid
				}, {
					field: "system.socket",
					operator: "equals",
					negate: false,
					value: item.system.socket
				}]
			});

			for(const foundItem of foundItems)
				foundItem.update({"system.socket": null});
		}
	}

	/**
	 * Resets every matching socket available to the actor.
	 * @param {string} uuid The uuid of the Item owning the sockets to reset.
	 */
	resetSockets(uuid)
	{
		const items = this.items.search({
			filters: [{
				field: "system.socket",
				operator: "is_empty",
				negate: true
			}, {
				field: "system.socket",
				operator: "starts_with",
				negate: false,
				value: uuid
			}]
		});

		for(const item of items)
			item.update({"system.socket": null});
	}

	/**
	 * Adds a new socket to the actor's list of sockets.
	 * @returns {Promise<void>}
	 */
	async addNewSocket()
	{
		await this.update({"system.sockets": [...this.system.sockets, {item: null, type: "any"}]});
	}

	/**
	 * Deletes a socket from the actor's list of sockets.
	 * @param {Number} index The index of the socket to remove.
	 * @returns {Promise<void>}
	 */
	async deleteSocket(index)
	{
		this.system.sockets.splice(index, 1);
		await this.update({"system.sockets": this.system.sockets});
	}

	/**
	 * Finds every Item owned by the actor with a triggered Active Effect Macro.
	 * @param {string} macroType The type of Active Effect Macro.
	 * @param {Object} [parameters] The parameters passed to the conditional scripts.
	 * @returns {Item[]} An Array of Items with triggered Active Effect Macro.
	 */
	findTriggeredItems(macroType, parameters = {})
	{
		return [
			...this.items.search({
				filters: [{
					field: "type",
					operator: "equals",
					value: "talent"
				}, {
					field: "system.rechargeTokens",
					operator: "equals",
					value: 0
				}, {
					field: "system.socket",
					operator: "is_empty",
					negate: true
				}, {
					field: "effects",
					operator: "is_empty",
					negate: true
				}]
			}),
			this.system.currentCareer,
			...this.items.search({
				filters: [{
					field: "type",
					operator: "equals",
					value: "career"
				}, {
					field: "system.dedicationBonus",
					operator: "is_empty",
					negate: true
				}, {
					field: "effects",
					operator: "is_empty",
					negate: true
				}]
			}),
			...this.items.search({
				filters: [{
					field: "type",
					operator: "contains",
					value: ["career", "talent"],
					negate: true
				}, {
					field: "effects",
					operator: "is_empty",
					negate: true
				}]
			})
		].filter(item => item.effects.find(
			effect => {
				return effect.system.macro.type === macroType && effect.checkConditionalScript(parameters);
			}
		));
	}

	/**
	 * Finds every Active Effect with a relevant Active Effect Macro.
	 * @param {string} macroType The type of the Active Effect Macro.
	 * @param {Object} [parameters] The parameters passed to the conditional scripts.
	 * @returns {ActiveEffect[]} An array of triggered Active Effects.
	 */
	findTriggeredEffects(macroType, parameters = {})
	{
		return this.findTriggeredItems(macroType, parameters).map(item => {
			return item.effects.find(effect => effect.system.macro.type === macroType)
		});
	}

	//#region Character methods

	/**
	 * Post-process a creation operation for a single character instance. Post-operation events occur for all connected clients.
	 * @param {Object} data The initial data object provided to the character creation request.
	 * @param {Object} options Additional options which modify the creation request.
	 * @param {string} userId The id of the User requesting the character update.
	 * @protected
	 */
	_onCharacterCreate(data, options, userId)
	{
		for(const item of data.items)
			if(item.type === "career")
				wfrp3e.data.items.Career.postCloningCleanup(item, data._id);

		if(this.system.party)
			this.update({"system.party": null});
	}

	/**
	 * Adds every basic skill to the character.
	 * @returns {Promise<void>}
	 */
	async addBasicSkills()
	{
		await this.createEmbeddedDocuments(
			"Item",
			await game.packs.get("wfrp3e.items").getDocuments({type: "skill", system: {advanced: false}})
		);
	}

	//#endregion
	//#region Party methods

	/**
	 * Post-process a deletion operation for a single party instance. Post-operation events occur for all connected clients.
	 * @param {Object} options Additional options which modify the deletion request.
	 * @param {string} userId The id of the user requesting the party deletion.
	 * @protected
	 */
	_onPartyDelete(options, userId)
	{
		for(const member of this.system.members)
			fromUuidSync(member)?.resetSockets(this.uuid);
	}

	/**
	 * Post-process an update operation for a single party instance. Post-operation events occur for all connected clients.
	 * @param {Object} changed The differential data that was changed relative to the party's prior values.
	 * @param {Object} options Additional options which modify the update request.
	 * @param {string} userId The id of the User requesting the party update.
	 * @protected
	 */
	_onPartyUpdate(changed, options, userId)
	{
		if(changed.system?.members)
			this.#onPartyMembersChange(changed.system.members);

		if(changed.system?.sockets)
			this.#onPartySocketsChange(changed.system.sockets);
	}

	/**
	 * Upon change to the party member list, ensures that sockets that are owned by removed members.
	 * and are associated with the party are reset.
	 * @param {string[]} newMemberList The list of every party member uuid.
	 * @private
	 */
	#onPartyMembersChange(newMemberList)
	{
		for(const member of this.system.members)
			if(!newMemberList.includes(member))
				fromUuidSync(member).resetSockets(this.uuid);
	}

	/**
	 * Upon change to any of the party socket's type, ensures that the sockets of every member are reset.
	 * @param {Object} sockets The current party sockets.
	 * @private
	 */
	#onPartySocketsChange(sockets)
	{
		for(const index in sockets) {
			const socket = sockets[index];

			if(fromUuidSync(socket.item)?.system.type !== socket.type)
				for(const member of this.system.members)
					fromUuidSync(member).resetSockets(this.uuid);
		}
	}

	/**
	 * Adds a character as a new member of the party.
	 * @param {Actor} actor
	 * @returns {Promise<void>}
	 */
	async addNewPartyMember(actor)
	{
		const members = this.system.members;

		if(actor.type !== "character")
			ui.notifications.warn(game.i18n.format("PARTY.WARNINGS.notACharacter", {name: actor.name}));
		else if(members.includes(actor.uuid))
			ui.notifications.warn(game.i18n.format("PARTY.WARNINGS.alreadyMember", {name: actor.name}));
		else {
			members.push(actor.uuid);
			await this.update({"system.members": members});
			await actor.update({"system.party": this.uuid});
		}
	}

	/**
	 * Opens the Party Event Editor to edit a party event.
	 * @param index {string} The index to the event to edit.
	 * @returns {Promise<void>}
	 */
	async editPartyEvent(index)
	{
		await new wfrp3e.applications.apps.PartyEventEditor({
			data: {
				event: this.system.tension.events[index],
				index,
				party: this
			}
		}).render({force: true});
	}

	/**
	 * Prompts a dialog to confirm the removal of an actor from the member list of the party.
	 * @param {Actor|string} actor Either the actor to remove or the member's uuid.
	 * @returns {Promise<void>}
	 */
	async removeMember(actor)
	{
		if(actor instanceof Actor)
			await foundry.applications.api.DialogV2.confirm({
				window: {title: game.i18n.localize("APPLICATION.TITLE.MemberRemoval")},
				modal: true,
				content: `<p>${game.i18n.format("APPLICATION.DESCRIPTION.MemberRemoval", {actor: actor.name})}</p>`,
				submit: async (result) => {
					if(result) {
						const members = this.system.members,
							  quittingMemberUuid = members.find(memberUuid => memberUuid === actor.uuid);

						if(quittingMemberUuid) {
							members.splice(members.indexOf(quittingMemberUuid), 1);
							await this.update({"system.members": members});
						}
					}
				}
			});
		else {
			const members = this.system.members,
				  quittingMemberUuid = members.find(memberUuid => memberUuid === actor);

			if(quittingMemberUuid) {
				members.splice(members.indexOf(quittingMemberUuid), 1);
				await this.update({"system.members": members});
			}
		}
	}

	//#endregion
}
