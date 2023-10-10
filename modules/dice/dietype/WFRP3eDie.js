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
	 * @param  {boolean} minimize Minimize the result, obtaining the smallest possible value.
	 * @param  {boolean} maximize Maximize the result, obtaining the largest possible value.
	 * @param  {boolean} async Evaluate the term asynchronously, receiving a Promise as the returned value. This will become the default behavior in version 10.x
	 * @return {WFRP3eDie} The evaluated RollTerm
	 * @inheritDoc
	 */
	evaluate({minimize = false, maximize = false, async = true} = {})
	{
		if(this._evaluated)
			throw new Error(`This ${this.constructor.name} has already been evaluated and is immutable`);

		// Roll the initial number of dialogs
		for(let n = 1; n <= this.number; n++)
			this.roll({minimize, maximize});

		// Apply modifiers
		this._evaluateModifiers();

		// Combine all symbols results.
		this.symbols = {successes: 0, righteousSuccesses: 0, challenges: 0, boons: 0, banes: 0, delays: 0, exertions: 0 , sigmarsComets: 0, chaosStars: 0};
		this.results.forEach((result) =>
		{
			this.symbols.successes += parseInt(result.symbols.successes);
			this.symbols.righteousSuccesses += parseInt(result.symbols.righteousSuccesses);
			this.symbols.challenges += parseInt(result.symbols.challenges);
			this.symbols.boons += parseInt(result.symbols.boons);
			this.symbols.banes += parseInt(result.symbols.banes);
			this.symbols.sigmarsComets += parseInt(result.symbols.sigmarsComets);
			this.symbols.chaosStars += parseInt(result.symbols.chaosStars);
			this.symbols.delays += parseInt(result.symbols.delays);
			this.symbols.exertions += parseInt(result.symbols.exertions);

			if(result.symbols.righteousSuccesses >= 1) {
				result.exploded = true;
			 }
		});

		// Return the evaluated term
		this._evaluated = true;
		this._isSpecialDie = true;
		return this;
	}
}