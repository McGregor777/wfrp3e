/**
 * Provides the main Actor data computation and organization.=
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
		if(this.system.attributes.stance.current > 0)
			return "conservative";
		else if(this.system.attributes.stance.current < 0)
			return "reckless";

		return this.system.defaultStance;
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