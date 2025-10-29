import {capitalize} from "../helpers.mjs";
//#TODO Merge CheckRoll and CheckHelper.
/**
 * The CheckHelper provides methods to prepare checks.
 */
export default class CheckHelper
{
	/**
	 * Searches and triggers every relevant effect owned either by the actor performing the check, or its target.
	 * @param {Actor} actor The actor performing the check.
	 * @param {Object} checkData The check data.
	 * @param {DiePool} diePool The die pool.
	 * @returns {Promise<void>}
	 */
	static async triggerCheckPreparationEffects(actor, checkData, diePool)
	{
		for(const effect of actor.findTriggeredEffects("onCheckPreparation")) {
			await effect.triggerEffect({
				parameters: [actor, checkData, diePool],
				parameterNames: ["actor", "checkData", "diePool"]
			});
		}

		if(checkData.targets?.length > 0) {
			await fromUuid(checkData.targets[0]).then(async actor => {
				for(const effect of actor.findTriggeredEffects("onTargetingCheckPreparation")) {
					await effect.triggerEffect({
						parameters: [actor, checkData, diePool],
						parameterNames: ["actor", "checkData", "diePool"]
					});
				}
			});
		}
	}

	/**
	 * Uses a talent or ability on a check roll.
	 * @param {string} chatMessageId The id of the chat message containing the check roll.
	 */
	static async useTalentOrAbility(chatMessageId)
	{
		const chatMessage = game.messages.get(chatMessageId),
			  checkRoll = chatMessage.rolls[0],
			  checkData = checkRoll.options.checkData,
			  actor = await fromUuid(checkData.actor),
			  triggeredItems = actor.findTriggeredItems(
				  "onPostCheckTrigger",{
					  parameters: [actor, chatMessage, checkData, checkRoll],
					  parameterNames: ["actor", "chatMessage", "checkData", "roll"]
				  });

		if(triggeredItems.length > 0) {
			const selectedItemUuids = await wfrp3e.applications.apps.selectors.TalentSelector.wait({items: triggeredItems});

			if(selectedItemUuids[0]) {
				const selectedTalent = await fromUuid(selectedItemUuids[0]),
					  effects =  selectedTalent.effects.filter(effect => effect.system.type === "onPostCheckTrigger");

				for(const effect of effects) {
					await effect.triggerEffect({
						parameters: [actor, chatMessage, checkData, checkRoll],
						parameterNames: ["actor", "chatMessage", "checkData", "checkRoll"]
					});
				}

				chatMessage.update({
					"options.checkData.triggeredItems": checkData.triggeredItems
						? checkData.triggeredItems.push(selectedItemUuids[0])
						: [selectedItemUuids[0]]}
				);
			}
		}
		else
			ui.notifications.warn(game.i18n.localize("ROLL.WARNINGS.noTalentNorAbilityToUse"));
	}

	/**
	 * Determines if an Action requires no check.
	 * @param {string} check
	 * @returns {boolean}
	 */
	static doesRequireNoCheck(check)
	{
		return [game.i18n.localize("ACTION.CHECK.noCheckRequired"),
			game.i18n.localize("ACTION.CHECK.generallyNoCheckRequired")].includes(check);
	}

	/**
	 * Get the universal boon effect.
	 * @param {boolean} isMental Whether the check is based upon a mental characteristic.
	 * @returns {{symbolAmount: number, description: string}}
	 */
	static getUniversalBoonEffect(isMental)
	{
		return isMental ? {
			description: game.i18n.format("ROLL.EFFECTS.recoverStress", {amount: 1}),
			script: "outcome.stress--;",
			symbolAmount: 2
		} : {
			description: game.i18n.format("ROLL.EFFECTS.recoverFatigue", {amount: 1}),
			script: "outcome.fatigue--;",
			symbolAmount: 2
		};
	}

	/**
	 * Get the universal bane effect.
	 * @param {boolean} isMental Whether the check is based upon a mental characteristic.
	 * @returns {{symbolAmount: number, description: string}}
	 */
	static getUniversalBaneEffect(isMental)
	{
		return isMental ? {
			description: game.i18n.format("ROLL.EFFECTS.sufferStress", {amount: 1}),
			script: "outcome.stress++;",
			symbolAmount: 2
		} : {
			description: game.i18n.format("ROLL.EFFECTS.sufferFatigue", {amount: 1}),
			script: "outcome.fatigue++;",
			symbolAmount: 2
		};
	}

	/**
	 * Get the weapon's critical rating effect.
	 * @param {Item} weapon
	 * @returns {{symbolAmount: number, description: string}}
	 */
	static getCriticalRatingEffect(weapon)
	{
		return {
			description: game.i18n.format("ROLL.EFFECTS.critical", {amount: 1}),
			script: "outcome.targetCriticalWounds++;",
			symbolAmount: weapon.system.criticalRating
		};
	}

	/**
	 * Get the universal Sigmar's comet effect.
	 * @returns {{symbolAmount: number, description: string}}
	 */
	static getUniversalSigmarsCometEffect()
	{
		return {
			description: game.i18n.format("ROLL.EFFECTS.critical", {amount: 1}),
			script: "outcome.targetCriticalWounds++;",
			symbolAmount: 1
		};
	}

	/**
	 * Toggles an action effect from a check roll, depending on the symbols remaining, and execute scripts if necessary.
	 * @param {string} chatMessageId The id of the chat message containing the check roll.
	 * @param {string} symbol The symbol of the effect to toggle.
	 * @param {number} index The index of the effect to toggle.
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async toggleActionEffect(chatMessageId, symbol, index)
	{
		const chatMessage = game.messages.get(chatMessageId);

		if(!chatMessage.isOwner) {
			ui.notifications.warn(game.i18n.localize("ROLL.WARNINGS.notAllowed"));
			return;
		}

		const changes = {rolls: chatMessage.rolls},
			  checkRoll = changes.rolls[0],
			  toggledEffect = checkRoll.effects[symbol][index];

		if(toggledEffect.active === true)
			await CheckHelper._toggleOffActionEffect(toggledEffect, checkRoll, symbol);
		else {
			try {
				const functionName = `toggleOn${capitalize(symbol)}Effect`;

				await CheckHelper[`${functionName}`]
					? CheckHelper[`${functionName}`](toggledEffect, checkRoll, symbol)
					: CheckHelper._toggleOnActionEffect(toggledEffect, checkRoll, symbol);
			}
			catch(error) {
				console.error(`Something went wrong when toggling the Action effect: ${error}`);
			}
		}

		chatMessage.update(changes);
	}

	/**
	 * Toggles an action effect off and executes its revert script if it was an immediate action effect.
	 * @param {ActionEffect} toggledEffect The action effect to toggle off.
	 * @param {CheckRoll} checkRoll The check roll with which the toggled action effect is associated.
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _toggleOffActionEffect(toggledEffect, checkRoll)
	{
		if(toggledEffect.immediate)
			await CheckHelper.executeActionEffectScript(toggledEffect, toggledEffect.reverseScript, checkRoll);

		toggledEffect.active = false;
	}

	/**
	 * Checks if an action effect can be toggled on, then toggles it if it does.
	 * @param {ActionEffect} toggledEffect The action effect to toggle on.
	 * @param {CheckRoll} checkRoll The check roll with which the toggled action effect is associated.
	 * @param {string} symbol The symbol associated with the toggled action effect.
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _toggleOnActionEffect(toggledEffect, checkRoll, symbol)
	{
		let result = "";

		try {
			const functionName = `check${capitalize(symbol)}EffectToggleable`;

			result = CheckHelper[`${functionName}`]
				? CheckHelper[`${functionName}`](toggledEffect, checkRoll, symbol)
				: CheckHelper.checkEffectToggleable(toggledEffect, checkRoll, symbol);
		}
		catch(error) {
			console.error(`Something went wrong when toggling the Action effect: ${error}`);
		}

		if(result === "") {
			toggledEffect.active = true;

			if(toggledEffect.immediate)
				await CheckHelper.executeActionEffectScript(toggledEffect, toggledEffect.script, checkRoll);
		}
		else
			ui.notifications.warn(result);
	}

	/**
	 * Checks if a success action effect can be toggled on, then toggles it if it does.
	 * @param {ActionEffect} toggledEffect The action effect to toggle on.
	 * @param {CheckRoll} checkRoll The check roll with which the toggled action effect is associated.
	 * @param {string} symbol The symbol associated with the toggled action effect.
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async toggleOnSuccessActionEffect(toggledEffect, checkRoll, symbol = "success")
	{
		let result = CheckHelper.checkSuccessEffectToggleable(toggledEffect, symbol, checkRoll);

		if(result === "") {
			checkRoll.effects.success.forEach(effect => effect.active = false);
			toggledEffect.active = true;

			if(toggledEffect.immediate)
				await CheckHelper.executeActionEffectScript(toggledEffect, toggledEffect.script, checkRoll);
		}
		else
			ui.notifications.warn(result);
	}

	/**
	 * Checks if an action effect can be toggled.
	 * @param {ActionEffect} toggledEffect The action effect to check.
	 * @param {CheckRoll} checkRoll The check roll with which the toggled action effect is associated.
	 * @param {string} symbol The symbol associated with the action effect.
	 * @returns {string} Either returns an empty string if the effect is toggleable, or the reason if not.
	 */
	static checkEffectToggleable(toggledEffect, checkRoll, symbol)
	{
		const plural = CONFIG.WFRP3e.symbols[symbol].plural;

		if(checkRoll.remainingSymbols[plural] >= toggledEffect.symbolAmount)
			return "";

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
		});
	}

	/**
	 * Checks if a boon action effect can be toggled, taking remaining Sigmar's comet symbols into account.
	 * @param {ActionEffect} toggledEffect The action effect to check.
	 * @param {CheckRoll} checkRoll The check roll with which the toggled action effect is associated.
	 * @param {string} symbol The symbol associated with the action effect.
	 * @returns {string} Either returns an empty string if the effect is toggleable, or the reason if not.
	 */
	static checkBoonEffectToggleable(toggledEffect, checkRoll, symbol = "boon")
	{
		const plural = CONFIG.WFRP3e.symbols[symbol].plural;

		if(checkRoll.remainingSymbols[plural] + checkRoll.remainingSymbols.sigmarsComets >= toggledEffect.symbolAmount)
			return "";

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
		});
	}

	/**
	 * Checks if a delay action effect can be toggled, taking remaining bane symbols into account.
	 * @param {ActionEffect} toggledEffect The action effect to check.
	 * @param {CheckRoll} checkRoll The check roll with which the toggled action effect is associated.
	 * @param {string} symbol The symbol associated with the action effect.
	 * @returns {string} Either returns an empty string if the effect is toggleable, or the reason if not.
	 */
	static checkDelayEffectToggleable(toggledEffect, checkRoll, symbol = "delay")
	{
		const plural = CONFIG.WFRP3e.symbols[symbol].plural;

		if(checkRoll.remainingSymbols[plural] > 0) {
			if(toggledEffect.symbolAmount > 1) {
				if(checkRoll.remainingSymbols.banes >= toggledEffect.symbolAmount - 1)
					return "";
				else
					return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
						symbol: game.i18n.localize(CONFIG.WFRP3e.symbols.bane.name)
					});
			}
			else
				return "";
		}

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
		});
	}

	/**
	 * Checks if an exertion action effect can be toggled, taking remaining bane symbols into account.
	 * @param {ActionEffect} toggledEffect The action effect to check.
	 * @param {CheckRoll} checkRoll The check roll with which the toggled action effect is associated.
	 * @param {string} symbol The symbol associated with the action effect.
	 * @returns {string} Either returns an empty string if the effect is toggleable, or the reason if not.
	 */
	static checkExertionEffectToggleable(toggledEffect, checkRoll, symbol = "exertion")
	{
		const plural = CONFIG.WFRP3e.symbols[symbol].plural;

		if(checkRoll.remainingSymbols[plural] > 0) {
			if(toggledEffect.symbolAmount > 1) {
				if(checkRoll.remainingSymbols.banes >= toggledEffect.symbolAmount - 1)
					return "";
				else
					return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
						symbol: game.i18n.localize(CONFIG.WFRP3e.symbols.bane.name)
					});
			}
			else
				return "";
		}

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
		});
	}

	/**
	 * Checks if a success action effect can be toggled, taking remaining Sigmar's comet symbols into account.
	 * @param {ActionEffect} toggledEffect The action effect to check.
	 * @param {CheckRoll} checkRoll The check roll with which the toggled action effect is associated.
	 * @param {string} symbol The symbol associated with the action effect.
	 * @returns {string} Either returns an empty string if the effect is toggleable, or the reason if not.
	 */
	static checkSuccessEffectToggleable(toggledEffect, checkRoll, symbol = "symbol")
	{
		const plural = CONFIG.WFRP3e.symbols[symbol].plural;

		if(checkRoll.totalSymbols[plural] + checkRoll.remainingSymbols.sigmarsComets >= toggledEffect.symbolAmount)
			return "";

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(CONFIG.WFRP3e.symbols[symbol].name)
		});
	}

	/**
	 * Executes the script of an action effect.
	 * @param {ActionEffect} effect The action effect which script is executed.
	 * @param {string} script The action effect script to execute.
	 * @param {CheckRoll} checkRoll The check roll with which the toggled action effect is associated.
	 * @param {Object} [options] Optional parameters to pass to the action effect script.
	 * @param {CheckData|null} [options.checkData] The check data.
	 * @param {Actor|null} [options.actor] The actor performing the check.
	 * @param {CheckOutcome|null} [options.outcome] The outcome of the check.
	 * @param {Actor|null} [options.targetActor] The target of the check.
	 * @returns {Promise<void>}
	 */
	static async executeActionEffectScript(effect, script, checkRoll, {checkData = null, actor = null, outcome = null, targetActor = null} = {})
	{
		if(checkData === null)
			checkData = checkRoll.options.checkData;

		if(actor === null)
			  actor = await fromUuid(checkData.actor);

		if(targetActor === null)
			targetActor = checkData.targets?.length > 0 ? await fromUuid(checkData.targets[0]) : null;

		try {
			// eslint-disable-next-line no-new-func
			const fn = new foundry.utils.AsyncFunction(
				"checkRoll",
				"checkData",
				"actor",
				"actorToken",
				"outcome",
				"targetActor",
				"targetToken",
				script
			);
			await fn.call(
				effect,
				checkRoll,
				checkData,
				actor,
				actor.token,
				options.outcome,
				targetActor,
				targetActor ? targetActor?.token : null
			);
		}
		catch(error) {
			console.error(error);
		}
	}

	/**
	 * Triggers the toggled effects from a roll.
	 * @param {string} chatMessageId The id of the chat message containing the roll.
	 * @returns {Promise<void>}
	 */
	static async triggerActionEffects(chatMessageId)
	{
		const chatMessage = game.messages.get(chatMessageId),
			  roll = chatMessage.rolls[0],
			  checkData = roll.options.checkData,
			  actor = await fromUuid(checkData.actor),
			  targetActor = checkData.targets?.length > 0 ? await fromUuid(checkData.targets[0]) : null,
			  toggledEffects = Object.values(structuredClone(roll.effects)).reduce((symbol, allEffects) => {
				  allEffects.push(...symbol.filter(effect => effect.active));
				  return allEffects;
			  }, []),
			  outcome = {
				  targetDamages: 0,
				  targetCriticalWounds: 0,
				  targetFatigue: 0,
				  targetStress: 0,
				  wounds: 0,
				  criticalWounds: 0,
				  fatigue: CONFIG.WFRP3e.characteristics[checkData.characteristic].type === "physical"
					  ? roll.remainingSymbols.exertions
					  : 0,
				  stress: CONFIG.WFRP3e.characteristics[checkData.characteristic].type === "mental"
					  ? roll.remainingSymbols.exertions
					  : 0,
				  favour: 0,
				  power: 0
			  },
			  actorUpdates = {system: {}},
			  targetUpdates = {system: {}},
			  chatMessageUpdates = {rolls: chatMessage.rolls};

		for(const effect of toggledEffects)
			await CheckHelper.executeActionEffectScript(effect, effect.script, roll, {checkData, actor, outcome, targetActor})

		if(targetActor) {
			// If the attack inflicts damages, reduce them by Toughness and Soak values.
			if(outcome.targetDamages > 0) {
				outcome.targetDamages -= targetActor.system.characteristics.toughness.rating + targetActor.system.totalSoak;

				// If the attack still inflicts more damages than the target's wound threshold, the target suffers from a critical wound
				// (in addition to those coming from effects).
				if(outcome.targetDamages > 0 && outcome.targetDamages > targetActor.system.wounds.value) {
					targetUpdates.system.wounds = {value: targetActor.system.wounds.value - outcome.targetDamages};

					outcome.targetCriticalWounds = await Item.createDocuments(
						await this.drawCriticalWoundsRandomly(outcome.targetCriticalWounds + 1),
						{parent: targetActor}
					).then(documents => documents.map(document => document.uuid));
				}
				else if(outcome.targetDamages > 0) {
					targetUpdates.system.wounds = {value: targetActor.system.wounds.value - outcome.targetDamages};

					if(outcome.targetCriticalWounds > 0) {
						outcome.targetCriticalWounds = await Item.createDocuments(
							await this.drawCriticalWoundsRandomly(outcome.targetCriticalWounds),
							{parent: targetActor}
						).then(documents => documents.map(document => document.uuid));
					}
				}
				// If the attack inflicts 0 damages in spite of hitting the target, the target still suffers one damage
				// (no critical wounds are inflicted though).
				else {
					outcome.targetDamages = 1
					targetUpdates.system.wounds = {value: targetActor.system.wounds.value - 1};
				}
			}

			if(outcome.targetFatigue > 0 || outcome.targetFatigue < 0) {
				if(targetActor.type === "creature" && !targetActor.system.nemesis)
					targetUpdates.system.impairments = {fatigue: targetActor.system.impairments.fatigue + outcome.targetFatigue};
				else if(targetActor.system.wounds.value)
					targetUpdates.system.wounds.value -= outcome.targetFatigue;
				else
					targetUpdates.system.wounds = {value: targetActor.system.wounds.value - outcome.targetFatigue};
			}

			if(outcome.targetStress > 0 || outcome.targetStress < 0) {
				if(targetActor.type === "creature" && !targetActor.system.nemesis)
					targetUpdates.system.impairments = {stress: targetActor.system.impairments.stress + outcome.targetStress};
				else if(targetActor.system.wounds.value)
					targetUpdates.system.wounds.value -= outcome.targetStress;
				else
					targetUpdates.system.wounds = {value: targetActor.system.wounds.value - outcome.targetStress};
			}

			await targetActor.update(targetUpdates);
		}

		if(actor) {
			if(outcome.wounds > 0)
				actorUpdates.system.wounds = actor.system.wounds.value - outcome.wounds;

			if(outcome.criticalWounds > 0)
				outcome.criticalWounds = await Item.createDocuments(
					await this.drawCriticalWoundsRandomly(outcome.criticalWounds),
					{parent: actor}
				).then(documents => documents.map(document => document.uuid));

			if(outcome.fatigue > 0 || outcome.fatigue < 0)
				actorUpdates.system.impairments = {fatigue: actor.system.impairments.fatigue + outcome.fatigue};

			if(outcome.stress > 0 || outcome.stress < 0)
				actorUpdates.system.impairments = {stress: actor.system.impairments.stress + outcome.stress};

			if(outcome.favour > 0 || outcome.favour < 0)
				actorUpdates.system.favour = actor.system.favour + outcome.favour;

			if(outcome.power > 0 || outcome.power < 0)
				actorUpdates.system.power = actor.system.power + outcome.power;

			await actor.update(actorUpdates);
		}

		chatMessageUpdates.rolls[0].options.checkData.outcome = outcome;
		await chatMessage.update(chatMessageUpdates);

		if(roll.totalSymbols.successes && checkData?.action)
			await fromUuid(checkData.action).then(async action => await action.exhaustAction(checkData.face));
	}

	/**
	 * Draws one or several critical wounds randomly from the critical wounds roll table.
	 * @param {Number} amount The number of critical wounds to draw.
	 * @returns {Promise<Item[]>} The critical wounds items owned by the target actor.
	 */
	static async drawCriticalWoundsRandomly(amount)
	{
		const allCriticalWounds = [];

		await game.packs.get("wfrp3e.roll-tables").getDocument("KpiwJKBdJ8qAyQjs").then(async table => {
			await table.drawMany(amount, {displayChat: false}).then(async rollTableDraw => {
				for(const result of rollTableDraw.results) {
					//#TODO Move this logic into a Macro embedded into the Critical Wounds RollTable.
					// Roll twice and select the critical wound with the higher severity rating (if tied, GM chooses)
					if(result.id === "uZIgluknIsZ428Cn") {
						const criticalWounds = [];
						let highestCriticalWound = null;

						for(let i = 0; i < 2; i++) {
							let rollTableDraw = null,
								criticalWound = null

							while(!rollTableDraw || ["uZIgluknIsZ428Cn", "aJ0a8gzJbFSPS7xY"].includes(rollTableDraw.results[0].id))
								rollTableDraw = await table.draw({displayChat: false});

							criticalWound = await game.packs.get(rollTableDraw.results[0].documentCollection)
								.getDocument(rollTableDraw.results[0].documentId);
							criticalWounds.push(criticalWound);

							if(!highestCriticalWound || highestCriticalWound.system.severityRating < criticalWound.system.severityRating)
								highestCriticalWound = criticalWound;
						}

						if(criticalWounds[0].system.severityRating === criticalWounds[1].system.severityRating)
							await new Dialog({
								title: game.i18n.localize("APPLICATION.TITLE.ChooseACriticalWound"),
								content: `<p>${game.i18n.format("APPLICATION.DESCRIPTION.ChooseACriticalWound")}</p>`,
								buttons: {
									one: {
										label: criticalWounds[0].name,
										callback: async dlg => {
											allCriticalWounds.push(criticalWounds[0]);
										}
									},
									two: {
										label: criticalWounds[1].name,
										callback: async dlg => {
											allCriticalWounds.push(criticalWounds[1]);
										}
									},
								}
							}).render(true);
						else
							allCriticalWounds.push(highestCriticalWound);
					}
					//#TODO Move this logic into a Macro embedded into the Critical Wounds RollTable.
					// Roll twice and apply both results! You poor sod...
					else if(result.id === "aJ0a8gzJbFSPS7xY") {
						for(let j = 0; j < 2; j++) {
							let rollTableDraw = null;

							while(!rollTableDraw || ["uZIgluknIsZ428Cn", "aJ0a8gzJbFSPS7xY"].includes(rollTableDraw.results[0].id))
								rollTableDraw = await table.draw({displayChat: false});

							allCriticalWounds.push(await game.packs.get(rollTableDraw.results[0].documentCollection)
								.getDocument(rollTableDraw.results[0].documentId));
						}
					}
					// Default.
					else
						allCriticalWounds.push(await game.packs.get(result.documentCollection)
							.getDocument(result.documentId));
				}
			});
		});

		return allCriticalWounds;
	}
}
