import ActionSelector from "../applications/ActionSelector.js";
import CareerSelector from "../applications/CareerSelector.js";
import CharacteristicUpgrader from "../applications/CharacteristicUpgrader.js";
import CheckBuilder from "../applications/CheckBuilder.js";
import PartyEventEditor from "../applications/PartyEventEditor.js";
import TalentSelector from "../applications/TalentSelector.js";
import TrainingSelector from "../applications/TrainingSelector.js";
import WFRP3eEffect from "./WFRP3eEffect.js";
import {capitalize} from "../helpers.js";

/**
 * Provides the main Actor data computation and organization.
 * WFRP3eActor contains all the preparation data and methods used for preparing an actors: going through each Owned Item, preparing them for display based on characteristics.
 * @see WFRP3eCharacterSheet - Character sheet class
 */
export default class WFRP3eActor extends Actor
{
	/** @inheritDoc */
	prepareDerivedData()
	{
		try {
			// Call `prepareOwned<Type>` function
			let functionName = `#prepare${capitalize(this.type)}`;

			if(this[`${functionName}`])
				this[`${functionName}`]();
		}
		catch(error) {
			console.error(`Something went wrong when preparing Actor ${this.name}: ${error}`);
		}

		super.prepareDerivedData();
	}

	/**
	 * Creates a new WFRP3eEffect for the WFRP3eActor.
	 * @param {Object} [data] An Object of optional data for the new WFRP3eEffect.
	 * @returns {Promise<void>}
	 */
	async createEffect(data = {})
	{
		await WFRP3eEffect.create({
			name: game.i18n.localize("DOCUMENT.ActiveEffect"),
			img: "icons/svg/dice-target.svg",
			...data
		}, {parent: this});
	}

	performCharacteristicCheck(characteristic)
	{
		CheckBuilder.prepareCharacteristicCheck(
			this,
			{name: characteristic, ...this.system.characteristics[characteristic]}
		);
	}

	/**
	 * Gets the name of Character's current stance.
	 * @returns {string}
	 */
	getCurrentStanceName()
	{
		if(this.system.stance.current < 0)
			return "conservative";
		else if(this.system.stance.current > 0)
			return "reckless";

		return this.system.defaultStance;
	}

	/**
	 * Adds or removes a specified amount of segments on either side on the stance meter.
	 */
	async adjustStanceMeter(stance, amount)
	{
		if(this.system.stance[stance] + amount < 0)
			ui.notifications.warn(game.i18n.localize("CHARACTER.WARNINGS.minimumSegment"));

		await this.update({system: {stance: {[`${stance}`]: this.system.stance[stance] + amount}}});
	}

	/**
	 * Builds up the list of Talent Sockets available for the Actor by Talent type.
	 */
	async buildSocketList()
	{
		const socketsByType = Object.fromEntries(
				  ["any", ...Object.keys(CONFIG.WFRP3e.talentTypes), "insanity"].map(key => [key, {}])
			  ),
			  currentCareer = this.system.currentCareer,
			  currentParty = this.system.currentParty

		if(currentCareer) {
			currentCareer.system.sockets.forEach((socket, index) => {
				// Find a potential Item that would be socketed in that socket.
				const item = this.items.search({
					filters: [{
						field: "system.socket",
						operator: "is_empty",
						negate: true
					}, {
						field: "system.socket",
						operator: "equals",
						negate: false,
						value: `${currentCareer.uuid}_${index}`
					}]
				})[0];

				socketsByType[socket.type][currentCareer.uuid + "_" + index] =
					currentCareer.name + " - " + (item
						? game.i18n.format("TALENT.SOCKET.taken", {
							type: game.i18n.localize(`TALENT.TYPES.${socket.type}`),
							talent: item.name
						})
						: game.i18n.format("TALENT.SOCKET.available", {
							type: game.i18n.localize(`TALENT.TYPES.${socket.type}`)
						}));
			});
		}

		if(currentParty) {
			for(const socketIndex in currentParty.system.sockets) {
				const socket = currentParty.system.sockets[socketIndex];
				let item = null;

				for(const member of currentParty.system.members) {
					// Find a potential Item that would be socketed in that socket.
					item = await fromUuid(member).then(actor => actor?.items.search({
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
					})[0]);

					if(item)
						break;
				}

				socketsByType[socket.type][currentParty.uuid + "_" + socketIndex] =
					currentParty.name + " - " + (item
						? game.i18n.format("TALENT.SOCKET.taken", {
							type: game.i18n.localize(`TALENT.TYPES.${socket.type}`),
							talent: item.name
						})
						: game.i18n.format("TALENT.SOCKET.available", {
							type: game.i18n.localize(`TALENT.TYPES.${socket.type}`)
						}));
			}
		}

		for(const itemType of Object.keys(CONFIG.WFRP3e.talentTypes))
			Object.assign(socketsByType[itemType], socketsByType["any"]);

		return socketsByType;
	}

	/**
	 * Buys a new advance on a specific Career for the WFRP3eCharacter.
	 * @param {WFRP3eItem} career The Career containing the new Advance.
	 * @param {String} type The type of the new Advance.
	 */
	async buyAdvance(career, type)
	{
		if(this.system.experience.current <= 0)
			return ui.notifications.warn(game.i18n.localize("CHARACTER.WARNINGS.noExperienceLeft"));

		switch(type) {
			case "action":
				await new ActionSelector(this, career).render(true);
				break;

			case "talent":
				await new TalentSelector(this, career).render(true);
				break;

			case "skill":
				await new TrainingSelector(this, career).render(true);
				break;

			case "careerTransition":
				await new CareerSelector(this, career).render(true);
				break;

			case "wound":
				await this.update({
					system: {
						wounds: {
							max: this.system.wounds.max + 1,
							value: this.system.wounds.value + 1
						}
					}
				});
				await career.update({"system.advances.wound": game.i18n.localize("CHARACTER.woundThreshold")});
				break;

			case "dedicationBonus":
				for(const pack of [...game.packs.values()].filter(pack => pack.documentName === "Item")) {
					const careerAbility = await pack.getDocuments({name: career.name, type: "ability"})
						.then(abilities => abilities[0]);

					if(careerAbility) {
						await Item.createDocuments([careerAbility], {parent: this});
						await career.update({"system.advances.dedicationBonus": careerAbility.name});
						break;
					}
				}
				break;

			case "nonCareer":
				await new Dialog({
					title: game.i18n.localize("NEWNONCAREERADVANCESELECTION.Title"),
					content: "<p>" + game.i18n.format("NEWNONCAREERADVANCESELECTION.Content") + "</p>",
					buttons: {
						characteristic: {
							label: game.i18n.localize("NEWNONCAREERADVANCESELECTION.BUTTONS.Characteristic"),
							callback: async dlg => new CharacteristicUpgrader(this, career, true).render(true)
						},
						skill: {
							label: game.i18n.localize("NEWNONCAREERADVANCESELECTION.BUTTONS.Skill"),
							callback: async dlg => new TrainingSelector(this, career, true).render(true)
						},
						talent: {
							label: game.i18n.localize("NEWNONCAREERADVANCESELECTION.BUTTONS.Talent"),
							callback: async dlg => new TalentSelector(this, career, true).render(true)
						}
					}
				}, {classes: ["new-non-career-advance-selection"]}).render(true);
				break;

			default:
				await new Dialog({
					title: game.i18n.localize("NEWCAREERADVANCESELECTION.Title"),
					content: "<p>" + game.i18n.format("NEWCAREERADVANCESELECTION.Content") + "</p>",
					buttons: {
						characteristic: {
							label: game.i18n.localize("NEWCAREERADVANCESELECTION.BUTTONS.Characteristic"),
							callback: async dlg => new CharacteristicUpgrader(this, career).render(true)
						},
						action: {
							label: game.i18n.localize("NEWCAREERADVANCESELECTION.BUTTONS.Action"),
							callback: async dlg => new ActionSelector(this, career).render(true)
						},
						skill: {
							label: game.i18n.localize("NEWCAREERADVANCESELECTION.BUTTONS.Skill"),
							callback: async dlg => new TrainingSelector(this, career).render(true)
						},
						talent: {
							label: game.i18n.localize("NEWCAREERADVANCESELECTION.BUTTONS.Talent"),
							callback: async dlg => new TalentSelector(this, career).render(true)
						},
						wound: {
							label: game.i18n.localize("NEWCAREERADVANCESELECTION.BUTTONS.Wound"),
							callback: async dlg => {
								await this.update({
									system: {
										wounds: {
											max: this.system.wounds.max + 1,
											value: this.system.wounds.value + 1
										}
									}
								});

								await career.update({"system.advances.wound": game.i18n.localize("CHARACTER.woundThreshold")});
							}
						},
						conservative: {
							label: game.i18n.localize("NEWCAREERADVANCESELECTION.BUTTONS.Conservative"),
							callback: async dlg => await this.update({"system.stance.conservative": this.system.stance.conservative + 1})
						},
						reckless: {
							label: game.i18n.localize("NEWCAREERADVANCESELECTION.BUTTONS.Reckless"),
							callback: async dlg => await this.update({"system.stance.reckless": this.system.stance.reckless + 1})
						}
					}
				}, {classes: ["new-career-advance-selection"]}).render(true);
				break;
		}
	}

	/**
	 * Removes a Career's advance, resetting its cost and type.
	 * @param {WFRP3eItem} career The Career owning the advance.
	 * @param {String} type The advance type.
	 * @param {Number} [index] The index of the non-career advance, if relevant.
	 * @returns {Promise<void>}
	 */
	async removeAdvance(career, type, index = null)
	{
		switch(type) {
			case "careerTransition":
				await career.update({"system.advances.careerTransition": {cost: 0, newCareer: null}});
				break;
			case "nonCareer":
				if(!index)
					throw new Error("Unable to remove non-career advance without the index of the advance.");

				foundry.utils.setProperty(career, `system.advances.nonCareer.${index}`, {cost: 0, type: null});

				await career.update({"system.advances.nonCareer": career.system.advances.nonCareer});
				break;
			default:
				await career.update({[`system.advances.${type}`]: null});
		}
	}

	/**
	 * Updates one of the Character impairment value.
	 * @param {String} impairment The impairment to update.
	 * @param {Number} value The value to add to the impairment.
	 */
	async adjustImpairment(impairment, value)
	{
		await this.update({[`system.impairments.${impairment}`]: this.system.impairments[impairment] + value});
	}

	/**
	 * Checks for Items sharing the same socket and removes all except the current one.
	 * @param {WFRP3eItem} item
	 */
	preventMultipleItemsOnSameSocket(item)
	{
		const actors = this.system.currentParty
				  ? this.system.currentParty.members.map(async member => fromUuidSync(member))
				  : [this],
			  items = actors.reduce((items, actor) => {
				  items.push(...actor.items.search({
					  filters: [
						  {
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
						  }
					  ]
				  }));
				  return items;
			  }, []);

		for(const item of items) {
			item.update({"system.socket": ""});
		}
	}

	/**
	 * Resets every matching socket available to the Actor.
	 * @param {string} uuid The UUID of the Document owning the sockets to reset.
	 */
	resetSockets(uuid)
	{
		const documents = this.items.search({
			filters: [
				{
					field: "system.socket",
					operator: "is_empty",
					negate: true
				}, {
					field: "system.socket",
					operator: "starts_with",
					negate: false,
					value: uuid
				}
			]
		});

		for(const document of documents) {
			document.update({"system.socket": null});
		}
	}

	/**
	 * Adds a new socket to the Actor's list of sockets.
	 */
	async addNewSocket()
	{
		await this.update({"system.sockets": [...this.system.sockets, {item: null, type: "any"}]});
	}

	/**
	 * Deletes a socket from the Actor's list of sockets.
	 * @param {Number} index The index of the socket to remove.
	 */
	async deleteSocket(index)
	{
		this.system.sockets.splice(index, 1);
		await this.update({"system.sockets": this.system.sockets});
	}

	/**
	 * Finds every Item owned by the Actor with an effect triggered.
	 * @param {string} triggerType The trigger type of the effect.
	 * @param {Object} options
	 * @param {Object[]} [options.parameters]
	 * @param {string[]} [options.parameterNames]
	 * @returns {WFRP3eItem[]} An Array of triggered items.
	 */
	findTriggeredItems(triggerType, {parameters = [], parameterNames = [] } = {})
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
			...this.items.search({
				filters: [{
					field: "type",
					operator: "equals",
					value: "talent",
					negate: true
				}, {
					field: "effects",
					operator: "is_empty",
					negate: true
				}]
			})
		].filter(item => item.effects.filter(
			effect => {
				// Check if the WFRP3eEffect's trigger type matches, and if it has a condition script, that it returns true.
				return !(effect.system.type !== triggerType
					|| effect.system.conditionScript
						&& !effect.checkEffectConditionScript({parameters, parameterNames}));
			}).length > 0
		);
	}

	/**
	 * Finds every effect triggered by a specific script trigger.
	 * @param {string} triggerType The type of script trigger.
	 * @returns {WFRP3eEffect[]} An Array of triggered WFRP3eEffects.
	 */
	findTriggeredEffects(triggerType)
	{
		return this.findTriggeredItems(triggerType).map(item => {
			 return item.effects.find(effect => effect.system.type === triggerType)
		});
	}

	/** @inheritDoc */
	_onDelete(options, userId)
	{
		super._onDelete(options, userId);

		switch(this.type) {
			case "party":
				this.#onPartyDelete(options, userId);
				break;
		}
	}

	/** @inheritDoc */
	_onUpdate(changed, options, userId)
	{
		switch(this.type) {
			case "party":
				this.#onPartyUpdate(changed, options, userId);
				break;
		}

		super._onUpdate(changed, options, userId);
	}

	//#region Party methods

	/**
	 * Adds a WFRP3eActor as a new member of the Party.
	 * @param {WFRP3eActor} actor
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
	 * Opens the Party Event Editor to edit a Party event.
	 * @param index {string} The index to the event to edit.
	 */
	async editPartyEvent(index)
	{
		await new PartyEventEditor({
			data: {
				event: this.system.tension.events[index],
				index,
				party: this
			}
		}).render(true);
	}

	/**
	 * Prompts a Dialog to confirm the removal of a WFRP3eActor from the member list of the Party.
	 * @param {WFRP3eActor|String} actor Either the WFRP3eActor to remove or the member's UUID.
	 */
	async removeMember(actor)
	{
		if(actor instanceof WFRP3eActor)
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
	 * Upon Party deletion, resets every Party member's sockets associated to the Party.
	 * @private
	 */
	#onPartyDelete()
	{
		this.system.members.forEach((member) => fromUuidSync(member).resetSockets(this.uuid));
	}

	/**
	 * Perform follow-up operations after a Party is updated. Post-update operations occur for all clients after the update is broadcast.
	 * @param {any} changed The differential data that was changed relative to the documents prior values
	 * @param {any} options Additional options which modify the update request
	 * @param {string} userId The id of the User requesting the document update
	 * @private
	 */
	#onPartyUpdate(changed, options, userId)
	{
		if(changed.system?.members)
			this.#onPartyMembersChange(changed.system.members);

		if(changed.system?.sockets)
			this.#onPartySocketsChange();
	}

	/**
	 * Upon change to the Party member list, ensures that sockets that are owned by removed members and are associated
	 * to the Party are reset.
	 * @param {Array} newMemberList The new Party's member list.
	 * @private
	 */
	#onPartyMembersChange(newMemberList)
	{
		this.system.members.forEach((member) => {
			if(!newMemberList.includes(member))
				fromUuidSync(member).resetSockets(this.uuid);
		});
	}

	/**
	 * Upon change to the Party sockets, ensures that every members sockets that are associated to the Party are reset.
	 * @private
	 */
	#onPartySocketsChange()
	{
		this.system.members.forEach((member) => {fromUuidSync(member).resetSockets(this.uuid)});
	}

	//#endregion
}