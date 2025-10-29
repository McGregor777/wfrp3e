/** @inheritDoc */
export default class ChatLog extends foundry.applications.sidebar.tabs.ChatLog
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {actions: {rollFreeCheck: this.#rollFreeCheck}};

	/** @inheritDoc */
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
					&& !message.rolls[0].options.checkData.disabled
					&& ("outcome" in message.rolls[0].options.checkData || game.user.isGM);
			},
			callback: li => wfrp3e.dice.CheckHelper.useTalentOrAbility(li.dataset.messageId)
		}, {
			name: "ROLL.ACTIONS.applyToggledEffects",
			icon: '<i class="fa-solid fa-check fa-fw"></i>',
			condition: li => {
				const message = game.messages.get(li.dataset.messageId);
				return message.rolls.length > 0
					&& !message.rolls[0].options.checkData?.disabled
					&& message.rolls[0].effects
					&& Object.values(message.rolls[0].effects).find(symbol => symbol.length > 0).length > 0
					&& (!("outcome" in message.rolls[0].options.checkData) || game.user.isGM);
			},
			callback: li => wfrp3e.dice.CheckHelper.triggerActionEffects(li.dataset.messageId)
		}, ...super._getEntryContextOptions()];
	}

	/**
	 * Prepares a check and opens the Check Builder to edit it.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #rollFreeCheck()
	{
		const diePool = await wfrp3e.applications.dice.CheckBuilder.wait();
		await diePool.roll();
	}
}
