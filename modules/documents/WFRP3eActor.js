import ActionSelector from "../applications/ActionSelector.js";
import CareerSelector from "../applications/CareerSelector.js";
import CharacteristicUpgrader from "../applications/CharacteristicUpgrader.js";
import TalentSelector from "../applications/TalentSelector.js";
import TrainingSelector from "../applications/TrainingSelector.js";

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
			let functionName = `_prepare${this.type[0].toUpperCase() + this.type.slice(1, this.type.length)}`;

			if(this[`${functionName}`])
				this[`${functionName}`]();
		}
		catch(error) {
			console.error(`Something went wrong when preparing Actor ${this.name}: ${error}`);
		}

		super.prepareDerivedData();
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
	 * Buys a new Advance for the WFRP3eCharacter.
	 * @param {WFRP3eItem} career The Career containg the new Advance.
	 * @param {String} type The type of the new Advance.
	 */
	async buyAdvance(career, type)
	{
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

	/**
	 * Updates one of the Character impairment value.
	 * @param {String} impairment The impairment to update.
	 * @param {Number} value The value to add to the impairment.
	 */
	changeImpairment(impairment, value)
	{
		const changes = {system: {impairments: {}}};
		changes.system.impairments[impairment] = this.system.impairments[impairment] + value;

		this.update(changes);
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
	 * Checks for Talents sharing the same socket as the current Talent then remove them from this socket.
	 * @param {string} newTalentSocket
	 */
	checkForDuplicateTalentSockets(newTalentSocket)
	{
		this.system.currentParty.memberActors.forEach((member) => {
			member.itemTypes.talent
				.filter(talent => talent !== this && talent.system.talentSocket === newTalentSocket)
				.forEach((talent) => {
					talent.update({"system.talentSocket": null});
				});
		});
	}

	/**
	 * Resets the socket of every Actor's Talents which socket matches a string.
	 * @param {string} match The string the Talent socket must match.
	 */
	resetTalentsSocket(match)
	{
		this.itemTypes.talent
			.filter(talent => talent.system.talentSocket?.startsWith(match))
			.forEach((talent) => {
				talent.update({"system.talentSocket": null});
			});
	}

	/**
	 * Adds a new Talent socket to the Party's list of Talent sockets.
	 */
	addNewTalentSocket()
	{
		const talentSockets = this.system.talentSockets;

		talentSockets.push("focus");

		this.update({"system.talentSockets": talentSockets});
	}

	/**
	 * Removes the last Talent socket from the Party's list of Talent sockets.
	 */
	removeLastTalentSocket()
	{
		const talentSockets = this.system.talentSockets;

		talentSockets.pop();

		this.update({"system.talentSockets": talentSockets});
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
				member.resetTalentsSocket("party");
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

		if(changed.system?.talentSockets)
			this._onPartyTalentSocketsChange();
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
				member.resetTalentsSocket("party");
			});
		}
	}

	/**
	 * Performs check-ups following up a Party's Talent sockets change.
	 * @private
	 */
	_onPartyTalentSocketsChange()
	{
		if(Array.isArray(this.memberActors) && this.memberActors.length > 0) {
			this.memberActors.forEach((member) => {
				member.resetTalentsSocket("party")
			});
		}
	}
}