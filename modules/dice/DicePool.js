/**
 * Dice pool utility specializing in WFRP3E's special dialogs
 */
export default class DicePool
{
	constructor(dicePool)
	{
		if(dicePool === undefined)
			dicePool = {};

		if(typeof dicePool === "string")
			dicePool = JSON.parse(dicePool);

		this.characteristicDice = dicePool.characteristicDice || 0;
		this.fortuneDice = dicePool.fortuneDice || 0;
		this.expertiseDice = dicePool.expertiseDice || 0;
		this.conservativeDice = dicePool.conservativeDice || 0;
		this.recklessDice = dicePool.recklessDice || 0;
		this.challengeDice = dicePool.challengeDice || 0;
		this.misfortuneDice = dicePool.misfortuneDice || 0;

		this.successes = dicePool.successes || 0;
		this.righteousSuccesses = dicePool.righteousSuccesses || 0;
		this.challenges = dicePool.challenges || 0;
		this.boons = dicePool.boons || 0;
		this.banes = dicePool.banes || 0;
		this.delays = dicePool.delays || 0;
		this.exertions = dicePool.exertions || 0;
		this.sigmarsComets = dicePool.sigmarsComets || 0;
		this.chaosStars = dicePool.chaosStars || 0;

		this.source = {};
	}

	/**
	 * Converts any remaining Characteristic Die from the Dice Pool into a Conservative/Reckless Die. If no Characteristic Die remains, adds a Conservative/Reckless Die instead.
	 * @param {string} type The type of die the Characteristic Die must be converted to.
	 * @param {number} times The amount of conversion to perform(defaults to 1).
	 */
	convertCharacteristicDie(type, times = 1)
	{
		let revert = false;

		if(times < 0)
		{
			revert = true;
			times = Math.abs(times);
		}

		for(let i = 0; i < times; i++)
		{
			if(revert)
			{
				if(this[type + "Dice"] > 0)
				{
					this[type + "Dice"]--;
					this.characteristicDice++;
				}
				else
					ui.notifications.warn("There is no " + type + " die left to convert back.");
			}
			else
			{
				if(this.characteristicDice > 0)
				{
					this.characteristicDice--;
					this[type + "Dice"]++;
				}
				else
					ui.notifications.warn("There is no characteristic die left to convert.");
			}
		}
	}

	/**
	 * Transform the dialogs pool into a rollable expression
	 * @returns {string} a dialogs expression that can be used to roll the dialogs pool
	 */
	renderDiceExpression()
	{
		let dicePool = [this.characteristicDice + "da", this.fortuneDice + "df", this.expertiseDice + "de", this.conservativeDice + "do", this.recklessDice + "dr", this.challengeDice + "dh", this.misfortuneDice + "dm"];
		let finalPool = dicePool.filter((d) =>
		{
			const test = d.split(/([0-9]+)/);
			return test[1] > 0;
		});

		return finalPool.join("+");
	}

	/**
	 * Renders a preview of the dice pool.
	 * @param {HTMLElement} container The dice pool preview container.
	 * @returns {HTMLElement}
	 */
	renderDicePoolPreview(container)
	{
		const totalDice = +this.characteristicDice + +this.fortuneDice + +this.expertiseDice + +this.conservativeDice + +this.recklessDice + +this.challengeDice + +this.misfortuneDice;

		let height = 48;
		let width = 48;

		if(totalDice > 15)
		{
			height = 12;
			width = 12;
		}
		else if(totalDice > 10) 
		{
			height = 24;
			width = 24;
		}
		else if(totalDice > 7)
		{
			height = 36;
			width = 36;
		}

		this._addIcons(container, CONFIG.WFRP3E.dice.icons.characteristic, this.characteristicDice, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.fortune, this.fortuneDice, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.expertise, this.expertiseDice, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.conservative, this.conservativeDice, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.reckless, this.recklessDice, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.challenge, this.challengeDice, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.misfortune, this.misfortuneDice, height, width);

		return container;
	}

	renderSymbolsPoolPreview(container)
	{
		let advanceContainer = this.renderPreview(container);
		let additionalSymbols = [];

		["successes", "righteousSuccesses", "challenges", "boons", "banes", "delays", "exertions", "sigmarsComets", "chaosStars"].forEach((symbol) =>
		{
			let diceSymbol = "";

			switch(symbol)
			{
				case "successes":
				{
					diceSymbol = "[SU]";
					break;
				}
				case "righteousSuccesses":
				{
					diceSymbol = "[RI]";
					break;
				}
				case "challenges":
				{
					diceSymbol = "[CHAL]";
					break;
				}
				case "boons":
				{
					diceSymbol = "[BO]";
					break;
				}
				case "banes":
				{
					diceSymbol = "[BA]";
					break;
				}
				case "delays":
				{
					diceSymbol = "[DE]";
					break;
				}
				case "exertions":
				{
					diceSymbol = "[EX]";
					break;
				}
				case "sigmarsComets":
				{
					diceSymbol = "[SI]";
					break;
				}
				case "chaosStars":
				{
					diceSymbol = "[CHAO]";
					break;
				}
			}

			if(this[symbol] !== 0)
				additionalSymbols.push(`${this[symbol] < 0 ? "-" : "+"} ${this[symbol]} ${diceSymbol}`);
		});

		$(advanceContainer).append(`<div>${additionalSymbols.join(", ")}</div>`);

		return advanceContainer;
	}

	_addIcons(container, icon, times, height = 45, width = 45)
	{
		for(let i = 0; i < times; i++)
		{
			const img = document.createElement("img");

			img.src = icon;
			img.width = width;
			img.height = height;

			container.appendChild(img);
		}
	}

	/**
	 * Search the passed container for inputs that contain dialogs pool information
	 * @param container the container where the inputs are located
	 * @returns {DicePool}
	 */
	static fromContainer(container)
	{
		return new DicePool(
		{
			characteristicDice: container.querySelector('[name="characteristicDice"]')?.value ? container.querySelector('[name="characteristicDice"]').value : 0,
			fortuneDice: container.querySelector('[name="fortuneDice"]')?.value ? container.querySelector('[name="fortuneDice"]').value : 0,
			expertiseDice: container.querySelector('[name="expertiseDice"]')?.value ? container.querySelector('[name="expertiseDice"]').value : 0,
			conservativeDice: container.querySelector('[name="conservativeDice"]')?.value ? container.querySelector('[name="conservativeDice"]').value : 0,
			recklessDice: container.querySelector('[name="recklessDice"]')?.value ? container.querySelector('[name="recklessDice"]').value : 0,
			challengeDice: container.querySelector('[name="challengeDice"]')?.value ? container.querySelector('[name="challengeDice"]').value : 0,
			misfortuneDice: container.querySelector('[name="misfortuneDice"]')?.value ? container.querySelector('[name="misfortuneDice"]').value : 0,
			success: container.querySelector('[name="successes"]')?.value ? container.querySelector('[name="successes"]').value : 0,
			righteousSuccess: container.querySelector('[name="righteousSuccesses"]')?.value ? container.querySelector('[name="righteousSuccesses"]').value : 0,
			challenge: container.querySelector('[name="challenges"]')?.value ? container.querySelector('[name="challenges"]').value : 0,
			boon: container.querySelector('[name="boons"]')?.value ? container.querySelector('[name="boons"]').value : 0,
			bane: container.querySelector('[name="banes"]')?.value ? container.querySelector('[name="banes"]').value : 0,
			delay: container.querySelector('[name="delays"]')?.value ? container.querySelector('[name="delays"]').value : 0,
			exertion: container.querySelector('[name="exertions"]')?.value ? container.querySelector('[name="exertions"]').value : 0,
			sigmarsComet: container.querySelector('[name="sigmarsComets"]')?.value ? container.querySelector('[name="sigmarsComets"]').value : 0,
			chaosStar: container.querySelector('[name="chaosStars"]')?.value ? container.querySelector('[name="chaosStars"]').value : 0,
		});
	}
}