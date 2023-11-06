import CheckHelper from "./CheckHelper.js";

/** @inheritDoc */
export default class WFRP3eRoll extends Roll
{
	static CHAT_TEMPLATE = "systems/wfrp3e/templates/chatmessages/roll.hbs";
	static TOOLTIP_TEMPLATE = "systems/wfrp3e/templates/chatmessages/roll-tooltip.hbs";

	/**
	 * @param {string} formula
	 * @param {DicePool} dicePool
	 * @param {Object} [options]
	 */
	constructor(formula, dicePool, options = {})
	{
		super(formula);

		this.symbols = {
			...Object.values(CONFIG.WFRP3e.symbols).reduce((object, symbol) => {
				object[symbol.plural] = isNaN(dicePool[symbol.plural]) ? 0 : +dicePool[symbol.plural];
				return object;
			}, {})
		};

		this.hasSpecialDice = false;
		this.hasStandardDice = false;
		this.addedResults = [];
		this.data.symbols = CONFIG.WFRP3e.symbols;

		if(options.data) {
			this.data = mergeObject(this.data, options.data);

			if(this.data.action) {
				this.data.effects = {
					...Object.entries(this.data.action.system[this.data.face].effects).reduce((object, effectArray) => {
						object[effectArray[0]] = effectArray[1].reduce((array, effect) => {
							effect.active = false;
							array.push(effect);
							return array;
						}, []);

						return object;
					}, {})
				};
				this.data.effects.boon.push(CheckHelper.getUniversalBoonEffect(CONFIG.WFRP3e.characteristics[this.data.characteristic].type === "mental"));
				this.data.effects.bane.push(CheckHelper.getUniversalBaneEffect(CONFIG.WFRP3e.characteristics[this.data.characteristic].type === "mental"));

				if(["melee", "ranged"].includes(this.data.action.system[this.data.face].type))
					this.data.effects.sigmarsComet.push(CheckHelper.getUniversalSigmarsCometEffect());
			}
		}

		if(Object.hasOwn(options, 'flavor'))
			this.flavor = options.flavor;
	}

	/** @inheritDoc */
	evaluate({minimize = false, maximize = false} = {})
	{
		if(this._evaluated)
			throw new Error("This Roll object has already been rolled.");

		// Step 1 - evaluate any inner Rolls and recompile the formula
		let hasInner = false;

		this.terms = this.terms.map((term) => {
			if(term instanceof WFRP3eRoll) {
				hasInner = true;
				term.evaluate({minimize, maximize});
				this._dice = this._dice.concat(term.dice);
				return `${term.total}`;
			}

			return term;
		});

		// Step 2 - if inner rolls occurred, re-compile the formula and re-identify terms
		if(hasInner) {
			const formula = this.constructor.cleanFormula(this.terms);
			this.terms = this._identifyTerms(formula);
		}

		// Step 3 - evaluate any remaining terms and return any non-special dialogs to the total.
		this.results = this.terms.map((term) => {
			if(game.symbols.diceterms.includes(term.constructor)) {
				if(term.evaluate)
					term.evaluate({minimize, maximize});

				this.hasSpecialDice = true;

				return 0;
			}
			else {
				if(term.evaluate) {
					if(!(term instanceof OperatorTerm))
						this.hasStandardDice = true;

					return term.evaluate({minimize, maximize}).total;
				}
				else
					return term;
			}
		});

		// Step 4 - safely evaluate the final total
		const total = Roll.safeEval(this.results.join(" "));

		if(!Number.isNumeric(total))
			throw new Error(game.i18n.format("DICE.ErrorNonNumeric", {formula: this.formula}));

		// Step 5 - Retrieve all FFG results and combine into a single total.
		if(this.hasSpecialDice) {
			this.terms.forEach((term) => {
				if(game.symbols.diceterms.includes(term.constructor)) {
					Object.values(CONFIG.WFRP3e.symbols).forEach((symbol) => {
						this.symbols[symbol.plural] += parseInt(term.symbols[symbol.plural]);

						if(symbol.plural === "successes")
							this.symbols[symbol.plural] += parseInt(term.symbols.righteousSuccesses);
					});
				}
			});

			// Step 6 - Calculate actual results by cancelling out successes with challenges, boons with banes, etc.
			if(this.symbols.successes < this.symbols.challenges) {
				this.symbols.challenges -= parseInt(this.symbols.successes);
				this.symbols.successes = 0;
			}
			else {
				this.symbols.successes -= parseInt(this.symbols.challenges);
				this.symbols.challenges = 0;
			}

			if(this.symbols.boons < this.symbols.banes) {
				this.symbols.banes -= parseInt(this.symbols.boons);
				this.symbols.boons = 0;
			}
			else {
				this.symbols.boons -= parseInt(this.symbols.banes);
				this.symbols.banes = 0;
			}
		}

		// Store final outputs
		this._total = total;
		this._evaluated = true;

		this.data.remainingSymbols = this.symbols;

		if(this.symbols.successes && this.data?.action)
			this.data.action.exhaustAction(this.data.face);

		return this;
	}

	/** @inheritDoc */
	roll()
	{
		return this.evaluate();
	}

	/** @inheritDoc */
	getTooltip()
	{
		const parts = this.dice.map((die) => {
			const cls = die.constructor;
			let isSpecial = "notSpecial";

			if(game.symbols.diceterms.includes(cls))
				isSpecial = "isSpecial";

			let countText = game.i18n.format("ROLL.AMOUNT." + cls.name, {nb: die.results.length});

			if(die.results.length > die.number)
				countText += " " + game.i18n.format("ROLL.AMOUNT.ExplodedDie", {nb: die.results.length - die.number});

			return {
				formula: die.formula,
				total: die.total,
				faces: die.faces,
				flavor: die.options.flavor,
				countText: countText,
				isSpecial: game.symbols.diceterms.includes(cls),
				notSpecial: !game.symbols.diceterms.includes(cls),
				rolls: die.results.map((roll) => {
					return {
						result: die.getResultLabel(roll),
						classes: [cls.name.toLowerCase(), isSpecial, "d" + die.faces, roll.rerolled ? "rerolled" : null, roll.exploded ? "exploded" : null, roll.discarded ? "discarded" : null].filterJoin(" ")
					};
				})
			};
		});

		parts.addedResults = this.addedResults;
		parts.flavor = this.flavor;

		return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, {parts});
	}

	/** @inheritDoc */
	async render(chatOptions = {})
	{
		chatOptions = mergeObject({
			user: game.user.id,
			flavor: null,
			template: this.constructor.CHAT_TEMPLATE,
			blind: false,
		}, chatOptions);

		const isPrivate = chatOptions.isPrivate;

		// Execute the roll, if needed
		if(!this._evaluated)
			this.roll();

		// Define chat data
		if(this.data) {
			this.data.additionalFlavorText = this.flavor;
			this.data.symbols = CONFIG.WFRP3e.symbols;
		}
		else
			this.data = {
			additionalFlavorText: this.flavor,
			symbols: CONFIG.WFRP3e.symbols
		};

		const chatData = {
			formula: isPrivate ? "???" : this._formula,
			flavor: isPrivate ? null : chatOptions.flavor,
			user: chatOptions.user,
			tooltip: isPrivate ? "" : await this.getTooltip(),
			total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
			symbols: isPrivate ? {} : this.symbols,
			specialDice: isPrivate ? {} : this.dice.map((die) => {
				const cls = die.constructor;

				return {
					isSpecialDie: game.symbols.diceterms.includes(cls),
					rolls: die.results.map((roll) => {return {result: die.getResultLabel(roll)};})
				};
			}),
			hasSpecialDice: this.hasSpecialDice,
			hasStandardDice: this.hasStandardDice,
			hasSuccess: this.dice.length > 0,
			data: this.data,
			addedResults: this.addedResults,
			publicRoll: !chatOptions.isPrivate,
		};

		// Render the roll display template
		return renderTemplate(chatOptions.template, chatData);
	}

	/** @inheritDoc */
	toMessage(messageData = {}, {rollMode = null, create = true} = {})
	{
		// Perform the roll, if it has not yet been rolled
		if(!this._evaluated)
			this.evaluate();

		const rMode = rollMode || messageData.rollMode || game.settings.get("core", "rollMode");
		const template = CONST.CHAT_MESSAGE_TYPES.ROLL;

		if(["gmroll", "blindroll"].includes(rMode))
			messageData.whisper = ChatMessage.getWhisperRecipients("GM");
		if(rMode === "blindroll")
			messageData.blind = true;
		if(rMode === "selfroll")
			messageData.whisper = [game.user.id];

		// Prepare chat data
		messageData = mergeObject({
			user: game.user.id,
			type: template,
			content: this.total
		}, messageData, messageData.data);

		messageData.roll = this;

		Hooks.call("specialDiceMessage", this);

		const message = new ChatMessage(messageData);

		if(rMode)
			message.applyRollMode(rollMode);

		// Either create or return the data
		return create ? ChatMessage.create(message) : message;
	}

	/** @inheritDoc */
	toJSON()
	{
		const json = super.toJSON();

		json.symbols = this.symbols;
		json.hasSpecialDice = this.hasSpecialDice;
		json.hasStandardDice = this.hasStandardDice;
		json.data = this.data;
		json.addedResults = this.addedResults;
		json.flavor = this.flavor;

		return json;
	}

	/** @inheritDoc */
	static fromData(data)
	{
		const roll = super.fromData(data);

		roll.symbols = data.symbols;
		roll.hasSpecialDice = data.hasSpecialDice;
		roll.hasStandardDice = data.hasStandardDice;
		roll.data = data.data;
		roll.addedResults = data.addedResults;
		roll.flavor = data.flavor;

		return roll;
	}
}