import CheckHelper from "./CheckHelper.js";
import WFRP3eDie from "./dice/WFRP3eDie.js";

/** @inheritDoc */
export default class WFRP3eRoll extends Roll
{
	static CHAT_TEMPLATE = "systems/wfrp3e/templates/chatmessages/roll.hbs";
	static TOOLTIP_TEMPLATE = "systems/wfrp3e/templates/chatmessages/roll-tooltip.hbs";

	get resultSymbols()
	{
		const resultSymbols = Object.entries(CONFIG.WFRP3e.symbols).reduce((object, [key, value]) => {
			if(key !== "righteousSuccess")
				object[value.plural] = 0;

			return object;
		}, {});

		this.terms.filter(term => term instanceof WFRP3eDie).forEach(term => {
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
			totalSymbols.challenges -= parseInt(totalSymbols.successes);
			totalSymbols.successes = 0;
		}
		else {
			totalSymbols.successes -= parseInt(totalSymbols.challenges);
			totalSymbols.challenges = 0;
		}

		if(totalSymbols.boons < totalSymbols.banes) {
			totalSymbols.banes -= parseInt(totalSymbols.boons);
			totalSymbols.boons = 0;
		}
		else {
			totalSymbols.boons -= parseInt(totalSymbols.banes);
			totalSymbols.banes = 0;
		}

		return totalSymbols;
	}

	get remainingSymbols()
	{
		const totalSymbols = {...this.totalSymbols};

		if(this.effects)
			Object.entries(this.effects).forEach(([symbolName, effects]) => {
				const plural = CONFIG.WFRP3e.symbols[symbolName].plural;

				totalSymbols[plural] = effects.filter(effect => effect.active).reduce((remainingSymbols, effect) => {
					if(["delay", "exertion"].includes(symbolName)) {
						remainingSymbols--;

						if(effect.symbolAmount > 1)
							totalSymbols.banes -= effect.symbolAmount - 1;
					}
					else if(remainingSymbols < effect.symbolAmount) {
						if(["success", "boon"].includes(symbolName)
							&& (remainingSymbols + totalSymbols.sigmarsComets >= effect.symbolAmount)) {
							totalSymbols.sigmarsComets += remainingSymbols - effect.symbolAmount;
							return 0;
						}

						throw new Error(`The remaining number of ${symbolName} cannot be negative.`);
					}
					else
						remainingSymbols -= effect.symbolAmount;

					return remainingSymbols;
				}, totalSymbols[plural]);
			});

		return totalSymbols;
	}

	/** @inheritDoc */
	async evaluate({minimize  = false, maximize = false, allowStrings = false, allowInteractive = true, ...options} = {})
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

		if(this.options.checkData.action)
			return this._prepareEffects();

		return this;
	}

	/** @inheritDoc */
	async render({flavor, template = this.constructor.CHAT_TEMPLATE, isPrivate = false} = {})
	{
		if(!this._evaluated)
			await this.evaluate({allowInteractive: !isPrivate});

		const chatData = {
			formula: isPrivate ? "???" : this._formula,
			flavor: isPrivate ? null : flavor ?? this.options.flavor,
			user: game.user.id,
			tooltip: isPrivate ? "" : await this.getTooltip(),
			total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
			totalSymbols: this.totalSymbols,
			hasSpecialDice: !!this.terms.find(term => term instanceof WFRP3eDie),
			hasStandardDice: !!this.terms.find(term => !(term instanceof WFRP3eDie) && term instanceof foundry.dice.terms.DiceTerm),
			publicRoll: !isPrivate,
			remainingSymbols: isPrivate ? {} : this.remainingSymbols,
			specialDieResultLabels: isPrivate
				? {}
				: this.dice.filter(die => die instanceof WFRP3eDie).reduce((resultLabels, die) => {
					die.results.forEach(result => resultLabels.push(die.getResultLabel(result)));
					return resultLabels;
				}, []),
			symbols: CONFIG.WFRP3e.symbols
		};

		const checkData = this.options.checkData;
		if(checkData) {
			const actor = await fromUuid(checkData.actor);
			foundry.utils.mergeObject(chatData, {
				actorName: actor.token ? actor.token.name : actor.prototypeToken.name,
				outcome: checkData.outcome
			});

			if(checkData.action)
				foundry.utils.mergeObject(chatData, {
					action: checkData.action,
					effects: this.effects,
					face: checkData.face
				});

			if(checkData.outcome?.criticalWounds && Array.isArray(checkData.outcome.criticalWounds))
				chatData.criticalWoundLinks = checkData.outcome.criticalWounds.reduce(async (names, criticalWound) => {
					const criticalWoundLink = await fromUuid(criticalWound).toAnchor().outerHTML;
					names = names === "" ? criticalWoundLink : names + `, ${criticalWoundLink}`;
					return names;
				}, "")

			if(checkData.targets && checkData.targets.length > 0) {
				const targetActor = await fromUuid(checkData.targets[0]);
				chatData.targetActorName = targetActor.token ? targetActor.token.name : targetActor.prototypeToken.name;

				if(checkData.outcome?.targetCriticalWounds && Array.isArray(checkData.outcome.targetCriticalWounds))
					chatData.targetCriticalWoundLinks = checkData.outcome.targetCriticalWounds?.reduce(async (names, criticalWound) => {
						const criticalWoundLink = await fromUuid(criticalWound._id).toAnchor().outerHTML;
						names = names === "" ? criticalWoundLink : names + `, ${criticalWoundLink}`;
						return names;
					}, "");
			}
		}

		return renderTemplate(template, chatData);
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
	 * @returns {Promise<WFRP3eRoll>}
	 * @private
	 */
	async _prepareEffects()
	{
		const checkData = this.options.checkData,
			  {action, characteristic, weapon} = checkData,
			  actor = await fromUuid(checkData.actor);

		this.effects = {
			...Object.entries(action.system[checkData.face].effects)
				.reduce((allEffects, [symbol, effects]) => {
					effects.map((effect) => effect.active = false);
					allEffects[symbol] = effects;
					return allEffects;
				}, {})
		};
		this.effects.boon.push(CheckHelper.getUniversalBoonEffect(
			CONFIG.WFRP3e.characteristics[characteristic.name].type === "mental")
		);
		this.effects.bane.push(CheckHelper.getUniversalBaneEffect(
			CONFIG.WFRP3e.characteristics[characteristic.name].type === "mental")
		);

		if(["melee", "ranged"].includes(action.system.type)) {
			if(weapon)
				this.effects.boon.push(CheckHelper.getCriticalRatingEffect(weapon));

			this.effects.sigmarsComet.push(CheckHelper.getUniversalSigmarsCometEffect());
		}

		await WFRP3eRoll.triggerOnCheckRollEffects(actor, checkData, this);

		return this;
	}

	/**
	 * Searches and triggers every effect that are supposed to be triggered on a check roll and that belong to an Item owned by the Actor.
	 * @param {WFRP3eActor} actor The WFRP3eActor performing the check.
	 * @param {Object} checkData The check data.
	 * @param {WFRP3eRoll} roll The check roll.
	 * @returns {Promise<void>}
	 */
	static async triggerOnCheckRollEffects(actor, checkData, roll)
	{
		const triggeredItems = actor.findTriggeredItems("onCheckRoll");
		for(const item of triggeredItems) {
			try {
				const fn = new foundry.utils.AsyncFunction(
					"actor",
					"checkData",
					"roll",
					item.system.effect.script
				);
				await fn.call(item, actor, checkData, roll);
			}
			catch(error) {
				console.error(error);
			}
		}
	}
}