import CheckHelper from "./CheckHelper.js";
import WFRP3eDie from "./dice/WFRP3eDie.js";

/** @inheritDoc */
export default class WFRP3eRoll extends Roll
{
	static CHAT_TEMPLATE = "systems/wfrp3e/templates/chatmessages/roll.hbs";
	static TOOLTIP_TEMPLATE = "systems/wfrp3e/templates/chatmessages/roll-tooltip.hbs";

	constructor(formula, data= {}, options = {})
	{
		super(formula, data, options);

		this.hasSpecialDice = false;
		this.hasStandardDice = false;

		if(options.startingSymbols)
			this.resultSymbols = options.startingSymbols;
		else
			this.resultSymbols = Object.values(CONFIG.WFRP3e.symbols).reduce((object, symbol) => {
				object[symbol.plural] = 0;
				return object;
			}, {});

		if(this.options.checkData?.action) {
			const checkData = this.options.checkData;
			this.effects = {
				...Object.entries(checkData.action.system[checkData.face].effects)
					.reduce((object, effectArray) => {
						object[effectArray[0]] = effectArray[1].reduce((array, effect) => {
							effect.active = false;
							array.push(effect);
							return array;
						}, []);
						return object;
					}, {})
			};
			this.effects.boon.push(CheckHelper.getUniversalBoonEffect(CONFIG.WFRP3e.characteristics[checkData.characteristic.name].type === "mental"));
			this.effects.bane.push(CheckHelper.getUniversalBaneEffect(CONFIG.WFRP3e.characteristics[checkData.characteristic.name].type === "mental"));

			if(["melee", "ranged"].includes(checkData.action.system.type)) {
				if(checkData.weapon)
					this.effects.boon.push(CheckHelper.getCriticalRatingEffect(checkData.weapon));

				this.effects.sigmarsComet.push(CheckHelper.getUniversalSigmarsCometEffect());
			}
		}
	}

	/** @inheritDoc */
	async _evaluate({minimize = false, maximize = false} = {})
	{
		// Step 1 - Replace intermediate terms with evaluated numbers
		const intermediate = [];
		for(let term of this.terms) {
			if(!(term instanceof RollTerm))
				throw new Error("Roll evaluation encountered an invalid term which was not a RollTerm instance");

			if(term instanceof WFRP3eDie)
				this.hasSpecialDice = true;
			else if(term instanceof DiceTerm)
				this.hasStandardDice = true;

			if(term.isIntermediate) {
				await term.evaluate({minimize, maximize, async: true});
				this._dice = this._dice.concat(term.dice);
				term = new NumericTerm({number: term.total, options: term.options});
			}

			intermediate.push(term);
		}
		this.terms = intermediate;

		// Step 2 - Simplify remaining terms
		this.terms = this.constructor.simplifyTerms(this.terms);

		// Step 3 - Evaluate remaining terms
		for(const term of this.terms)
			if(!term._evaluated)
				await term.evaluate({minimize, maximize, async: true});

		// Step 4 - Retrieve all FFG results and combine into a single total.
		if(this.hasSpecialDice) {
			this.terms.forEach((term) => {
				if(term instanceof WFRP3eDie) {
					Object.keys(this.resultSymbols).forEach((symbolPlural) => {
						this.resultSymbols[symbolPlural] += parseInt(term.resultSymbols[symbolPlural]);

						if(symbolPlural === "successes")
							this.resultSymbols[symbolPlural] += parseInt(term.resultSymbols.righteousSuccesses);
					});
				}
			});

			// Step 5 - Calculate actual results by cancelling out successes with challenges, boons with banes, etc.
			if(this.resultSymbols.successes < this.resultSymbols.challenges) {
				this.resultSymbols.challenges -= parseInt(this.resultSymbols.successes);
				this.resultSymbols.successes = 0;
			}
			else {
				this.resultSymbols.successes -= parseInt(this.resultSymbols.challenges);
				this.resultSymbols.challenges = 0;
			}

			if(this.resultSymbols.boons < this.resultSymbols.banes) {
				this.resultSymbols.banes -= parseInt(this.resultSymbols.boons);
				this.resultSymbols.boons = 0;
			}
			else {
				this.resultSymbols.boons -= parseInt(this.resultSymbols.banes);
				this.resultSymbols.banes = 0;
			}
		}

		this.remainingSymbols = this.resultSymbols;

		if(this.resultSymbols.successes && this.options.checkData?.action)
			this.options.checkData.action.exhaustAction(this.options.checkData.face);

		// Step 6 - Evaluate the final expression
		this._total = this._evaluateTotal();

		return this;
	}

	/** @inheritDoc */
	_evaluateSync({minimize = false, maximize = false} = {})
	{
		// Step 1 - Replace intermediate terms with evaluated numbers
		this.terms = this.terms.map(term => {
			if(!(term instanceof RollTerm))
				throw new Error("Roll evaluation encountered an invalid term which was not a RollTerm instance");

			if(term instanceof WFRP3eDie)
				this.hasSpecialDice = true;
			else if(term instanceof DiceTerm)
				this.hasStandardDice = true;

			if(term.isIntermediate) {
				term.evaluate({minimize, maximize, async: false});
				this._dice = this._dice.concat(term.dice);
				return new NumericTerm({number: term.total, options: term.options});
			}

			return term;
		});

		// Step 2 - Simplify remaining terms
		this.terms = this.constructor.simplifyTerms(this.terms);

		// Step 3 - Evaluate remaining terms
		for(const term of this.terms)
			if(!term._evaluated)
				term.evaluate({minimize, maximize, async: false});

		// Step 4 - Retrieve all FFG results and combine into a single total.
		if(this.hasSpecialDice) {
			this.terms.forEach((term) => {
				if(term instanceof WFRP3eDie) {
					Object.keys(this.resultSymbols).forEach((symbolPlural) => {
						this.resultSymbols[symbolPlural] += parseInt(term.resultSymbols[symbolPlural]);

						if(symbolPlural === "successes")
							this.resultSymbols[symbolPlural] += parseInt(term.resultSymbols.righteousSuccesses);
					});
				}
			});

			// Step 5 - Calculate actual results by cancelling out successes with challenges, boons with banes, etc.
			if(this.resultSymbols.successes < this.resultSymbols.challenges) {
				this.resultSymbols.challenges -= parseInt(this.resultSymbols.successes);
				this.resultSymbols.successes = 0;
			}
			else {
				this.resultSymbols.successes -= parseInt(this.resultSymbols.challenges);
				this.resultSymbols.challenges = 0;
			}

			if(this.resultSymbols.boons < this.resultSymbols.banes) {
				this.resultSymbols.banes -= parseInt(this.resultSymbols.boons);
				this.resultSymbols.boons = 0;
			}
			else {
				this.resultSymbols.boons -= parseInt(this.resultSymbols.banes);
				this.resultSymbols.banes = 0;
			}
		}

		this.remainingSymbols = this.resultSymbols;

		if(this.resultSymbols.successes && this.options.checkData?.action)
			this.action.exhaustAction(this.options.checkData.face);

		// Step 6 - Evaluate the final expression
		this._total = this._evaluateTotal();

		return this;
	}

	/** @inheritDoc */
	_evaluateTotal() {
		const expression = this.terms.map(term => term instanceof WFRP3eDie ? 0 : term.total).join(" ");
		const total = this.constructor.safeEval(expression);

		if(!Number.isNumeric(total)) {
			throw new Error(game.i18n.format("DICE.ErrorNonNumeric", {formula: this.formula}));
		}

		return total;
	}

	/** @inheritDoc */
	async render({flavor, template = this.constructor.CHAT_TEMPLATE, isPrivate = false} = {})
	{
		if(!this._evaluated)
			await this.evaluate({async: true});

		const checkData = this.options?.checkData;

		const chatData = {
			formula: isPrivate ? "???" : this._formula,
			flavor: isPrivate ? null : flavor,
			user: game.user.id,
			tooltip: isPrivate ? "" : await this.getTooltip(),
			total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
			effects: this.effects,
			hasSpecialDice: this.hasSpecialDice,
			hasStandardDice: this.hasStandardDice,
			publicRoll: !isPrivate,
			remainingSymbols: isPrivate ? {} : this.remainingSymbols,
			resultSymbols: isPrivate ? {} : this.resultSymbols,
			specialDieResultLabels: isPrivate ? {} : this.dice.filter(die => die instanceof WFRP3eDie)
				.reduce((resultLabels, die) => {
					die.results.forEach(result => resultLabels.push(die.getResultLabel(result)));
					return resultLabels;
				}, []),
			symbols: CONFIG.WFRP3e.symbols,
		};

		if(checkData) {
			const actor = checkData.actor.actorId
					? game.actors.get(checkData.actor.actorId)
					: game.scenes.get(checkData.actor.sceneId).collections.tokens.get(checkData.actor.tokenId).actor;

			foundry.utils.mergeObject(chatData, {
				action: checkData.action,
				actorName: actor.token ? actor.token.name : actor.prototypeToken.name,
				face: checkData.face,
				outcome: checkData.outcome
			});

			if(checkData.outcome?.criticalWounds && Array.isArray(checkData.outcome.criticalWounds))
				chatData.criticalWoundLinks = checkData.outcome?.criticalWounds?.reduce((names, criticalWound) => {
					const criticalWoundLink = actor.items.get(criticalWound._id).toAnchor().outerHTML;
					names = names === "" ? criticalWoundLink : names + `, ${criticalWoundLink}`;
					return names;
				}, "")

			if(checkData.targets && checkData.targets.length > 0) {
				const targetActor = game.scenes.get(checkData.targets[0].sceneId)
					.collections.tokens.get(checkData.targets[0].tokenId).actor;

				chatData.targetActorName = targetActor.token ? targetActor.token.name : targetActor.prototypeToken.name;

				if(checkData.outcome?.targetCriticalWounds && Array.isArray(checkData.outcome.targetCriticalWounds))
					chatData.targetCriticalWoundLinks = checkData.outcome?.targetCriticalWounds?.reduce((names, criticalWound) => {
						const criticalWoundLink = targetActor.items.get(criticalWound._id).toAnchor().outerHTML;
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
		return foundry.utils.mergeObject(super.toJSON(), {
			effects: this.effects,
			hasSpecialDice: this.hasSpecialDice,
			hasStandardDice: this.hasStandardDice,
			remainingSymbols: this.remainingSymbols,
			resultSymbols: this.resultSymbols
		});
	}

	/** @inheritDoc */
	static fromData(data)
	{
		return foundry.utils.mergeObject(super.fromData(data), {
			effects: data.effects,
			hasSpecialDice: data.hasSpecialDice,
			hasStandardDice: data.hasStandardDice,
			remainingSymbols: data.remainingSymbols,
			resultSymbols: data.resultSymbols
		});
	}
}