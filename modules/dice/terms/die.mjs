/** @inheritDoc */
export default class Die extends foundry.dice.terms.Die
{
	static NAME = "wfrp3e-die";

	static RESULTS = {};

	static get amount()
	{
		return `DIE.${this.NAME}.amount`;
	}

	static get icon()
	{
		return `systems/wfrp3e/assets/icons/dice/${this.NAME}.webp`;
	}

	static get name()
	{
		return `DIE.${this.NAME}.name`;
	}

	static get plural()
	{
		return `DIE.${this.NAME}.plural`;
	}

	/** @inheritDoc */
	async roll({minimize = false, maximize = false, ...options} = {})
	{
		const roll = await super.roll({minimize, maximize, ...options} = {});

		roll.symbols = this.constructor.RESULTS[roll.result].symbols;

		return roll;
	}

	/** @inheritDoc */
	getResultLabel(result)
	{
		const dieResult = this.constructor.RESULTS[result.result],
			  resultName = dieResult.name === "blank" ? "" : `_${dieResult.name.toLowerCase()}`,
			  icon = `systems/wfrp3e/assets/icons/dice/${this.constructor.NAME + resultName}.webp`,
			  name = game.i18n.localize(`DIE.RESULTS.${dieResult.name}`);

		return `<img class="special-die" src="${icon}" alt="${name}" data-tooltip="${name}" />`;
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
		let countText = game.i18n.format(this.constructor.amount, {nb: this.results.length});

		if(this.results.length > this.number)
			countText += ` ${game.i18n.format("DIE.exploded", {nb: this.results.length - this.number})}`;

		return {
			...super.getTooltipData(),
			countText,
			isSpecial: true
		}
	}
}
