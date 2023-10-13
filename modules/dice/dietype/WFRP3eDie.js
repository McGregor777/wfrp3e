/** @inheritDoc */
export default class WFRP3eDie extends Die
{
	/** @inheritDoc */
	constructor(termData)
	{
		super(termData);
	}

	/**
	 * A string representation of the formula expression for this RollTerm, prior to evaluation.
	 * @type {string}
	 * @inheritDoc
	 */
	get expression()
	{
		return `${this.number}d${this.constructor.DENOMINATION}${this.modifiers.join("")}`;
	}

	/**
	 * Return a standardized representation for the displayed formula associated with this DiceTerm
	 * @return {string}
	 * @inheritDoc
	 */
	get formula()
	{
		return this.expression;
	}

	/**
	 * Evaluate the term, processing its inputs and finalizing its total.
	 * @param {boolean} minimize Minimize the result, obtaining the smallest possible value.
	 * @param {boolean} maximize Maximize the result, obtaining the largest possible value.
	 * @param {boolean} async Evaluate the term asynchronously, receiving a Promise as the returned value. This will become the default behavior in version 10.x
	 * @return {WFRP3eDie} The evaluated RollTerm
	 * @inheritDoc
	 */
	evaluate({minimize = false, maximize = false, async = true} = {})
	{
		if(this._evaluated)
			throw new Error(`This ${this.constructor.name} has already been evaluated and is immutable`);

		for(let n = 1; n <= this.number; n++)
			this.roll({minimize, maximize});

		this.symbols = {
			...Object.keys(CONFIG.WFRP3e.symbols).reduce((object, symbolName) => {
				object[symbolName] = 0;
				return object;
			}, {})
		};

		this.results.forEach((result) => {
			Object.keys(this.symbols).forEach((symbolName, index) => {
				this.symbols[symbolName] += parseInt(result.symbols[symbolName]);
			}, {});

			if(result.symbols.righteousSuccesses > 0)
				result.exploded = true;
		});

		// Return the evaluated term
		this._evaluated = true;
		this._isSpecialDie = true;

		return this;
	}
}