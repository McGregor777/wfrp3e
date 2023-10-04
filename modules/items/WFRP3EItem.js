export default class WFRP3EItem extends Item
{
	/** @inheritDoc */
	prepareData()
	{
		super.prepareData();

		try {
			const functionName = `_prepare${this.type[0].toUpperCase() + this.type.slice(1, this.type.length)}`;

			if(this[`${functionName}`])
				this[`${functionName}`]();
		}
		catch(error) {
			console.error(`Something went wrong when preparing the Item ${this.name} of type ${this.type}: ${error}`);
		}
	}

	/**
	 * Prepare Action's data.
	 * @private
	 */
	_prepareAction() {}

	/**
	 * Prepare Armour's data.
	 * @private
	 */
	_prepareArmour() {}

	/**
	 * Prepare Career's data.
	 * @private
	 */
	_prepareCareer()
	{
		if(!(this.system.talentSockets instanceof Array))
			this._convertTalentSocketsToArray();

		if(!(this.system.primaryCharacteristics instanceof Array))
			this._convertPrimaryCharacteristicsToArray();
	}

	/**
	 * Prepare CriticalWound's data.
	 * @private
	 */
	_prepareCriticalWound() {}

	/**
	 * Prepare Disease's data.
	 * @private
	 */
	_prepareDisease() {}

	/**
	 * Prepare Skill's data.
	 * @private
	 */
	_prepareSkill() {}

	/**
	 * Prepare Talent's data.
	 * @private
	 */
	_prepareTalent() {}

	/**
	 * Prepare Weapon's data.
	 * @private
	 */
	_prepareWeapon()
	{
		if(!(this.system.qualities instanceof Array))
			this._convertQualitiesToArray();
	}

	/**
	/**
	 * Adds a new Quality to the Weapon's list of Qualities.
	 */
	addNewQuality()
	{
		const qualities = this.system.qualities;

		qualities.push({
			name: "attuned",
			rating: 1
		});

		this.update({"system.qualities": qualities});
	}

	/**
	 * Removes the last Quality from the Weapon's list of Qualities.
	 */
	removeLastQuality()
	{
		const qualities = this.system.qualities;

		qualities.pop();

		this.update({"system.qualities": qualities});
	}

	/**
	 * Converts the Item's Qualities to Array.
	 * @private
	 */
	_convertQualitiesToArray()
	{
		this.update({"system.qualities": Object.values(this.system.qualities)});
	}

	/**
	 * Converts the Item's Talent sockets to Array.
	 * @private
	 */
	_convertTalentSocketsToArray()
	{
		this.update({"system.talentSockets": Object.values(this.system.talentSockets)});
	}

	/**
	 * Converts the Career's primary characteristics to Array.
	 * @private
	 */
	_convertPrimaryCharacteristicsToArray()
	{
		this.update({"system.primaryCharacteristics": Object.values(this.system.primaryCharacteristics)});
	}

	/** @inheritDoc */
	_onUpdate(changed, options, userId)
	{
		super._onUpdate(changed, options, userId);

		console.log(changed)

		try {
			const functionName = `_on${this.type[0].toUpperCase() + this.type.slice(1, this.type.length)}Update`;

			if(this[`${functionName}`])
				this[`${functionName}`](changed, options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when updating the Item ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/**
	 * Perform follow-up operations after a Career is updated. Post-update operations occur for all clients after the update is broadcast.
	 * @param changed {any} The differential data that was changed relative to the documents prior values
	 * @param options {any} Additional options which modify the update request
	 * @param userId {string} The id of the User requesting the document update
	 * @private
	 */
	_onCareerUpdate(changed, options, userId)
	{
		if(changed.system?.current)
			this._onCurrentCareerChange();

		if(changed.system?.talentSockets)
			this._onCareerTalentSocketsChange();
	}

	/**
	 * Perform follow-up operations after a Talent is updated. Post-update operations occur for all clients after the update is broadcast.
	 * @param changed {any} The differential data that was changed relative to the documents prior values
	 * @param options {any} Additional options which modify the update request
	 * @param userId {string} The id of the User requesting the document update
	 * @private
	 */
	_onTalentUpdate(changed, options, userId)
	{
		if(changed.system?.talentSocket)
			this._onTalentSocketChange(changed.system?.talentSocket);
	}

	/**
	 * Performs check-ups following up a Career's Talent sockets change.
	 * @private
	 */
	_onCurrentCareerChange()
	{
		if(this.actor) {
			this.actor.itemTypes.career.filter(career => career !== this).forEach((otherCareer, index) => {
				otherCareer.update({"system.current": false});
			});
			this.actor.resetTalentsSocket("career");
		}
	}

	/**
	 * Performs check-ups following up a Career's Talent sockets change.
	 * @private
	 */
	_onCareerTalentSocketsChange()
	{
		if(this.actor)
			this.actor.resetTalentsSocket("career");
	}

	/**
	 * Performs check-ups following up a Talent socket change to a non-null value.
	 * @param talent {WFRP3EItem} The Talent that has been changed
	 * @param newTalentSocket {string}
	 * @private
	 */
	_onTalentSocketChange(talent, newTalentSocket)
	{
		if(this.actor)
			this.actor.checkForDuplicateTalentSockets(newTalentSocket);
	}
}