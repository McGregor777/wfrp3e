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
		else if(this.type === "career")
			this.prepareCareer();
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
		this.updateActionData();
	}

	/**
	 * Updates Action data to match the new data template.
	 * @deprecated
	 */
	updateActionData()
	{
		this.update(
		{
			system:
			{
				conservative:
				{
					rechargeRating: this.system.conservative.recharge_rating,
					difficultyModifiers:
					{
						challengeDice: this.system.conservative.difficulty_modifiers.challenge_dice,
						misfortuneDice: this.system.conservative.difficulty_modifiers.misfortune_dice,
					}
				},
				reckless:
				{
					rechargeRating: this.system.reckless.recharge_rating,
					difficultyModifiers:
					{
						challengeDice: this.system.reckless.difficulty_modifiers.challenge_dice,
						misfortuneDice: this.system.reckless.difficulty_modifiers.misfortune_dice,
					}
				}
			}
		});
	}

	/**
	 * Prepare Armour's data.
	 */
	prepareArmour()
	{
		this.updateArmourData();
	}

	/**
	 * Updates Armour data to match the new data template.
	 * @deprecated
	 */
	updateArmourData()
	{
		this.update(
		{
			system:
			{
				defenceValue: this.system.defence_value,
				soakValue: this.system.soak_value,
			}
		});
	}

	/**
	 * Prepare Career's data.
	 */
	prepareCareer()
	{
		this.updateCareerData();
		this.prepareTalentSockets();
		this.preparePrimaryCharacteristics();
	}

	/**
	 * Updates Career data to match the new data template.
	 * @deprecated
	 */
	updateCareerData()
	{

		this.update(
		{
			system:
			{
				raceRestrictions: this.system.race_restrictions,
				talentSockets: this.system.talent_sockets,
				primaryCharacteristics: this.system.primary_characteristics,
				careerSkills: this.system.career_skills,
				startingStance:
				{
					conservativeSegments: this.system.starting_stance.conservative_segments,
					recklessSegments: this.system.starting_stance.reckless_segments
				},
				advanceOptions: this.system.advance_options,
				summary: this.system.sommary,
				advances:
				{
					careerTransition:
					{
						newCareer: this.system.advances.career_transition.new_career
					},
					dedicationBonus: this.system.advances.dedication_bonus,
					nonCareer: this.system.advances.non_career
				}
			}
		});
	}

	/**
	 * Prepare Skill's data.
	 */
	prepareSkill()
	{
		this.updateSkillData();
	}

	/**
	 * Updates Skill data to match the new data template.
	 * @deprecated
	 */
	updateSkillData()
	{
		this.update({"system.trainingLevel": this.system.training_level});
	}

	/**
	 * Prepare Weapon's data.
	 */
	prepareWeapon()
	{
		this.updateWeaponData();
	}

	/**
	 * Updates Weapon data to match the new data template.
	 * @deprecated
	 */
	updateWeaponData()
	{
		this.update(
		{
			system:
			{
				damageRating: this.system.damage_rating,
				criticalRating: this.system.critical_rating,
			}
		});
	}

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