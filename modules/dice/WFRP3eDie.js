/** @inheritDoc */
export default class WFRP3eDie extends Die
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
	_evaluateSync({minimize = false, maximize = false} = {}) {
		if((this.number > 999))
			throw new Error(`You may not evaluate a DiceTerm with more than 999 requested results`);

		for(let n = 1; n <= this.number; n++)
			this.roll({minimize, maximize});

		this._evaluateModifiers();

		this.results.forEach((result) => {
			Object.keys(this.resultSymbols).forEach((symbolName, index) => {
				this.resultSymbols[symbolName] += parseInt(result.symbols[symbolName]);
			}, {});

			if(result.symbols.righteousSuccesses > 0)
				result.exploded = true;
		});

		return this;
	}

	/** @inheritDoc */
	roll({minimize = false, maximize = false} = {})
	{
		const roll = super.roll({minimize = false, maximize = false} = {});

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
	getResultCSS(result) {
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
		let countText = game.i18n.format("ROLL.AMOUNT." + this.constructor.name, {nb: this.results.length});
		if(this.results.length > this.number)
			countText += `  ${game.i18n.format("ROLL.AMOUNT.ExplodedDie", {nb: this.results.length - this.number})}`;

		return {
			...super.getTooltipData(),
			countText,
			isSpecial: true
		}
	}
}