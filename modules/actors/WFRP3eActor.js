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
	 * @param newMember {WFRP3eActor}
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
	 * @param quittingMemberId {string} The Actor ID of the quitting member.
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
	 * @param newValue {Number}
	 */
	changePartyTensionValue(newValue)
	{
		this.update({"system.tension.value": newValue});
	}

	/**
	 * Checks for Talents sharing the same socket as the current Talent then remove them from this socket.
	 * @param newTalentSocket {string}
	 */
	checkForDuplicateTalentSockets(newTalentSocket)
	{
		this.currentParty.memberActors.forEach((member, index) => {
			member.itemTypes.talent
				.filter(talent => talent !== this && talent.system.talentSocket === newTalentSocket)
				.forEach((talent, index) => {
					talent.update({"system.talentSocket": null});
				});
		});
	}

	/**
	 * Resets the socket of every Actor's Talents which socket matches a string.
	 * @param match {string} The string the Talent socket must match.
	 */
	resetTalentsSocket(match)
	{
		this.itemTypes.talent
			.filter(talent => talent.system.talentSocket?.startsWith(match))
			.forEach((talent, index) => {
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
	 * Prepares Character's data.
	 * @private
	 */
	_prepareCharacter()
	{
		this._getCurrentCareer();

		if(this.system.party !== null)
			this._getCurrentParty();

		this._calculateStanceMeter();
		this._getDefaultStance();
	}

	/**
	 * Get the Character's current Career.
	 * @private
	 */
	_getCurrentCareer()
	{
		this.currentCareer = this.itemTypes.career.find(career => career.system.current === true);
	}

	/**
	 * Get the Character's current Career.
	 * @private
	 */
	_getCurrentParty()
	{
		this.currentParty = game.actors.contents.find(actor => actor.id === this.system.party);
	}

	/**
	 * Calculates stance meter.
	 * @private
	 */
	_calculateStanceMeter()
	{
		let stanceMeter = {
			conservative: this.system.attributes.stance.conservative,
			reckless: -this.system.attributes.stance.reckless
		};

		if(this.currentCareer)
			stanceMeter = {
				conservative: this.system.attributes.stance.conservative + this.currentCareer.system.startingStance.conservativeSegments,
				reckless: -this.system.attributes.stance.reckless - this.currentCareer.system.startingStance.recklessSegments
			};

		this.stanceMeter = stanceMeter;
	}

	/**
	 * Get the default stance of the Character.
	 * @private
	 */
	_getDefaultStance()
	{
		if(this.system.attributes.stance.current > 0)
			this.defaultStance = "conservative";
		else if(this.system.attributes.stance.current < 0)
			this.defaultStance = "reckless";
		else {
			if(this.stanceMeter.conservative >= this.stanceMeter.reckless)
				this.defaultStance = "conservative";
			else
				this.defaultStance = "reckless";
		}
	}

	/**
	 * Prepares Party's data.
	 * @private
	 */
	_prepareParty()
	{
		if(!Array.isArray(this.system.tension.events))
			this._convertTensionEventsToArray();

		if(!Array.isArray(this.system.talentSockets))
			this._convertTalentSocketsToArray();

		this._getMembers();
	}

	/**
	 * Converts the Party's tension events to Array.
	 * @private
	 */
	_convertTensionEventsToArray()
	{
		this.update({"system.tension.events": Object.values(this.system.tension.events)});
	}

	/**
	 * Converts the Actor's talent sockets to Array.
	 * @private
	 */
	_convertTalentSocketsToArray()
	{
		this.update({"system.talentSockets": Object.values(this.system.talentSockets)});
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
	 * @param options {any} Additional options which modify the deletion request
	 * @param userId {string} The id of the User requesting the document update
	 * @private
	 */
	_onPartyDelete(options, userId)
	{
		if(Array.isArray(this.memberActors) && this.memberActors.length > 0)
			this.memberActors.forEach((member, index) => {
				member.resetTalentsSocket("party");
			});
	}

	/**
	 * Perform follow-up operations after a Party is updated. Post-update operations occur for all clients after the update is broadcast.
	 * @param changed {any} The differential data that was changed relative to the documents prior values
	 * @param options {any} Additional options which modify the update request
	 * @param userId {string} The id of the User requesting the document update
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
	 * @param newMemberIdList {Array} The new Party's member list.
	 * @private
	 */
	_onPartyMembersChange(newMemberIdList)
	{
		if(Array.isArray(this.memberActors) && this.memberActors.length > 0)
		{
			const missingMembers = [];

			this.memberActors.forEach((currentMember, index) => {
				if(!newMemberIdList.find(newMemberId => newMemberId === currentMember._id))
					missingMembers.push(currentMember);
			});

			missingMembers.forEach((member, index) => {
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
			this.memberActors.forEach((member, index) => {
				member.resetTalentsSocket("party")
			});
		}
	}
}