/**
 * Extends the base Combat document.
 */
export default class WFRP3eCombat extends Combat
{
	get initiativeCharacteristic()
	{
		return CONFIG.WFRP3e.encounterTypes[this.system.type].characteristic;
	}

	/** @inheritDoc */
	async rollInitiative(ids, {formula = null, updateTurn = true, messageOptions = {}} = {})
	{
		// Structure input data
		ids = typeof ids === "string" ? [ids] : ids;
		const chatRollMode = game.settings.get("core", "rollMode"),
			  updates = [],
			  messages = [];

		// Iterate over Combatants, performing an initiative roll for each
		for(let [i, id] of ids.entries()) {
			// Get Combatant data (non-strictly)
			const combatant = this.combatants.get(id);
			if(!combatant?.isOwner)
				continue;

			// Produce an initiative roll for the Combatant
			const roll = await combatant.getInitiativeRoll(formula);
			await roll.evaluate();
			updates.push({_id: id, initiative: roll.totalSymbols.successes});

			// If the combatant is hidden, use a private roll unless an alternative rollMode was explicitly requested
			const rollMode = "rollMode" in messageOptions
				? messageOptions.rollMode
				: (combatant.hidden ? CONST.DICE_ROLL_MODES.PRIVATE : chatRollMode);

			// Construct chat message data
			let messageData = foundry.utils.mergeObject({
				speaker: foundry.documents.ChatMessage.implementation.getSpeaker({
					actor: combatant.actor,
					token: combatant.token,
					alias: combatant.name
				}),
				flavor: game.i18n.format("COMBAT.RollsInitiative", {name: foundry.utils.escapeHTML(combatant.name)}),
				flags: {"core.initiativeRoll": true}
			}, messageOptions);
			const chatData = await roll.toMessage(messageData, {rollMode, create: false});

			// Play 1 sound for the whole rolled set
			if(i > 0)
				chatData.sound = null;

			messages.push(chatData);
		}

		if(!updates.length)
			return this;

		// Update combatants and combat turn
		const currentId = this.combatant?.id;
		await this.updateEmbeddedDocuments("Combatant", updates);
		if(updateTurn && currentId)
			await this.update({turn: this.turns.findIndex(t => t.id === currentId)}, {turnEvents: false});

		// Create multiple chat messages
		await foundry.documents.ChatMessage.implementation.create(messages);
		return this;
	}
}