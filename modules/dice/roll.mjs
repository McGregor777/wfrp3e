import {capitalize} from "../helpers.mjs";

/** @inheritDoc */
export default class CheckRoll extends foundry.dice.Roll
{
	static CHAT_TEMPLATE = "systems/wfrp3e/templates/dice/roll.hbs";
	static TOOLTIP_TEMPLATE = "systems/wfrp3e/templates/dice/tooltip.hbs";

	static CHALLENGE_LEVELS = {
		simple: {
			challengeDice: 0,
			name: "CHALLENGELEVEL.simple"
		},
		easy: {
			challengeDice: 1,
			name: "CHALLENGELEVEL.easy"
		},
		average: {
			challengeDice: 2,
			name: "CHALLENGELEVEL.average"
		},
		hard: {
			challengeDice: 3,
			name: "CHALLENGELEVEL.hard"
		},
		daunting: {
			challengeDice: 4,
			name: "CHALLENGELEVEL.daunting"
		},
		heroic: {
			challengeDice: 5,
			name: "CHALLENGELEVEL.heroic"
		}
	}

	/**
	 * The number of each symbol obtained by the check roll.
	 * @returns {{success: number, righteousSuccess: number, boon: number, sigmarsComet: number, challenge: number, bane: number, chaosStar: number, delay: number, exertion: number}}
	 */
	get resultSymbols()
	{
		const resultSymbols = {};
		for(const symbol of Object.values(wfrp3e.dice.terms.Die.SYMBOLS))
			resultSymbols[symbol.plural] = 0;

		for(const die of this.dice) {
			if(die instanceof wfrp3e.dice.terms.Die)
				for(const result of die.results)
					if(typeof result.symbols === "object") {
						for(const key of Object.keys(result.symbols))
							resultSymbols[key] += +result.symbols[key] || 0;

						resultSymbols.successes += +result.symbols.righteousSuccesses || 0;
					}
		}

		return resultSymbols;
	}

	/**
	 * The total number of each symbol with both those obtained by the check roll and those coming from the starting pool.
	 * Challenges are subtracted from successes and banes are subtracted from boons.
	 * @returns {{success: number, righteousSuccess: number, boon: number, sigmarsComet: number, challenge: number, bane: number, chaosStar: number, delay: number, exertion: number}}
	 */
	get totalSymbols()
	{
		const totalSymbols = foundry.utils.deepClone(this.resultSymbols);

		if(this.options.startingSymbols)
			for(const key of Object.keys(totalSymbols))
				totalSymbols[key] += +this.options.startingSymbols[key] || 0;

		if(totalSymbols.successes < totalSymbols.challenges) {
			totalSymbols.challenges -= totalSymbols.successes < 0 ? 0 : +totalSymbols.successes || 0;
			totalSymbols.successes = 0;
		}
		else {
			totalSymbols.successes -= totalSymbols.challenges < 0 ? 0 : +totalSymbols.challenges || 0;
			totalSymbols.challenges = 0;
		}

		if(totalSymbols.boons < totalSymbols.banes) {
			totalSymbols.banes -= totalSymbols.boons < 0 ? 0 : +totalSymbols.boons || 0;
			totalSymbols.boons = 0;
		}
		else {
			totalSymbols.boons -= totalSymbols.banes < 0 ? 0 : +totalSymbols.banes || 0;
			totalSymbols.banes = 0;
		}

		return totalSymbols;
	}

	/**
	 * The number of each symbol left unused.
	 * @returns {{success: number, righteousSuccess: number, boon: number, sigmarsComet: number, challenge: number, bane: number, chaosStar: number, delay: number, exertion: number}}
	 */
	get remainingSymbols()
	{
		const remainingSymbols = foundry.utils.deepClone(this.totalSymbols);

		if(this.effects)
			for(const [symbolName, effects] of Object.entries(this.effects)) {
				const plural = wfrp3e.dice.terms.Die.SYMBOLS[symbolName].plural;

				for(const effect of effects)
					if(effect.active)
						if(["delay", "exertion"].includes(symbolName)) {
							remainingSymbols[plural]--;

							if(effect.symbolAmount > 1)
								remainingSymbols.banes -= effect.symbolAmount - 1;
						}
						else if(remainingSymbols[plural] < effect.symbolAmount) {
							if(["success", "boon"].includes(symbolName)
								&& (remainingSymbols[plural] + remainingSymbols.sigmarsComets >= effect.symbolAmount)) {
								remainingSymbols.sigmarsComets += remainingSymbols[plural] - effect.symbolAmount;
								return 0;
							}

							throw new Error(`The remaining number of ${plural} cannot be negative.`);
						}
						else
							remainingSymbols[plural] -= effect.symbolAmount;
			}

		return remainingSymbols;
	}

	/** @inheritDoc */
	async evaluate({minimize = false, maximize = false, allowStrings = false, allowInteractive = true, ...options} = {})
	{
		if(this._evaluated)
			throw new Error(`The ${this.constructor.name} has already been evaluated and is now immutable`);

		this._evaluated = true;

		if(CONFIG.debug.dice)
			console.debug(`Evaluating roll with formula "${this.formula}"`);

		// Migration path for async rolls
		if("async" in options)
			foundry.utils.logCompatibilityWarning("The async option for Roll#evaluate has been removed. "
				+ "Use Roll#evaluateSync for synchronous roll evaluation.");

		await this._evaluate({minimize, maximize, allowStrings, allowInteractive});

		if(this.options.checkData?.action)
			return this._finishCheckRoll();

		return this;
	}

	/** @inheritDoc */
	async _prepareChatRenderContext({flavor, isPrivate = false, ...options} = {})
	{
		const Die = wfrp3e.dice.terms.Die,
			  checkData = this.options.checkData,
			  specialDieResultLabels = [];

		if(!isPrivate)
			for(const die of this.dice)
				if(die instanceof Die)
					for(const result of die.results)
						specialDieResultLabels.push(die.getResultLabel(result));

		let context = {
			formula: isPrivate ? "???" : this._formula,
			flavor: isPrivate ? null : flavor ?? this.options.flavor,
			user: game.user.id,
			tooltip: isPrivate ? "" : await this.getTooltip(),
			total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
			totalSymbols: this.totalSymbols,
			hasSpecialDice: !!this.terms.find(term => term instanceof Die),
			hasStandardDice: !!this.terms.find(term => !(term instanceof Die) && term instanceof foundry.dice.terms.DiceTerm),
			publicRoll: !isPrivate,
			remainingSymbols: isPrivate ? {} : this.remainingSymbols,
			specialDieResultLabels,
			symbols: wfrp3e.dice.terms.Die.SYMBOLS
		};

		if(checkData) {
			const actor = await fromUuid(checkData.actor);
			context = {
				...context,
				actorName: actor.token ? actor.token.name : actor.prototypeToken.name,
				outcome: checkData.outcome
			};

			if(checkData.disabled)
				context.disabled = checkData.disabled;

			if(checkData.action) {
				const textEditor = foundry.applications.ux.TextEditor.implementation,
					  action = await fromUuid(checkData.action),
					  face = checkData.face,
					  effects = foundry.utils.deepClone(this.effects);

				for(const symbol of Object.values(effects))
					for(const effect of symbol)
						effect.enrichment = {description: await textEditor.enrichHTML(effect.description)};

				context = {
					...context,
					action,
					face,
					effects,
					enrichment: {
						special: await textEditor.enrichHTML(action.system[face].special),
						uniqueEffect: await textEditor.enrichHTML(action.system[face].uniqueEffect)
					}
				};
			}

			if(Array.isArray(checkData.outcome?.criticalWounds))
				context.criticalWoundLinks = this._prepareCriticalWoundLinks(checkData.outcome.criticalWounds);

			if(checkData.targets && checkData.targets.length > 0) {
				const targetActor = await fromUuid(checkData.targets[0]);
				context.targetActorName = targetActor.token ? targetActor.token.name : targetActor.prototypeToken.name;

				if(Array.isArray(checkData.outcome?.targetCriticalWounds))
					context.targetCriticalWoundLinks = this._prepareCriticalWoundLinks(checkData.outcome.targetCriticalWounds);
			}
		}

		return context;
	}

	/** @inheritDoc */
	toJSON()
	{
		return {...super.toJSON(), effects: this.effects};
	}

	/** @inheritDoc */
	static fromData(data)
	{
		return foundry.utils.mergeObject(super.fromData(data), {effects: data.effects});
	}

	/**
	 * Completes the post-evaluation preparations required for a Check Roll.
	 * @returns {Promise<CheckRoll>}
	 * @protected
	 */
	async _finishCheckRoll()
	{
		const checkData = this.options.checkData,
			  actor = await fromUuid(checkData.actor),
			  action = await fromUuid(checkData.action),
			  characteristic = checkData.characteristic,
			  weapon = await fromUuid(checkData.weapon),
			  isCharacteristicMental = wfrp3e.data.actors.Actor.CHARACTERISTICS[characteristic].type === "mental";

		this.effects = foundry.utils.deepClone(action.system[checkData.face].effects);
		for(const effects of Object.values(this.effects))
			for(const effect of effects)
				effect.active = false;

		this.effects.boon.push(this.constructor.getUniversalBoonEffect(isCharacteristicMental));
		this.effects.bane.push(this.constructor.getUniversalBaneEffect(isCharacteristicMental));

		if(["melee", "ranged"].includes(action.system.type)) {
			if(weapon)
				this.effects.boon.push(this.constructor.getCriticalRatingEffect(weapon));

			this.effects.sigmarsComet.push(this.constructor.getUniversalSigmarsCometEffect());
		}

		for(const effect of actor.findTriggeredEffects(wfrp3e.data.macros.CheckRollMacro.TYPE))
			await effect.triggerMacro({actor, checkData, checkRoll: this});

		for(const effect of actor.findTriggeredEffects(wfrp3e.data.macros.ActionUsageMacro.TYPE))
			await effect.triggerMacro({action, actor, face: checkData.face});

		return this;
	}

	/**
	 * Fetches critical wounds by their uuid before returning a concatenation of their anchor links.
	 * @param {string[]} uuids A list of critical wound uuids to fetch.
	 * @returns {Promise<string>}
	 * @protected
	 */
	async _prepareCriticalWoundLinks(uuids)
	{
		let links = null;
		for(const uuid of uuids) {
			const criticalWound = await fromUuid(uuid),
				  link = criticalWound.toAnchor().outerHTML;

			links = links ? `${links}, ${link}` : link;
		}

		return links;
	}

	/**
	 * Adds a die pool to the roll, adding the new results to the existing ones.
	 * @param {DiePool} diePool The die pool to add to the roll.
	 * @param {Object} [options]
	 * @param {ChatMessage|null} [options.chatMessage] The chat message to update with the new roll.
	 * @returns {Promise<CheckRoll>} The modified roll.
	 */
	async addDiePool(diePool, {chatMessage = null} = {})
	{
		const addCheckRoll = await CheckRoll.create(diePool.formula, {}).roll(),
			  terms = foundry.utils.deepClone(this.terms);
		for(const addDiceTerm of addCheckRoll.dice) {
			const newResults = addDiceTerm.results,
				  termIndex = terms.findIndex(oldTerm => {
					  return oldTerm.constructor.name === addDiceTerm.constructor.name;
				  });

			if(termIndex !== -1) {
				newResults.unshift(...terms[termIndex].results);
				terms.splice(termIndex, 1, new addDiceTerm.constructor({number: newResults.length, results: newResults}));
			}
			else {
				if(terms.length > 0)
					terms.push(new OperatorTerm({operator: "+"}));

				terms.push(new addDiceTerm.constructor({number: newResults.length, results: newResults}));
			}
		}

		const newCheckRoll = await CheckRoll.fromTerms(terms, this.options);
		newCheckRoll.effects = this.effects;

		// If Dice So Nice! module is enabled, hide irrelevant dice from the 3D roll.
		for(const diceTerm of newCheckRoll.dice) {
			const additionalDiceAmount = diePool.dice[diceTerm.constructor.NAME];

			for(let i = 0; i < diceTerm.results.length - additionalDiceAmount; i++)
				diceTerm.results[i].hidden = true;
		}
		game.dice3d?.showForRoll(newCheckRoll);

		if(chatMessage)
			await chatMessage.update({rolls: [newCheckRoll]});

		return newCheckRoll;
	}

	/**
	 * Rerolls specific dice from a check roll.
	 * @param {string[]} diceTypes The list of dice types to reroll.
	 * @param {Object} [options]
	 * @param {ChatMessage|null} [options.chatMessage] The chat message to update with the new roll.
	 * @param {string|null} [options.flavor] Flavor text to add to the outcome description of the check.
	 * @returns {Promise<CheckRoll>} The rerolled check roll.
	 */
	async rerollDice(diceTypes, {chatMessage = null, flavor = null} = {})
	{
		const wrongType = diceTypes.find(type => typeof type !== "string");
		if(wrongType)
			throw Error(`diceTypes needs to be an array of strings. ${wrongType} found`);

		let formula = "";
		for(const type of diceTypes) {
			const denomination = Object.values(CONFIG.Dice.terms).find(term => term.NAME === type).DENOMINATION,
				  match = this.formula.match(new RegExp(`(\\d+d${denomination})`));

			if(match)
				formula = formula === "" ? match[0] : `${formula} + ${match[0]}`;
		}

		const reroll = await CheckRoll.create(formula, {}).roll(),
			  terms = foundry.utils.deepClone(this.terms);
		for(const newTerm of reroll.terms) {
			const termIndex = terms.findIndex(oldTerm => {
				return oldTerm.constructor.name === newTerm.constructor.name;
			});

			terms.splice(termIndex, 1, newTerm);
		}

		const newCheckRoll = await CheckRoll.fromTerms(terms, this.options);
		newCheckRoll.effects = this.effects;

		// If Dice So Nice! module is enabled, hide irrelevant dice from the 3D roll.
		for(const diceTerm of newCheckRoll.dice)
			if(!diceTypes.includes(diceTerm.constructor.NAME))
				for(const result of diceTerm.results)
					result.hidden = true;

		await newCheckRoll.toMessage({
			flavor: `${flavor ?? chatMessage.flavor} (${game.i18n.localize("ROLL.NAMES.reroll")})`,
			speaker: {actor: await fromUuid(this.options.checkData.actor)}
		});

		if(chatMessage && this.options.checkData) {
			this.options.checkData.disabled = true;
			await chatMessage.update({rolls: [this]});
		}

		return newCheckRoll;
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
			await this._toggleOffActionEffect(toggledEffect, checkRoll, symbol);
		else {
			try {
				const functionName = `toggleOn${capitalize(symbol)}Effect`;

				await this[`${functionName}`]
					? this[`${functionName}`](toggledEffect, checkRoll, symbol)
					: this._toggleOnActionEffect(toggledEffect, checkRoll, symbol);
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
			await this.executeActionEffectScript(toggledEffect, toggledEffect.reverseScript, checkRoll);

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

			result = this[`${functionName}`]
				? this[`${functionName}`](toggledEffect, checkRoll, symbol)
				: this.checkEffectToggleable(toggledEffect, checkRoll, symbol);
		}
		catch(error) {
			console.error(`Something went wrong when toggling the Action effect: ${error}`);
		}

		if(result === "") {
			toggledEffect.active = true;

			if(toggledEffect.immediate)
				await this.executeActionEffectScript(toggledEffect, toggledEffect.script, checkRoll);
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
		let result = this.checkSuccessEffectToggleable(toggledEffect, symbol, checkRoll);
		if(result === "") {
			for(const effect of checkRoll.effects.success)
				effect.active = false;

			toggledEffect.active = true;
			if(toggledEffect.immediate)
				await this.executeActionEffectScript(toggledEffect, toggledEffect.script, checkRoll);
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
		const symbols = wfrp3e.dice.terms.Die.SYMBOLS,
			  plural = symbols[symbol].plural;

		if(checkRoll.remainingSymbols[plural] >= toggledEffect.symbolAmount)
			return "";

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {symbol: game.i18n.localize(symbols[symbol].name)});
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
		const symbols = wfrp3e.dice.terms.Die.SYMBOLS,
			  plural = wfrp3e.dice.terms.Die.SYMBOLS[symbol].plural;

		if(checkRoll.remainingSymbols[plural] + checkRoll.remainingSymbols.sigmarsComets >= toggledEffect.symbolAmount)
			return "";

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {symbol: game.i18n.localize(symbols[symbol].name)});
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
		const symbols = wfrp3e.dice.terms.Die.SYMBOLS,
			  plural = symbols[symbol].plural;

		if(checkRoll.remainingSymbols[plural] > 0) {
			if(toggledEffect.symbolAmount > 1) {
				if(checkRoll.remainingSymbols.banes >= toggledEffect.symbolAmount - 1)
					return "";
				else
					return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
						symbol: game.i18n.localize(symbols.bane.name)
					});
			}
			else
				return "";
		}

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(symbols[symbol].name)
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
		const symbols = wfrp3e.dice.terms.Die.SYMBOLS,
			  plural = symbols[symbol].plural;

		if(checkRoll.remainingSymbols[plural] > 0) {
			if(toggledEffect.symbolAmount > 1) {
				if(checkRoll.remainingSymbols.banes >= toggledEffect.symbolAmount - 1)
					return "";
				else
					return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
						symbol: game.i18n.localize(symbols.bane.name)
					});
			}
			else
				return "";
		}

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(symbols[symbol].name)
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
		const symbols = wfrp3e.dice.terms.Die.SYMBOLS,
			  plural = symbols[symbol].plural;

		if(checkRoll.totalSymbols[plural] + checkRoll.remainingSymbols.sigmarsComets >= toggledEffect.symbolAmount)
			return "";

		return game.i18n.format("ROLL.WARNINGS.notEnoughSymbol", {
			symbol: game.i18n.localize(symbols[symbol].name)
		});
	}

	/**
	 * Uses a talent or an ability on a check roll.
	 * @param {ChatMessage} chatMessage The chat message containing the check roll.
	 */
	static async useTalentOrAbility(chatMessage)
	{
		const checkRoll = chatMessage.rolls[0],
			  checkData = checkRoll.options.checkData,
			  actor = await fromUuid(checkData.actor),
			  triggeredItems = actor.findTriggeredItems(
				  wfrp3e.data.macros.ManualPostCheckRollMacro.TYPE,
				  {actor, chatMessage, checkData, checkRoll}
			  );

		if(triggeredItems.length > 0) {
			const selectedItemUuids = await wfrp3e.applications.apps.selectors.TalentSelector.wait({items: triggeredItems});

			if(selectedItemUuids[0]) {
				const selectedTalent = await fromUuid(selectedItemUuids[0]);

				for(const effect of selectedTalent.effects)
					if(effect.system.macro.type === wfrp3e.data.macros.ManualPostCheckRollMacro.TYPE)
						await effect.triggerMacro({actor, chatMessage, checkData, checkRoll});

				await chatMessage.update({
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
	 * Triggers the toggled effects from a roll.
	 * @param {ChatMessage} chatMessage The chat message containing the roll.
	 * @returns {Promise<void>}
	 */
	static async triggerActionEffects(chatMessage)
	{
		const characteristics = wfrp3e.data.actors.Actor.CHARACTERISTICS,
			  roll = chatMessage.rolls[0],
			  checkData = roll.options.checkData,
			  actor = await fromUuid(checkData.actor),
			  targetActor = checkData.targets?.length > 0 ? await fromUuid(checkData.targets[0]) : null,
			  outcome = {
				  targetDamages: 0,
				  targetCriticalWounds: 0,
				  targetFatigue: 0,
				  targetStress: 0,
				  wounds: 0,
				  criticalWounds: 0,
				  fatigue: characteristics[checkData.characteristic].type === "physical"
					  ? roll.remainingSymbols.exertions
					  : 0,
				  stress: characteristics[checkData.characteristic].type === "mental"
					  ? roll.remainingSymbols.exertions
					  : 0,
				  favour: 0,
				  power: 0
			  },
			  actorUpdates = {system: {}},
			  targetUpdates = {system: {}},
			  chatMessageUpdates = {rolls: chatMessage.rolls};

		for(const effects of Object.values(foundry.utils.deepClone(roll.effects)))
			for(const effect of effects)
				if(effect.active)
					await this.executeActionEffectScript(
						effect,
						effect.script,
						roll,
						checkData,
						actor,
						outcome,
						targetActor
					)

		if(targetActor) {
			if(outcome.targetDamages > 0) {
				const {damages, criticalWounds} = await targetActor.sufferDamages(outcome.targetDamages, outcome.targetCriticalWounds);
				outcome.targetDamages = damages;
				outcome.targetCriticalWounds = criticalWounds;
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

			if(outcome.criticalWounds > 0) {
				const criticalWounds = await this.createEmbeddedDocuments(
					"Item",
					await this.drawCriticalWoundsRandomly(outcome.criticalWounds)
				);
				outcome.criticalWounds = criticalWounds.map(criticalWound => criticalWound.uuid);
			}

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

		if(roll.totalSymbols.successes && checkData?.action) {
			/** @type {Item} action */
			const action = await fromUuid(checkData.action);
			await action.exhaust({face: checkData.face});
		}
	}

	/**
	 * Executes the script of an action effect.
	 * @param {ActionEffect} effect The action effect which script is executed.
	 * @param {string} script The action effect script to execute.
	 * @param {CheckRoll} checkRoll The check roll with which the toggled action effect is associated.
	 * @param {CheckData} [checkData] The check data.
	 * @param {Actor} [actor] The actor performing the check.
	 * @param {CheckOutcome} [outcome] The outcome of the check.
	 * @param {Actor} [targetActor] The target of the check.
	 * @returns {Promise<void>}
	 */
	static async executeActionEffectScript(effect, script, checkRoll, checkData = null, actor = null, outcome = null, targetActor = null)
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
				outcome,
				targetActor,
				targetActor ? targetActor?.token : null
			);
		}
		catch(error) {
			ui.notifications.error(`Unable to execute the effect ${effect.description}: ${error}`);
		}
	}

	/**
	 * Searches and executes every relevant Active Effect Macros owned either by the actor performing the check, or its target.
	 * @param {Actor} actor The actor performing the check.
	 * @param {Object} checkData The check data.
	 * @param {DiePool} diePool The die pool.
	 * @returns {Promise<void>}
	 */
	static async triggerCheckPreparationEffects(actor, checkData, diePool)
	{
		for(const effect of actor.findTriggeredEffects(wfrp3e.data.macros.CheckPreparationMacro.TYPE))
			await effect.triggerMacro({actor, checkData, diePool});

		if(checkData.targets?.length > 0) {
			const actor = await fromUuid(checkData.targets[0]);
			for(const effect of actor.findTriggeredEffects(wfrp3e.data.macros.TargetingCheckPreparationMacro.TYPE))
				await effect.triggerMacro({actor, checkData, diePool});
		}
	}
}
