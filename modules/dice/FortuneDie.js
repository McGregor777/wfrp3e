import WFRP3eDie from "./WFRP3eDie.js";

export default class FortuneDie extends WFRP3eDie
{
	/** @inheritDoc */
	constructor(termData)
	{
		termData.faces = 6;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "f";

	/**
	 * Roll the DiceTerm by mapping a random uniform draw against the faces of the dice term
	 * @param {Object} options
	 * @return {DiceTermResult}
	 * @inheritDoc
	 */
	roll(options)
	{
		const roll = super.roll(options);
		roll.symbols = CONFIG.WFRP3e.dice.fortune.results[roll.result];
		return roll;
	}

	/**
	 * Return a string used as the label for each rolled result
	 * @param {DiceTermResult} result     The rolled result
	 * @return {string}                   The result label
	 */
	getResultLabel(result)
	{
		const die = CONFIG.WFRP3e.dice.fortune.results[result.result];
		return `<img class="special-die" src="${die.image}" title="${game.i18n.localize(die.label)}" alt=""/>`;
	}
}