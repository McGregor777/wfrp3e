import ActionSelector from "../applications/ActionSelector.js";
import CareerSelector from "../applications/CareerSelector.js";
import CharacteristicUpgrader from "../applications/CharacteristicUpgrader.js";
import TalentSelector from "../applications/TalentSelector.js";
import TrainingSelector from "../applications/TrainingSelector.js";
import CheckHelper from "../CheckHelper.js";
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
			let functionName = `_prepare${capitalize(this.type)}`;

			if(this[`${functionName}`])
				this[`${functionName}`]();
		}
		catch(error) {
			console.error(`Something went wrong when preparing Actor ${this.name}: ${error}`);
		}

		super.prepareDerivedData();
	}

	performCharacteristicCheck(characteristic)
	{
		CheckHelper.prepareCharacteristicCheck(
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
	adjustStanceMeter(stance, amount)
	{
		if(this.system.stance[stance] + amount < 0)
			ui.notifications.warn(game.i18n.localize("CHARACTER.SHEET.MinimumSegmentWarning"));

		this.update({system: {stance: {[`${stance}`]: this.system.stance[stance] + amount}}});
	}

	/**
	 * Buys a new advance on a specific Career for the WFRP3eCharacter.
	 * @param {WFRP3eItem} career The Career containing the new Advance.
	 * @param {String} type The type of the new Advance.
	 */
	async buyAdvance(career, type)
	{
		if(this.system.experience.current > 0)
			ui.notifications.warn(game.i18n.localize("CHARACTER.SHEET.NoExperienceLeft"));

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
				this.update({
					system: {
						wounds: {
							max: this.system.wounds.max + 1,
							value: this.system.wounds.value + 1
						}
					}
				});
				career.update({"system.advances.wound": game.i18n.localize("CHARACTER.WoundThreshold")});
				break;

			case "dedicationBonus":
				for(const pack of [...game.packs.values()].filter(pack => pack.documentName === "Item")) {
					const careerAbility = await pack.getDocuments({name: career.name, type: "ability"})
						.then(abilities => abilities[0]);

					if(careerAbility) {
						await Item.createDocuments([careerAbility], {parent: this});
						career.update({"system.advances.dedicationBonus": careerAbility.name});
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
								this.update({
									system: {
										wounds: {
											max: this.system.wounds.max + 1,
											value: this.system.wounds.value + 1
										}
									}
								});

								career.update({"system.advances.wound": game.i18n.localize("CHARACTER.WoundThreshold")});
							}
						},
						conservative: {
							label: game.i18n.localize("NEWCAREERADVANCESELECTION.BUTTONS.Conservative"),
							callback: async dlg => this.update({"system.stance.conservative": this.system.stance.conservative + 1})
						},
						reckless: {
							label: game.i18n.localize("NEWCAREERADVANCESELECTION.BUTTONS.Reckless"),
							callback: async dlg => this.update({"system.stance.reckless": this.system.stance.reckless + 1})
						}
					}
				}, {classes: ["new-career-advance-selection"]}).render(true);
				break;
		}
	}

	removeAdvance(career, type)
	{
		const updates = {system: {advances: career.system.advances}};

		if(isNaN(type))
			updates.system.advances[type] = "";
		else
			updates.system.advances.open[type] = "";

		career.update(updates);
	}

	/**
	 * Changes the WFRP3eActor's current Career.
	 * @param career {WFRP3eItem} The new current Career.
	 * @see {WFRP3eItem._onCareerUpdate}  Performs follow-up
	 */
	changeCurrentCareer(career)
	{
		career.update({"system.current": true});
	}

	/**
	 * Updates one of the Character impairment value.
	 * @param {String} impairment The impairment to update.
	 * @param {Number} value The value to add to the impairment.
	 */
	adjustImpairment(impairment, value)
	{
		this.update({[`system.impairments.${impairment}`]: this.system.impairments[impairment] + value});
	}

	/**
	 * Adds a WFRP3eActor as a new member of the Party.
	 * @param {WFRP3eActor} newMember
	 */
	addNewMember(newMember)
	{
		const members = this.system.members;

		if(!members.includes(newMember.id)) {
			members.push(newMember.id);

			this.update({"system.members": members});

			newMember.update({"system.party": this._id});
		}
	}

	/**
	 * Removes a WFRP3eActor from the Party.
	 * @param {string} quittingMemberId The Actor ID of the quitting member.
	 */
	removeMember(quittingMemberId)
	{
		const members = this.system.members;

		if(members.includes(quittingMemberId)) {
			members.splice(members.indexOf(quittingMemberId), 1);

			this.update({"system.members": members});
		}
	}

	/**
	 * Changes the Party Tension value.
	 * @param {Number} newValue
	 */
	changePartyTensionValue(newValue)
	{
		this.update({"system.tension.value": newValue});
	}

	/**
	 * Checks for Items sharing the same socket and removes all except the current one.
	 * @param {WFRP3eItem} item
	 */
	preventMultipleItemsOnSameSocket(item)
	{
		const actors = this.system.currentParty ? this.system.currentParty.memberActors : [this],
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

		items.forEach(item => item.update({"system.socket": ""}));
	}

	/**
	 * Resets the socket of every Actor's which socket matches a string.
	 * @param {string} match The string the socket must match.
	 */
	resetSocket(match)
	{
		this.items.search({
			filters: [{
				field: "system.socket",
				operator: "is_empty",
				negate: true
			}, {
				field: "system.socket",
				operator: "starts_with",
				negate: false,
				value: match
			}]
		}).forEach(item => item.update({"system.socket": null}));
	}

	/**
	 * Adds a new socket to the Actor's list of sockets.
	 */
	addNewSocket()
	{
		this.update({"system.sockets": [...this.system.sockets, {item: null, type: "any"}]});
	}

	/**
	 * Removes the last socket from the Actor's list of sockets.
	 */
	removeLastSocket()
	{
		const sockets = this.system.sockets;
		sockets.pop();
		this.update({"system.sockets": sockets});
	}

	/**
	 * Finds every Item owned by the Actor with an effect triggered.
	 * @param {string} triggerType The trigger type of the effect.
	 * @returns {WFRP3eItem[]} An Array of triggered items.
	 */
	findTriggeredItems(triggerType)
	{
		return this.items.search({
			filters: [{
				field: "system.rechargeTokens",
				operator: "is_empty",
				negate: true
			}, {
				field: "system.rechargeTokens",
				operator: "equals",
				negate: false,
				value: 0
			}, {
				field: "system.socket",
				operator: "is_empty",
				negate: true
			}]
		}).filter(item => item.system.effects.filter(effect => effect.type === triggerType).length > 0);
	}

	/** @inheritDoc */
	_onDelete(options, userId)
	{
		super._onDelete(options, userId);

		switch(this.type) {
			case "party":
				this._onPartyDelete(options, userId);
				break;
		}
	}

	/** @inheritDoc */
	_onUpdate(changed, options, userId)
	{
		super._onUpdate(changed, options, userId);

		switch(this.type) {
			case "party":
				this._onPartyUpdate(changed, options, userId);
				break;
		}
	}

	/**
	 * Prepares Party's data.
	 * @private
	 */
	_prepareParty()
	{
		this._getMembers();
	}

	/**
	 * Fetches the Actor of each member of the Party.
	 * @private
	 */
	_getMembers()
	{
		this.memberActors = this.system.members.map(memberId => game.actors.contents.find(actor => actor.id === memberId));

		this.memberActors.forEach((actor) => {
			if(actor.system.party !== this._id)
				actor.update({"system.party": this._id});
		});
	}

	/**
	 * Perform follow-up operations after a Party is deleted. Post-deletion operations occur for all clients after the deletion is broadcast.
	 * @param {any} options Additional options which modify the deletion request
	 * @param {string} userId The id of the User requesting the document update
	 * @private
	 */
	_onPartyDelete(options, userId)
	{
		if(Array.isArray(this.memberActors) && this.memberActors.length > 0)
			this.memberActors.forEach((member) => {
				member.resetSocket("party");
			});
	}

	/**
	 * Perform follow-up operations after a Party is updated. Post-update operations occur for all clients after the update is broadcast.
	 * @param {any} changed The differential data that was changed relative to the documents prior values
	 * @param {any} options Additional options which modify the update request
	 * @param {string} userId The id of the User requesting the document update
	 * @private
	 */
	_onPartyUpdate(changed, options, userId)
	{
		if(changed.system?.members)
			this._onPartyMembersChange(changed.system.members);

		if(changed.system?.sockets)
			this._onPartySocketsChange();
	}

	/**
	 * Performs preliminary operations before a Party's members change.
	 * @param {Array} newMemberIdList The new Party's member list.
	 * @private
	 */
	_onPartyMembersChange(newMemberIdList)
	{
		if(Array.isArray(this.memberActors) && this.memberActors.length > 0)
		{
			const missingMembers = [];

			this.memberActors.forEach((currentMember) => {
				if(!newMemberIdList.find(newMemberId => newMemberId === currentMember._id))
					missingMembers.push(currentMember);
			});

			missingMembers.forEach((member) => {
				member.resetSocket("party");
			});
		}
	}

	/**
	 * Performs check-ups following up a Party's Talent sockets change.
	 * @private
	 */
	_onPartySocketsChange()
	{
		if(Array.isArray(this.memberActors) && this.memberActors.length > 0) {
			this.memberActors.forEach((member) => {
				member.resetSocket("party")
			});
		}
	}
}