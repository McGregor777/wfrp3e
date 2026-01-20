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

		if(changed.system?.stance?.current)
			this.#onStanceChange(changed.system.stance.current);

		try {
			const functionName = `_on${capitalize(this.type)}Update`;

			if(this[functionName])
				this[functionName](changed, options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when updating the Actor ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/** @inheritDoc */
	_onCreateDescendantDocuments(parent, collection, documents, data, options, userId)
	{
		super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);

		if(collection === "items") {
			for(const item of data)
				for(const effect of item.effects)
					if(effect.system.macro.type === wfrp3e.data.macros.ItemAdditionMacro.TYPE)
						effect.triggerMacro({actor: parent, item});

			for(const effect of this.findTriggeredEffects(wfrp3e.data.macros.EmbeddedItemCreationMacro.TYPE))
				effect.triggerMacro({actor: parent, items: data});
		}
	}

	/** @inheritDoc */
	prepareDerivedData()
	{
		super.prepareDerivedData();

		for(const effect of this.findTriggeredEffects(wfrp3e.data.macros.ActorPreparationMacro.TYPE))
			effect.triggerMacro({actor: this});
	}

	/**
	 * Upon change to the Actor's stance, execute relevant On Stance Adjustment Macros.
	 * @param {number} newStance The new stance value.
	 * @private
	 */
	#onStanceChange(newStance)
	{
		for(const effect of this.findTriggeredEffects(wfrp3e.data.macros.StanceAdjustmentMacro.TYPE))
			effect.triggerMacro({actor: this, current: this.system.stance.current, value: newStance});
	}

	/**
	 * Creates a new embedded Active Effect for the Actor.
	 * @param {Object} [data] An Object of optional data for the new embedded Active Effect.
	 * @returns {Promise<void>}
	 */
	async createEmbeddedEffect(data = {})
	{
		await this.createEmbeddedDocuments("ActiveEffect", [{name: this.name, img: this.img, ...data}]);
	}

	/**
	 * Creates a new embedded Item for the Actor.
	 * @param {string} type The type of embedded Item to create.
	 * @param {Object} [data] An Object of optional data for the new embedded Item.
	 * @returns {Promise<void>}
	 */
	async createEmbeddedItem(type, data = {})
	{
		await this.createEmbeddedDocuments("Item", [{
			name: game.i18n.localize(CONFIG.Item.typeLabels[type]),
			type,
			...data
		}]);
	}

	/**
	 * Prepares a characteristic check and shows a Check Builder to edit it. Rolls the check once editing is finished.
	 * @param {string} characteristic The name of the checked characteristic.
	 * @returns {Promise<{checkRoll: CheckRoll, diePool: DiePool}>}
	 */
	async performCharacteristicCheck(characteristic)
	{
		const diePool = await wfrp3e.applications.dice.CheckBuilder.wait({
			diePool: await wfrp3e.dice.DiePool.createFromCharacteristic(
				this,
				{name: characteristic, ...this.system.characteristics[characteristic]}
			)
		});

		return {checkRoll: await diePool.roll(), diePool};
	}

	/**
	 * Prepares a skill check and shows a Check Builder to edit it. Rolls the check once editing is finished.
	 * @param {Item} skill The Skill to check.
	 * @returns {Promise<{checkRoll: CheckRoll, diePool: DiePool}>}
	 */
	async performSkillCheck(skill)
	{
		const diePool = await wfrp3e.applications.dice.CheckBuilder.wait({
			diePool: await wfrp3e.dice.DiePool.createFromSkill(this, skill)
		});

		return {checkRoll: await diePool.roll(), diePool};
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
	 * @param {Number} value The value to add to the impairment
	 * @returns {Promise<void>}
	 * @deprecated
	 */
	async adjustImpairment(impairment, value)
	{
		try {
			const functionName = `adjust${capitalize(impairment)}`;

			if(this.actor[functionName])
				await this[functionName](value);
		}
		catch(exception) {
			console.error(`Something went wrong when updating the Actor's (${this.name}) ${impairment}`);
		}
	}

	/**
	 * Adjusts the Actor's fatigue.
	 * @param {Number} value The value to add to the fatigue.
	 * @returns {Promise<void>}
	 */
	async adjustFatigue(value)
	{
		const propertyPath = "system.impairments.fatigue",
			  fatigue = foundry.utils.getProperty(this, propertyPath);

		for(const effect of this.findTriggeredEffects(wfrp3e.data.macros.FatigueAdjustmentMacro.TYPE))
			await effect.triggerMacro({actor: this, fatigue, value});

		await this.update({[propertyPath]: fatigue + value});
	}

	/**
	 * Adjusts the Actor's stress.
	 * @param {Number} value The value to add to the stress.
	 * @returns {Promise<void>}
	 */
	async adjustStress(value)
	{
		const propertyPath = "system.impairments.stress",
			  stress = foundry.utils.getProperty(this, propertyPath);

		for(const effect of this.findTriggeredEffects(wfrp3e.data.macros.StressAdjustmentMacro.TYPE))
			await effect.triggerMacro({actor: this, stress, value});

		await this.update({[propertyPath]: stress + value});
	}

	/**
	 * Adjusts the Actor's power.
	 * @param {Number} value The value to add to the power pool.
	 * @returns {Promise<void>}
	 */
	async adjustPower(value)
	{
		const propertyPath = "system.power",
			  power = foundry.utils.getProperty(this, propertyPath);

		for(const effect of this.findTriggeredEffects(wfrp3e.data.macros.PowerFavourAdjustmentMacro.TYPE))
			await effect.triggerMacro({actor: this, current: power, type: "power", value});

		await this.update({[propertyPath]: power + value});
	}

	/**
	 * Adjusts the Actor's favour.
	 * @param {Number} value The value to add to the favour pool.
	 * @returns {Promise<void>}
	 */
	async adjustFavour(value)
	{
		const propertyPath = "system.favour",
			  favour = foundry.utils.getProperty(this, propertyPath);

		for(const effect of this.findTriggeredEffects(wfrp3e.data.macros.PowerFavourAdjustmentMacro.TYPE))
			await effect.triggerMacro({actor: this, current: favour, type: "favour", value});

		await this.update({[propertyPath]: favour + value});
	}

	/**
	 * Adjusts the Actor's stance towards conservative or reckless.
	 * @param {number} number The number of steps change, positive means towards reckless, negative towards conservative.
	 * @returns {Promise<void>}
	 */
	async adjustStance(number)
	{
		const propertyPath = "system.stance.current";
		await this.update({[propertyPath]: foundry.utils.getProperty(this, propertyPath) + number});
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
	 * Adjusts the Actor's number of wounds.
	 * @param {Number} number The number of wounds to add or remove.
	 * @returns {Promise<void>}
	 */
	async adjustWounds(number)
	{
		const propertyPath = "system.wounds.value",
			  wounds = foundry.utils.getProperty(this, propertyPath);

		for(const effect of this.findTriggeredEffects(wfrp3e.data.macros.WoundsAdjustmentMacro.TYPE))
			await effect.triggerMacro({actor: this, wounds, number});

		await this.update({[propertyPath]: wounds + number});
	}

	/**
	 * Adds a certain number of damages to the Actor, converted into wounds, even adding Critical Wounds if too many damages are inflicted.
	 * @param {number} damages The damages inflicted.
	 * @param {number} criticalDamages The critical damages inflicted.
	 * @returns {Promise<{damages: number, criticalWounds: Item[]|number}>} The total number of damages inflicted, alongside the Critical Wounds.
	 */
	async sufferDamages(damages, criticalDamages)
	{
		const propertyPath = "system.wounds.value",
			  wounds = foundry.utils.getProperty(this, propertyPath);
		let criticalWounds = null;

		for(const effect of this.findTriggeredEffects(wfrp3e.data.macros.DamageInflictionMacro.TYPE))
			await effect.triggerMacro({actor: this, wounds, number: damages});

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

		for(const effect of this.findTriggeredEffects(wfrp3e.data.macros.WoundsAdjustmentMacro.TYPE))
			await effect.triggerMacro({actor: this, wounds, number: damages});

		await this.update({[propertyPath]: wounds - damages});
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
	 * Searches for Items sharing the same socket as the one passed as parameter. If any is found, removes its socket value.
	 * @param {Item} item The item which socket must be matched.
	 */
	preventMultipleItemsOnSameSocket(item)
	{
		const actors = this.system.currentParty
			? this.system.currentParty.system.members.map(member => fromUuidSync(member))
			: [this],
			  foundItems = [];

		for(const actor of actors)
			for(const embeddedItem of actor.items)
				if(embeddedItem !== item && embeddedItem.system.socket === item.system.socket)
					foundItems.push(embeddedItem)

		for(const foundItem of foundItems)
			foundItem.update({"system.socket": null});
	}

	/**
	 * Resets every matching socket available to the Actor.
	 * @param {string} uuid The uuid of the Item owning the sockets to reset.
	 */
	resetSockets(uuid)
	{
		const items = [];
		for(const item of this.items)
			if(item.system.socket?.startsWith(uuid))
				items.push(item);

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
	 * Finds every Embedded Item of an Actor with a triggered Active Effect Macro.
	 * @param {string} macroType The type of Active Effect Macro.
	 * @param {Object} [parameters] The parameters passed to the conditional scripts.
	 * @returns {Item[]} An Array of Embedded Items with a triggered Active Effect Macro.
	 */
	findTriggeredItems(macroType, parameters = {})
	{
		return this.items.filter(item => {
			return item.effects.size > 0
				&& item.effects.some(effect => effect.system.macro.type === macroType
					&& !effect.isSuppressed
					&& effect.checkConditionalScript(parameters)
			)
		});
	}

	/**
	 * Finds every Active Effect with a relevant Active Effect Macro.
	 * @param {string} macroType The type of the Active Effect Macro.
	 * @param {Object} [parameters] The parameters passed to the conditional scripts.
	 * @returns {ActiveEffect[]} An array of triggered Active Effects.
	 */
	findTriggeredEffects(macroType, parameters = {})
	{
		const effects = this.appliedEffects.filter(effect => {
			return effect.system.macro.type === macroType
				&& !effect.isSuppressed
				&& effect.checkConditionalScript(parameters)
		});

		for(const item of this.items) {
			const effect = item.effects.find(effect => {
				return effect.system.macro.type === macroType
					&& !effect.transfer
					&& !effect.isSuppressed
					&& effect.checkConditionalScript(parameters)
			});
			if(effect)
				effects.push(effect);
		}

		return effects.sort((a, b) => b.system.priority - a.system.priority);
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

		if(changed.system?.fortunePool)
			this.#onPartyFortunePoolChange(changed.system.fortunePool);

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
	 * Upon change to the party's fortune pool, if its number of tokens equals the number of members, triggers fortune refresh.
	 * @param {number} value The new value of the party's fortune pool'.
	 * @private
	 */
	#onPartyFortunePoolChange(value)
	{
		if(value >= this.system.members.length)
			this.refreshFortune();
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
	 * Adjusts the Party's tension.
	 * @param {number} number The number of steps change.
	 * @returns {Promise<void>}
	 */
	async adjustPartyTension(number)
	{
		const propertyPath = "system.tension.value";
		await this.update({[propertyPath]: foundry.utils.getProperty(this, propertyPath) + number});
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

	/**
	 * Allows party members to either recover one fortune token or remove one recharge token from one of their recharging cards.
	 * @returns {Promise<void>}
	 */
	async refreshFortune()
	{
		if(game.user.isGM)
			for(const member of this.system.members) {
				const memberActor = await fromUuid(member);
				let owningUser = null, backupUser = null;

				for(const [userId, ownershipLevel] of Object.entries(memberActor.ownership))
					if(userId !== "default" && ownershipLevel === 3) {
						const user = game.users.get(userId);
						if(user.active) {
							user.isGM ? backupUser = user : owningUser = user;
							if(owningUser)
								break;
						}
					}

				if(owningUser || backupUser) {
					const buttons = [{
						action: "fortuneToken",
						label: "PARTY.DIALOG.fortuneRefresh.BUTTONS.recoverFortuneToken"
					}, {
						action: "removeRechargeToken",
						label: "PARTY.DIALOG.fortuneRefresh.BUTTONS.removeRechargeToken"
					}];

					if(memberActor.system.fortune.value >= memberActor.system.fortune.max)
						buttons[0].disabled = true;

					const rechargingItems = memberActor.items.search({
						filters: [{
							field: "system.rechargeTokens",
							operator: "gt",
							value: 0
						}]
					});
					if(rechargingItems.length <= 0)
						buttons[1].disabled = true;

					foundry.applications.api.DialogV2.query(
						owningUser ?? backupUser,
						"wait", {
						buttons,
						content: game.i18n.localize("PARTY.DIALOG.fortuneRefresh.description"),
						window: {title: "PARTY.DIALOG.fortuneRefresh.title"},
						submit: async (result) => {
							if(result === "fortuneToken")
								await memberActor.adjustFortune(1);
							else if(result === "removeRechargeToken") {
								const itemUuids = await wfrp3e.applications.apps.selectors.ItemSelector.wait({
										  items: rechargingItems
									  }),
									  item = await fromUuid(itemUuids[0]);
								await item.adjustRechargeTokens(-1);
							}
							else
								throw new Error(`Invalid result: ${result}`);

							await this.adjustFortune(-1);
						}
					});

					for(const effect of this.findTriggeredEffects(wfrp3e.data.macros.FortuneRefreshMacro.TYPE))
						await effect.triggerMacro({actor: memberActor, party: this});
				}
			}
	}

	//#endregion
}
