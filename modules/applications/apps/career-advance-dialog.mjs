/** @inheritDoc */
export default class CareerAdvanceDialog extends foundry.applications.api.DialogV2
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {classes: ["career-advance-dialog"]};

	/**
	 * Proceeds to buying a new career advance depending on the selected type.
	 * @param {string} result The nature of the advance selected.
	 * @param {Actor} actor The actor buying the advance.
	 * @param {Item} career The career owning the advance.
	 * @param {string} type The type of advance.
	 * @returns {Promise<void>}
	 */
	static async careerAdvanceSelection(result, actor, career, type)
	{
		switch(result) {
			case "action":
				const {ActionSelector} = wfrp3e.applications.apps.selectors;

				if(career.system.openAdvanceTypeNumbers.action >= career.system.advanceOptions.action)
					return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted"));

				const actions = await ActionSelector.wait({items: await ActionSelector.buildOptionsList(actor)});
				await actor.buyActionAdvance(actions[0], career, type);
				break;

			case "characteristic":
				const upgrade = await wfrp3e.applications.apps.CharacteristicUpgrader.wait({
					actor,
					career,
					nonCareerAdvance: type === "nonCareer"
				});
				await actor.buyCharacteristicAdvance(upgrade, career, type);
				break;

			case "conservative":
				if(career.system.openAdvanceTypeNumbers.conservative >= career.system.advanceOptions.conservative)
					return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted"));

				await actor.buyConservativeAdvance(career);
				break;

			case "reckless":
				if(career.system.openAdvanceTypeNumbers.reckless >= career.system.advanceOptions.reckless)
					return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted"));

				await actor.buyRecklessAdvance(career);
				break;

			case "skill":
				const {SkillUpgrader} = wfrp3e.applications.apps.selectors;

				if(career.system.openAdvanceTypeNumbers.skill >= career.system.advanceOptions.skill)
					return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted"));

				const upgrades = await wfrp3e.applications.apps.selectors.SkillUpgrader.wait({
					actor: actor,
					advanceType: type,
					items: await SkillUpgrader.buildAdvanceOptionsList(actor, career, type === "nonCareer")
				});
				await actor.buySkillAdvance(upgrades[0], career, type);
				break;

			case "talent":
				const {TalentSelector} = wfrp3e.applications.apps.selectors;

				if(career.system.openAdvanceTypeNumbers.talent >= career.system.advanceOptions.talent)
					return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted"));

				const talents = await TalentSelector.wait({
					items: await TalentSelector.buildAdvanceOptionsList(actor, career)
				});
				await actor.buyTalentAdvance(talents[0], career, type);
				break;

			case "wound":
				if(career.system.openAdvanceTypeNumbers.wound >= career.system.advanceOptions.wound)
					return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted"));

				await actor.buyWoundAdvance(career, type);
				break;
		}
	}
}
