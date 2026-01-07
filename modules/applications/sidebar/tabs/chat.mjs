/** @inheritDoc */
export default class ChatLog extends foundry.applications.sidebar.tabs.ChatLog
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			addDiePool: this.#addDiePool,
			toggleEffect: this.#toggleEffect,
			rollFreeCheck: this.#rollFreeCheck
		}
	};

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
			callback: li => wfrp3e.dice.CheckRoll.useTalentOrAbility(game.messages.get(li.dataset.messageId))
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
			callback: li => wfrp3e.dice.CheckRoll.triggerActionEffects(game.messages.get(li.dataset.messageId))
		}, ...super._getEntryContextOptions()];
	}

	/**
	 * Adds a Die Pool to a Check Roll.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @return {Promise<void>}
	 */
	static async #addDiePool(event, target)
	{
		const message = game.messages.get(target.closest("[data-message-id]").dataset.messageId);
		message.rolls[0].addDiePool(await wfrp3e.applications.dice.CheckBuilder.wait(), {chatMessage: message});
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

	/**
	 * Toggles an Action Effect from a Check Roll.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @return {Promise<void>}
	 */
	static async #toggleEffect(event, target)
	{
		wfrp3e.dice.CheckRoll.toggleActionEffect(
			game.messages.get(target.closest("[data-message-id]").dataset.messageId),
			target.closest("[data-symbol]").dataset.symbol,
			target.closest("[data-index]").dataset.index
		);
	}
}
