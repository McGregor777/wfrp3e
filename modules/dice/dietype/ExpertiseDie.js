import WFRP3eDie from "./WFRP3eDie.js";

export default class ExpertiseDie extends WFRP3eDie
{
	/** @inheritDoc */
	constructor(termData)
	{
		termData.faces = 6;
		termData.modifiers = ["x3"]
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "e";

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
	 * Roll the DiceTerm by mapping a random uniform draw against the faces of the dice term
	 * @param {Object} options
	 * @return {DiceTermResult}
	 * @inheritDoc
	 */
	roll(options)
	{
		const roll = super.roll(options);
		roll.symbols = CONFIG.WFRP3e.dice.expertise.results[roll.result];
		return roll;
	}

	/**
	 * Return a string used as the label for each rolled result
	 * @param {DiceTermResult} result     The rolled result
	 * @return {string}                   The result label
	 */
	getResultLabel(result)
	{
		const die = CONFIG.WFRP3e.dice.expertise.results[result.result];
		return `<img class="special-die" src="${die.image}" title="${game.i18n.localize(die.label)}" alt=""/>`;
	}
}