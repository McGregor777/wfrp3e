import ActionSelector from "./selectors/ActionSelector.js";
import SkillUpgrader from "./selectors/SkillUpgrader.js";
import TalentSelector from "./selectors/TalentSelector.js";
import CharacteristicUpgrader from "./CharacteristicUpgrader.js";

/** @inheritDoc */
export default class CareerAdvanceDialog extends foundry.applications.api.DialogV2
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {classes: ["career-advance-dialog"]};

	/**
	 * Proceeds to buying a new career advance depending on the selected type.
	 * @param {string} result The nature of the advance selected.
	 * @param {WFRP3eActor} actor The WFRP3eActor buying the advance.
	 * @param {WFRP3eItem} career The WFRP3eCareer owning the advance.
	 * @param {string} type The type of advance.
	 * @returns {Promise<void>}
	 */
	static async careerAdvanceSelection(result, actor, career, type)
	{
		switch(result) {
			case "action":
				if(career.system.openAdvanceTypeNumbers.action >= career.system.advanceOptions.action)
					return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted"));

				ActionSelector.wait({
					items: await ActionSelector.buildAdvanceOptionsList(actor)
				}).then(action => actor.buyActionAdvance(action, career, type));
				break;

			case "characteristic":
				CharacteristicUpgrader.wait({
					actor: actor,
					career: career,
					nonCareerAdvance: type === "nonCareer"
				}).then(upgrade => actor.buyCharacteristicAdvance(upgrade, career, type));
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
				if(career.system.openAdvanceTypeNumbers.skill >= career.system.advanceOptions.skill)
					return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted"));

				SkillUpgrader.wait({
					actor: actor,
					advanceType: type,
					items: await SkillUpgrader.buildAdvanceOptionsList(
						actor,
						career,
						type === "nonCareer"
					)
				}).then(upgrade => actor.buySkillAdvance(upgrade, career, type));
				break;

			case "talent":
				if(career.system.openAdvanceTypeNumbers.talent >= career.system.advanceOptions.talent)
					return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted"));

				TalentSelector.wait({
					items: await TalentSelector.buildAdvanceOptionsList(actor, career),
					types: career.system.sockets.map(socket => socket.type)
				}).then(talent => actor.buyTalentAdvance(talent, career, type));
				break;

			case "wound":
				if(career.system.openAdvanceTypeNumbers.wound >= career.system.advanceOptions.wound)
					return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.advanceOptionDepleted"));

				await actor.buyWoundAdvance(career, type);
				break;
		}
	}
}