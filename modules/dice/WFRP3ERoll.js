import PopoutEditor from "../PopoutEditor.js";

/**
 * New extension of the core DicePool class for evaluating rolls with the WFRP3E's DiceTerms
 */
export default class WFRP3ERoll extends Roll
{
	/**
	 * @param {string} formula
	 * @param {DicePool} dicePool
	 * @param {Object} [options]
	 */
	constructor(formula, dicePool, options = {})
	{
		super(formula);

		this.symbols = {successes: 0, righteousSuccesses: 0, challenges: 0, boons: 0, banes: 0, delays: 0, exertions: 0, sigmarsComets: 0, chaosStars: 0};
		this.hasSpecialDice = false;
		this.hasStandardDice = false;
		this.addedResults = [];

		this.terms = this.parseShortHand(this.terms);

		if(dicePool.successes)
		{
			this.symbols.successes = +dicePool.successes;
			this.addedResults.push(
			{
				type: "Successes",
				symbol: PopoutEditor.renderDiceImages("[SU]"),
				value: Math.abs(+dicePool.successes),
				negative: +dicePool.successes < 0,
			});
		}

		if(dicePool.righteousSuccesses)
		{
			this.symbols.righteousSuccesses = +dicePool.righteousSuccesses;
			this.addedResults.push(
			{
				type: "Righteous Successes",
				symbol: PopoutEditor.renderDiceImages("[RI]"),
				value: Math.abs(+dicePool.righteousSuccesses),
				negative: +dicePool.righteousSuccesses < 0,
			});
		}

		if(dicePool.challenges)
		{
			this.symbols.challenges = +dicePool.challenges;
			this.addedResults.push(
			{
				type: "Challenges",
				symbol: PopoutEditor.renderDiceImages("[CHAL]"),
				value: Math.abs(+dicePool.challenges),
				negative: +dicePool.challenges < 0,
			});
		}

		if(dicePool.boons)
		{
			this.symbols.boons = +dicePool.boons;
			this.addedResults.push(
			{
				type: "Boons",
				symbol: PopoutEditor.renderDiceImages("[BO]"),
				value: Math.abs(+dicePool.boons),
				negative: +dicePool.boons < 0,
			});
		}

		if(dicePool.banes)
		{
			this.symbols.banes = +dicePool.banes;
			this.addedResults.push(
			{
				type: "Banes",
				symbol: PopoutEditor.renderDiceImages("[BA]"),
				value: Math.abs(+dicePool.banes),
				negative: +dicePool.banes < 0,
			});
		}

		if(dicePool.delays)
		{
			this.symbols.delays = +dicePool.delays;
			this.addedResults.push(
			{
				type: "Delays",
				symbol: PopoutEditor.renderDiceImages("[DE]"),
				value: Math.abs(+dicePool.delays),
				negative: +dicePool.delays < 0,
			});
		}

		if(dicePool.exertions)
		{
			this.symbols.exertions = +dicePool.exertions;
			this.addedResults.push(
			{
				type: "Exertions",
				symbol: PopoutEditor.renderDiceImages("[EXE]"),
				value: Math.abs(+dicePool.exertions),
				negative: +dicePool.exertions < 0,
			});
		}

		if(dicePool.sigmarsComets)
		{
			this.symbols.sigmarsComets = +dicePool.sigmarsComets;
			this.addedResults.push(
			{
				type: "Sigmar's Comets",
				symbol: PopoutEditor.renderDiceImages("[SI]"),
				value: Math.abs(+dicePool.sigmarsComets),
				negative: +dicePool.sigmarsComets < 0,
			});
		}

		if(dicePool.chaosStars)
		{
			this.symbols.chaosStars = +dicePool.chaosStars;
			this.addedResults.push(
			{
				type: "Chaos Stars",
				symbol: PopoutEditor.renderDiceImages("[CHAO]"),
				value: Math.abs(+dicePool.chaosStars),
				negative: +dicePool.chaosStars < 0,
			});
		}

		if(Object.hasOwn(options, 'flavor'))
			this.flavor = options.flavor;
	}

	static CHAT_TEMPLATE = "systems/wfrp3e/templates/chatmessages/roll-chatmessage.html";
	static TOOLTIP_TEMPLATE = "systems/wfrp3e/templates/chatmessages/roll-tooltip-chatmessage.html";

	/** @override */
	evaluate({minimize = false, maximize = false} = {})
	{
		if(this._evaluated) throw new Error("This Roll object has already been rolled.");

		// Step 1 - evaluate any inner Rolls and recompile the formula
		let hasInner = false;

		this.terms = this.terms.map((term) =>
		{
			if(term instanceof WFRP3ERoll)
			{
				hasInner = true;
				term.evaluate({minimize, maximize});
				this._dice = this._dice.concat(term.dice);
				return `${term.total}`;
			}

			return term;
		});

		// Step 2 - if inner rolls occurred, re-compile the formula and re-identify terms
		if(hasInner)
		{
			const formula = this.constructor.cleanFormula(this.terms);
			this.terms = this._identifyTerms(formula);
		}

		// Step 3 - evaluate any remaining terms and return any non-FFG dialogs to the total.
		this.results = this.terms.map((term) =>
		{
			if(!game.symbols.diceterms.includes(term.constructor))
			{
				if(term.evaluate)
				{
					if(!(term instanceof OperatorTerm))
						this.hasStandardDice = true;

					return term.evaluate({minimize, maximize}).total;
				}
				else
					return term;
			}
			else
			{
				if(term.evaluate)
					term.evaluate({minimize, maximize});

				this.hasSpecialDice = true;

				return 0;
			}
		});

		// Step 4 - safely evaluate the final total
		const total = Roll.safeEval(this.results.join(" "));

		if(!Number.isNumeric(total))
			throw new Error(game.i18n.format("DICE.ErrorNonNumeric", {formula: this.formula}));

		// Step 5 - Retrieve all FFG results and combine into a single total.
		if(this.hasSpecialDice)
		{
			this.terms.forEach((term) =>
			{
				if(game.symbols.diceterms.includes(term.constructor))
				{
					this.symbols.successes += parseInt(term.symbols.successes) + parseInt(term.symbols.righteousSuccesses);
					this.symbols.righteousSuccesses += parseInt(term.symbols.righteousSuccesses);
					this.symbols.challenges += parseInt(term.symbols.challenges);
					this.symbols.boons += parseInt(term.symbols.boons);
					this.symbols.banes += parseInt(term.symbols.banes);
					this.symbols.delays += parseInt(term.symbols.delays);
					this.symbols.exertions += parseInt(term.symbols.exertions);
					this.symbols.sigmarsComets += parseInt(term.symbols.sigmarsComets);
					this.symbols.chaosStars += parseInt(term.symbols.chaosStars);
				}
			});

			// Step 6 - Calculate actual results by cancelling out successes with challenges, boons with banes, etc.
			if(this.symbols.successes < this.symbols.challenges)
			{
				this.symbols.challenges -= parseInt(this.symbols.successes);
				this.symbols.successes = 0;
			}
			else
			{
				this.symbols.successes -= parseInt(this.symbols.challenges);
				this.symbols.challenges = 0;
			}

			if(this.symbols.boons < this.symbols.banes)
			{
				this.symbols.banes -= parseInt(this.symbols.boons);
				this.symbols.boons = 0;
			}
			else
			{
				this.symbols.boons -= parseInt(this.symbols.banes);
				this.symbols.banes = 0;
			}
		}

		// Store final outputs
		this._total = total;
		this._evaluated = true;

		return this;
	}

	/** @override */
	roll()
	{
		return this.evaluate();
	}

	/** @override */
	getTooltip()
	{
		const parts = this.dice.map((die) =>
		{
			const cls = die.constructor;
			let isSpecial = "notSpecial";

			if(game.symbols.diceterms.includes(cls))
				isSpecial = "isSpecial";

			console.log(die);

			let countText = game.i18n.format("Roll." + cls.name.replace("Die", "Dice"), {nb: die.results.length});
			if(die.results.length > die.number)
				countText += " " + game.i18n.format("Roll.ExplodedDice", {nb: die.results.length - die.number});

			return {
				formula: die.formula,
				total: die.total,
				faces: die.faces,
				flavor: die.options.flavor,
				countText: countText,
				isSpecial: game.symbols.diceterms.includes(cls),
				notSpecial: !game.symbols.diceterms.includes(cls),
				rolls: die.results.map((roll) =>
				{
					return {
						result: die.getResultLabel(roll),
						classes: [cls.name.toLowerCase(), isSpecial, "d" + die.faces, roll.rerolled ? "rerolled" : null, roll.exploded ? "exploded" : null, roll.discarded ? "discarded" : null].filterJoin(" ")
					};
				})
			};
		});

		parts.addedResults = this.addedResults;
		parts.flavor = this.flavor;

		console.log(parts);

		return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, {parts});
	}

	/** @override */
	async render(chatOptions = {})
	{
		chatOptions = mergeObject(
		{
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
		if(this?.data)
			this.data.additionalFlavorText = this.flavor;
		else
			this.data = {additionalFlavorText: this.flavor};

		const chatData =
		{
			formula: isPrivate ? "???" : this._formula,
			flavor: isPrivate ? null : chatOptions.flavor,
			user: chatOptions.user,
			tooltip: isPrivate ? "" : await this.getTooltip(),
			total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
			symbols: isPrivate ? {} : this.symbols,
			specialDice: isPrivate ? {} : this.dice.map((die) =>
			{
				const cls = die.constructor;

				return {
					isSpecialDie: game.symbols.diceterms.includes(cls),
					rolls: die.results.map((roll) => {return {result: die.getResultLabel(roll)};})
				};
			}),
			hasSpecialDice: this.hasSpecialDice,
			hasStandard: this.hasStandardDice,
			hasSuccess: this.dice.length > 0,
			diceSymbols: CONFIG.WFRP3E.dice.symbols,
			data: this.data,
			addedResults: this.addedResults,
			publicRoll: !chatOptions.isPrivate,
		};

		// Render the roll display template
		return renderTemplate(chatOptions.template, chatData);
	}

	/** @override */
	toMessage(messageData = {}, {rollMode = null, create = true} = {})
	{
		// Perform the roll, if it has not yet been rolled
		if(!this._evaluated)
			this.evaluate();

		const rMode = rollMode || messageData.rollMode || game.settings.get("core", "rollMode");

		let template = CONST.CHAT_MESSAGE_TYPES.ROLL;

		if(["gmroll", "blindroll"].includes(rMode))
			messageData.whisper = ChatMessage.getWhisperRecipients("GM");

		if(rMode === "blindroll")
			messageData.blind = true;
		if(rMode === "selfroll")
			messageData.whisper = [game.user.id];

		// Prepare chat data
		messageData = mergeObject(
		{
			user: game.user.id,
			type: template,
			content: this.total,
			sound: CONFIG.sounds.dice,
		}, messageData);
		messageData.roll = this;

		Hooks.call("specialDiceMessage", this);

		// Either create the message or just return the chat data
		const cls = getDocumentClass("ChatMessage");
		const msg = new cls(messageData);

		if(rMode)
			msg.applyRollMode(rollMode);

		// Either create or return the data
		return create ? cls.create(msg) : msg;
	}

	/** @override */
	toJSON()
	{
		const json = super.toJSON();
		json.symbols = this.symbols;
		json.hasSpecialDice = this.hasSpecialDice;
		json.hasStandard = this.hasStandardDice;
		json.data = this.data;
		json.addedResults = this.addedResults;
		json.flavor = this.flavor;
		return json;
	}

	/** @override */
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

	// If the main parser hands back a StringTerm attempt to turn it into a die.
	parseShortHand(terms)
	{
		return terms.flatMap(term =>
		{
			if(!(term instanceof StringTerm) || /\d/.test(term.term))
				return term;

			return term.term.split('').reduce((acc, next) =>
			{
				if(next in CONFIG.Dice.terms)
				{
					let cls = CONFIG.Dice.terms[next];
					acc.push(new cls(1));
				}
				else throw new Error(`Unknown die type '${next}'`)

				return acc;
			}, [])
		//Put addition operators between each die.
		}).flatMap((value, index, array) => array.length - 1 !== index
			? [value, new OperatorTerm({operator: '+'})]
			: value)
	}
}