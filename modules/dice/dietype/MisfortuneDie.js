import WFRP3EDie from "./WFRP3EDie.js";

export default class MisfortuneDie extends WFRP3EDie
{
	/** @override */
	constructor(termData)
	{
		termData.faces = 6;
		super(termData);
	}

	/** @override */
	static DENOMINATION = "m";

	/**
	 * Roll the DiceTerm by mapping a random uniform draw against the faces of the dice term
	 * @param {Object} options
	 * @return {DiceTermResult}
	 * @override
	 */
	roll(options)
	{
		const roll = super.roll(options);
		roll.symbols = CONFIG.WFRP3E.fortuneDiceResults[roll.result];
		return roll;
	}

	/**
	 * Return a string used as the label for each rolled result
	 * @param {DiceTermResult} result     The rolled result
	 * @return {string}                   The result label
	 */
	getResultLabel(result)
	{
		const die = CONFIG.WFRP3E.fortuneDiceResults[result.result];
		return `<img class="special-die" src="${die.image}" title="${game.i18n.localize(die.label)}" alt=""/>`;
	}
}