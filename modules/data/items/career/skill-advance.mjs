import CareerAdvance from "./career-advance.mjs";

/**
 * The data model for a skill advance.
 * @property {boolean} active Whether the career advance is active.
 * @property {string} type The type of career advance, a value in CareerAdvance.TYPES.
 * @property {string} upgradeType The type of skill upgrade gained through the advance.
 * @property {string} [uuid] The uuid of the skill upgraded through the advance.
 * @property {string} [value] Either the newly acquired specialisation or the new training level of the skill.
 */
export default class SkillAdvance extends CareerAdvance
{
	/**
	 * The default values for a skill advance.
	 * @returns {{active: false, type: "skill", uuid: null, upgradeType: "acquisition", value: null}}
	 * @protected
	 */
	static get _defaults()
	{
		return Object.assign(super._defaults, {
			uuid: null,
			upgradeType: Object.keys(this.UPGRADE_TYPES)[0],
			value: null
		});
	}

	static {
		Object.defineProperty(this, "TYPE", {value: "skill"});
	}

	static UPGRADE_TYPES = {
		"acquisition": "SKILL.acquired",
		"trainingLevel": "SKILL.FIELDS.trainingLevel.label",
		"specialisation": "SKILL.FIELDS.specialisations.label"
	};

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
			upgradeType: new fields.StringField({
				choices: this.UPGRADE_TYPES,
				initial: "acquisition",
				required: true
			}),
			value: new fields.StringField({nullable: true})
		};
	}

	get output()
	{
		if(!this.active)
			return "";

		const parameters = {skill: fromUuidSync(this.uuid)?.name};
		if(this.value)
			parameters.value = this.value;

		return game.i18n.format(`CAREER.ADVANCES.${this.type}.${this.upgradeType}.output`, parameters);
	}

	/** @inheritDoc */
	static async _operateChanges(career, index)
	{
		const {SkillUpgrader} = wfrp3e.applications.apps.selectors,
			  actor = career.parent.parent,
			  upgrades = await SkillUpgrader.wait({
				  actor,
				  advanceType: !!index,
				  items: await SkillUpgrader.buildAdvanceOptionsList(actor, career.parent)
			  });

		const error = this._checkForError(career, {index});
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
			upgradeType: upgrade.type,
			uuid: skill.uuid,
			value: upgrade.value
		};
	}

	/** @inheritDoc */
	async cancelChanges()
	{
		const skill = await fromUuid(this.uuid),
			  upgradeType = this.upgradeType;

		if(upgradeType === "acquisition")
			try {
				await this.parent.parent.parent.deleteEmbeddedDocuments("Item", [skill._id]);
			}
			catch(error) {
				ui.notifications.error(error);
			}
		else {
			const propertyPath = `system.${upgradeType}`,
				  currentValue = foundry.utils.getProperty(skill, propertyPath);

			if(upgradeType === "trainingLevel")
				await skill.update({[propertyPath]: currentValue - 1});
			else if(upgradeType === "specialisation") {
				const match = currentValue.match(new RegExp(`(, )?(${this.value})`));
				match
					? await skill.update({[propertyPath]: currentValue.replace(match[0], "")})
					: ui.notifications.error(
						game.i18n.format("CAREER.WARNINGS.specialisationNotFound", {specialisation: this.value})
					);
			}
			else
				throw new Error(`Unknown upgrade type: ${upgradeType}`);
		}
	}
}
