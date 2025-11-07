import NonCareerAdvance from "./non-career-advance.mjs";

/**
 * The data model for a non-career skill advance.
 * @property {number} cost The cost of the non-career advance.
 * @property {string} type The type of career advance, a value in NonCareerAdvance.TYPES.
 * @property {string} [uuid] The uuid of the skill upgraded through the advance.
 * @property {string} [value] Either the newly acquired specialisation or the new training level of the skill.
 */
export default class NonCareerSkillAdvance extends NonCareerAdvance
{
	static {
		Object.defineProperty(this, "TYPE", {value: "nonCareerSkill"});
	}

	/** @inheritdoc */
	static defineSchema()
	{
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			uuid: new fields.DocumentUUIDField({
				type: "Item",
				// Accept undefined as a valid value since fromUuidSync() fails to properly fetch an item embedded on an actor
				// during document preparation.
				validate: value => ["skill", undefined].includes(fromUuidSync(value)?.type),
				validationError: "must be a skill"
			}),
			value: new fields.StringField({nullable: true})
		};
	}

	get output()
	{
		if(!this.cost)
			return "";

		const parameters = {skill: fromUuidSync(this.uuid)?.name};
		if(this.value)
			parameters.value = this.value;

		return game.i18n.format(
			`CAREER.ADVANCES.${wfrp3e.data.items.career.SkillAdvance.TYPE}.${this.upgradeType}.output`,
			parameters
		);
	}

	/** @inheritDoc */
	static async _operateChanges(career, index)
	{
		const {SkillUpgrader} = wfrp3e.applications.apps.selectors,
			  actor = career.parent.parent,
			  upgrades = await SkillUpgrader.wait({
				  actor,
				  advanceType: "nonCareer",
				  items: await SkillUpgrader.buildAdvanceOptionsList(actor, career.parent, true)
			  });

		const error = this._checkForError(career, index);
		if(error)
			return ui.notifications.error(error);

		const upgrade = upgrades[0];
		let skill = await fromUuid(upgrade.uuid)

		switch(upgrade.type) {
			case "acquisition":
				const newSkills = await actor.createEmbeddedDocuments("Item", [skill]);
				skill = newSkills[0];
				break;

			case "trainingLevel":
				await skill.update({"system.trainingLevel": upgrade.value});
				break;

			case "specialisation":
				await skill.update({
					"system.specialisations": skill.system.specialisations
						? `${skill.system.specialisations}, ${upgrade.value}`
						: upgrade.value
				});
				break;
		}

		return {
			...await super._operateChanges(career, index),
			cost: (skill.system.advanced ? 4 : 2),
			uuid: skill.uuid,
			value: upgrade.value
		};
	}
}
