/** @inheritDoc */
export default class WFRP3eDie extends foundry.dice.terms.Die
{
	constructor(termData = {})
	{
		super(termData);

		this.resultSymbols = {
			...Object.values(CONFIG.WFRP3e.symbols).reduce((object, symbol) => {
				object[symbol.plural] = 0;
				return object;
			}, {})
		};
	}
	static NAME = "wfrp3e-die";

	/** @inheritDoc */
	async _evaluateAsync(options = {})
	{
		await super._evaluateAsync(options);

		this.results.forEach((result) => {
			Object.keys(this.resultSymbols).forEach((symbolName) => {
				this.resultSymbols[symbolName] += parseInt(result.symbols[symbolName]);
			}, {});

			if(result.symbols.righteousSuccesses > 0)
				result.exploded = true;
		});

		return this;
	}

	/** @inheritDoc */
	_evaluateSync(options = {})
	{
		super._evaluateSync(options);

		this.results.forEach((result) => {
			result.symbols = CONFIG.WFRP3e.dice[this.constructor.NAME].results[result.result];

			Object.keys(this.resultSymbols).forEach((symbolName, index) => {
				this.resultSymbols[symbolName] += parseInt(result.symbols[symbolName]);
			}, {});

			if(result.symbols.righteousSuccesses > 0)
				result.exploded = true;
		});

		return this;
	}

	/** @inheritDoc */
	async roll({minimize = false, maximize = false, ...options} = {})
	{
		const roll = await super.roll({minimize, maximize, ...options} = {});

		roll.symbols = CONFIG.WFRP3e.dice[this.constructor.NAME].results[roll.result];

		return roll;
	}

	/** @inheritDoc */
	getResultLabel(result)
	{
		const die = CONFIG.WFRP3e.dice[this.constructor.NAME].results[result.result];
		return `<img class="special-die" src="${die.image}" title="${game.i18n.localize(die.label)}" alt=""/>`;
	}

	/** @inheritDoc */
	getResultCSS(result)
	{
		return [
			"wfrp3e-die",
			`${this.constructor.NAME}-die`,
			result.rerolled ? "rerolled" : null,
			result.exploded ? "exploded" : null,
			result.discarded ? "discarded" : null
		]
	}

	/** @inheritDoc */
	getTooltipData()
	{
		let countText = game.i18n.format(CONFIG.WFRP3e.dice[this.constructor.NAME].amount, {nb: this.results.length});

		if(this.results.length > this.number)
			countText += `  ${game.i18n.format("DIE.AMOUNT.explodedDie", {nb: this.results.length - this.number})}`;

		return {
			...super.getTooltipData(),
			countText,
			isSpecial: true
		}
	}
}