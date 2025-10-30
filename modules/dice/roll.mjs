/** @inheritDoc */
export default class CheckRoll extends foundry.dice.Roll
{
	static CHAT_TEMPLATE = "systems/wfrp3e/templates/dice/roll.hbs";
	static TOOLTIP_TEMPLATE = "systems/wfrp3e/templates/dice/tooltip.hbs";

	get resultSymbols()
	{
		const resultSymbols = {};
		for(const [key, symbol] of Object.entries(CONFIG.WFRP3e.symbols))
			if(key !== "righteousSuccess")
				resultSymbols[symbol.plural] = 0;

		this.terms.filter(term => term instanceof wfrp3e.dice.terms.Die).forEach(term => {
			term.results.forEach(result => {
				Object.keys(resultSymbols).forEach(symbolName => {
					resultSymbols[symbolName] += parseInt(result.symbols[symbolName]);
				});

				resultSymbols.successes += parseInt(result.symbols.righteousSuccesses);
			});
		});

		return resultSymbols;
	}

	get totalSymbols()
	{
		const totalSymbols = this.resultSymbols;

		if(this.options.startingSymbols)
			for(const key of Object.keys(totalSymbols))
				totalSymbols[key] += this.options.startingSymbols[key];

		if(totalSymbols.successes < totalSymbols.challenges) {
			totalSymbols.challenges -= totalSymbols.successes < 0 ? 0 : parseInt(totalSymbols.successes);
			totalSymbols.successes = 0;
		}
		else {
			totalSymbols.successes -= totalSymbols.challenges < 0 ? 0 : parseInt(totalSymbols.challenges);
			totalSymbols.challenges = 0;
		}

		if(totalSymbols.boons < totalSymbols.banes) {
			totalSymbols.banes -= totalSymbols.boons < 0 ? 0 : parseInt(totalSymbols.boons);
			totalSymbols.boons = 0;
		}
		else {
			totalSymbols.boons -= totalSymbols.banes < 0 ? 0 : parseInt(totalSymbols.banes);
			totalSymbols.banes = 0;
		}

		return totalSymbols;
	}

	get remainingSymbols()
	{
		const remainingSymbols = {...this.totalSymbols};

		if(this.effects) {
			Object.entries(this.effects).forEach(([symbolName, effects]) => {
				const plural = CONFIG.WFRP3e.symbols[symbolName].plural,
					  activeActionEffects = effects.filter(effect => effect.active);

				for(const effect of activeActionEffects) {
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

						throw new Error(`The remaining number of ${symbolName} cannot be negative.`);
					}
					else
						remainingSymbols[plural] -= effect.symbolAmount;
				}
			});
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
			return this._prepareEffects();

		return this;
	}

	/** @inheritDoc */
	async _prepareChatRenderContext({flavor, isPrivate = false, ...options} = {})
	{
		const {Die} = wfrp3e.dice.terms.Die,
			  checkData = this.options.checkData,
			  specialDieResultLabels = [];

		if(!isPrivate)
			for(const die of this.dice)
				if(die instanceof Die)
					die.results.forEach(result => specialDieResultLabels.push(die.getResultLabel(result)));

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
			symbols: CONFIG.WFRP3e.symbols
		};

		if(checkData) {
			const actor = await fromUuid(checkData.actor);
			foundry.utils.mergeObject(context, {
				actorName: actor.token ? actor.token.name : actor.prototypeToken.name,
				outcome: checkData.outcome
			});

			if(checkData.disabled)
				context.disabled = checkData.disabled;

			if(checkData.action)
				foundry.utils.mergeObject(context, {
					action: await fromUuid(checkData.action),
					effects: this.effects,
					face: checkData.face
				});

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
		return foundry.utils.mergeObject(super.toJSON(), {effects: this.effects});
	}

	/** @inheritDoc */
	static fromData(data)
	{
		return foundry.utils.mergeObject(super.fromData(data), {effects: data.effects});
	}

	/**
	 * Prepares all the effects of the check.
	 * @returns {Promise<CheckRoll>}
	 * @private
	 */
	async _prepareEffects()
	{
		const {CheckHelper} = wfrp3e.dice,
			  checkData = this.options.checkData,
			  actor = await fromUuid(checkData.actor),
			  action = await fromUuid(checkData.action),
			  characteristic = checkData.characteristic,
			  weapon = await fromUuid(checkData.weapon),
			  isCharacteristicMental = CONFIG.WFRP3e.characteristics[characteristic].type === "mental";

		this.effects = foundry.utils.deepClone(action.system[checkData.face].effects);
		for(const effects of Object.values(this.effects))
			for(const effect of effects)
				effect.active = false;

		this.effects.boon.push(CheckHelper.getUniversalBoonEffect(isCharacteristicMental));
		this.effects.bane.push(CheckHelper.getUniversalBaneEffect(isCharacteristicMental));

		if(["melee", "ranged"].includes(action.system.type)) {
			if(weapon)
				this.effects.boon.push(CheckHelper.getCriticalRatingEffect(weapon));

			this.effects.sigmarsComet.push(CheckHelper.getUniversalSigmarsCometEffect());
		}

		await CheckRoll.triggerOnCheckRollEffects(actor, checkData, this);

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
		game.dice3d.showForRoll(newCheckRoll);

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
			flavor: flavor ? `${options.flavor} (${game.i18n.localize("ROLL.NAMES.reroll")})` : flavor,
			speaker: {actor: await fromUuid(this.options.checkData.actor)}
		});

		if(chatMessage && this.options.checkData) {
			this.options.checkData.disabled = true;
			await chatMessage.update({rolls: [this]});
		}

		return newCheckRoll;
	}

	/**
	 * Searches and triggers every effect that are supposed to be triggered on a check roll and that belong to an item
	 * owned by the actor.
	 * @param {Actor} actor The actor performing the check.
	 * @param {Object} checkData The check data.
	 * @param {CheckRoll} checkRoll The check roll.
	 * @returns {Promise<void>}
	 */
	static async triggerOnCheckRollEffects(actor, checkData, checkRoll)
	{
		for(const effect of actor.findTriggeredEffects("onCheckRoll"))
			await effect.triggerEffect({
				parameters: [actor, checkData, checkRoll],
				parameterNames: ["actor", "checkData", "checkRoll"]
			});
	}
}
