import CheckBuilder from "../../CheckBuilder.js";
import CheckHelper from "../../../CheckHelper.js";

/** @inheritDoc */
export default class WFRP3eChatLog extends foundry.applications.sidebar.tabs.ChatLog
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {actions: {rollFreeCheck: this.#rollFreeCheck}};

	/** @override */
	static PARTS = {
		...super.PARTS,
		input: {template: "systems/wfrp3e/templates/sidebar/tabs/chat/input.hbs"}
	};

	/** @inheritDoc */
	_getEntryContextOptions() {
		return [{
			name: "ROLL.ACTIONS.useTalent",
			icon: '<i class="fa-solid fa-gears fa-fw"></i>',
			condition: li => {
				const message = game.messages.get(li.dataset.messageId);
				return message.rolls.length > 0
					&& message.rolls[0].options.checkData
					&& (!Object.hasOwn(message.rolls[0].options.checkData, "outcome") || game.user.isGM);
			},
			callback: li => CheckHelper.useTalentOrAbility(li.dataset.messageId)
		}, {
			name: "ROLL.ACTIONS.applyToggledEffects",
			icon: '<i class="fa-solid fa-check fa-fw"></i>',
			condition: li => {
				const message = game.messages.get(li.dataset.messageId);
				return message.rolls.length > 0
					&& message.rolls[0].effects
					&& Object.values(message.rolls[0].effects).find(symbol => symbol.length > 0).length > 0
					&& (!Object.hasOwn(message.rolls[0].options?.checkData, "outcome") || game.user.isGM);
			},
			callback: li => CheckHelper.triggerActionEffects(li.dataset.messageId)
		}, ...super._getEntryContextOptions()];
	}

	/**
	 * Prepares a check and opens the Check Builder to edit it.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #rollFreeCheck()
	{
		await new CheckBuilder().render(true);
	}
}
