import WFRP3EDie from "./WFRP3EDie.js";

export default class ExpertiseDie extends WFRP3EDie
{
	/** @override */
	constructor(termData)
	{
		termData.faces = 6;
		termData.modifiers = ["x3"]
		super(termData);
	}

	/** @override */
	static DENOMINATION = "e";

	/**
	 * A string representation of the formula expression for this RollTerm, prior to evaluation.
	 * @type {string}
	 * @override
	 */
	get expression()
	{
		return `${this.number}d${this.constructor.DENOMINATION}${this.modifiers.join("")}`;
	}

	/**
	 * Roll the DiceTerm by mapping a random uniform draw against the faces of the dice term
	 * @param {Object} options
	 * @return {DiceTermResult}
	 * @override
	 */
	roll(options)
	{
		const roll = super.roll(options);
		roll.symbols = CONFIG.WFRP3E.dice.results.expertise[roll.result];
		return roll;
	}

	/**
	 * Return a string used as the label for each rolled result
	 * @param {DiceTermResult} result     The rolled result
	 * @return {string}                   The result label
	 */
	getResultLabel(result)
	{
		const die = CONFIG.WFRP3E.dice.results.expertise[result.result];
		return `<img class="special-die" src="${die.image}" title="${game.i18n.localize(die.label)}" alt=""/>`;
	}
}