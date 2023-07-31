export default class WFRP3EItem extends Item
{
	/** @inheritDoc */
	prepareData()
	{
		super.prepareData();

		/*try
		{
			let functionName = `prepare${this.type[0].toUpperCase() + this.type.slice(1, this.type.length)}`;

			if(this[`${functionName}`])
				this[`${functionName}`]();
		}
		catch(exception)
		{
			console.error(`Something went wrong when preparing the Item ${this.name} of type ${this.type}: ${exception}`);
		}*/

		if(this.type === "action")
			this.prepareAction();
		else if(this.type === "armour")
			this.prepareArmour();
		else if(this.type === "disease")
			this.prepareDisease();
		else if(this.type === "career")
			this.prepareCareer();
		else if(this.type === "criticalWound")
			this.prepareCriticalWound();
		else if(this.type === "skill")
			this.prepareSkill();
		else if(this.type === "weapon")
			this.prepareWeapon();
	}

	/**
	 * Prepare Action's data.
	 */
	prepareAction()
	{
		if(this.system.rechargeTokens === undefined || this.system.rechargeTokens === null) {
			this.update({system: {rechargeTokens: 0}});
		}
	}

	/**
	 * Prepare Armour's data.
	 */
	prepareArmour() {}

	/**
	 * Prepare Career's data.
	 */
	prepareCareer()
	{
		this.prepareTalentSockets();
		this.preparePrimaryCharacteristics();
	}

	/**
	 * Prepare CriticalWound's data.
	 */
	prepareCriticalWound() {}

	/**
	 * Prepare Disease's data.
	 */
	prepareDisease() {}

	/**
	 * Prepare Skill's data.
	 */
	prepareSkill() {}

	/**
	 * Prepare Weapon's data.
	 */
	prepareWeapon() {}

	/**
	 * Converts the Item's talent sockets to Array.
	 */
	prepareTalentSockets()
	{
		this.system.talentSockets = Object.values(this.system.talentSockets);
	}

	/**
	 * Converts the Career's primary characteristics to Array.
	 */
	preparePrimaryCharacteristics()
	{
		this.system.primaryCharacteristics = Object.values(this.system.primaryCharacteristics);
	}
}