/**
 * Provides the main Actor data computation and organization.
 *
 * WFRP3Character contains all the preparation data and methods used for preparing an actor: going through each Owned Item, preparing them for display based on characteristics.
 *
 * @see   WFRP3CharacterSheet - Character sheet class
 */
export default class WFRP3ECharacter extends Actor
{
	/** @inheritDoc */
	prepareDerivedData()
	{
		/*try
		{
			// Call `prepareOwned<Type>` function
			let functionName = `prepareOwned${this.type[0].toUpperCase() + this.type.slice(1, this.type.length)}`;

			if(this[`${functionName}`])
				this[`${functionName}`]();
		}
		catch(e)
		{
			console.error(`Something went wrong when preparing actor item ${this.name}: ${e}`);
		}*/

		if(this.type === "character")
			this.calculateStanceMeter();
		else if(this.type === "party")
			this.prepareParty();

		super.prepareDerivedData();
	}

	/**
	 * Calculates stance meter.
	 */
	calculateStanceMeter()
	{
		let stanceMeter =
		{
			conservative: this.system.attributes.stance.conservative,
			reckless: this.system.attributes.stance.reckless
		};

		const currentCareer = this.itemTypes.career.find(career => career.system.current);

		if(currentCareer)
			stanceMeter =
			{
				conservative: this.system.attributes.stance.conservative + currentCareer.system.startingStance.conservativeSegments,
				reckless: this.system.attributes.stance.reckless + currentCareer.system.startingStance.recklessSegments
			}

		this.stanceMeter = stanceMeter
	}

	/**
	 * Prepares Party's data.
	 */
	prepareParty()
	{
		this.prepareTensionEvents();
		this.prepareTalentSockets();
		this.getMembers();
	}

	/**
	 * Converts the Party's tension events to Array.
	 */
	prepareTensionEvents()
	{
		this.system.tension.events = Object.values(this.system.tension.events);
	}

	/**
	 * Converts the Actor's talent sockets to Array.
	 */
	prepareTalentSockets()
	{
		this.system.talentSockets = Object.values(this.system.talentSockets);
	}

	/**
	 * Fetches the Actor of each member of the Party.
	 */
	getMembers()
	{
		this.memberActors = this.system.members.map(memberId => game.actors.contents.find(actor => actor.id === memberId));
	}

	/**
	 * Changes the Party Tension value.
	 * @param newValue {Number}
	 */
	changePartyTensionValue(newValue)
	{
		this.update({"system.tension.value": newValue})
	}

	/**
	 * Adds a WFRP3ECharacter as a new member of the Party.
	 * @param newMember {WFRP3ECharacter}
	 */
	addNewMember(newMember)
	{
		const members = this.system.members;

		if(!members.includes(newMember.id)) {
			members.push(newMember.id);

			this.update({"system.members": members})
		}
	}

	/**
	 * Removes a WFRP3ECharacter from the Party.
	 * @param quittingMember {string}
	 */
	removeMember(quittingMember)
	{
		const members = this.system.members;

		console.log(members);

		if(members.includes(quittingMember)) {
			console.log(members);
			members.splice(members.indexOf(quittingMember), 1);

			this.update({"system.members": members})
		}
	}
}