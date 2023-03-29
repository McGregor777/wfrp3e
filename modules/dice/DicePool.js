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

		this.challengeDice = dicePool.challengeDice || 0;
		this.characteristicDice = dicePool.characteristicDice || 0;
		this.conservativeDice = dicePool.conservativeDice || 0;
		this.expertiseDice = dicePool.expertiseDice || 0;
		this.fortuneDice = dicePool.fortuneDice || 0;
		this.misfortuneDice = dicePool.misfortuneDice || 0;
		this.recklessDice = dicePool.recklessDice || 0;

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
	 * Upgrade the dialogs pool, converting any remaining ability dialogs into proficiency dialogs or adding an ability die if none remain.
	 * @param times the number of times to perform this operation, defaults to 1
	 */
	upgrade(times)
	{
		if(times === undefined)
			times = 1;

		let downgrade = false;

		if(times < 0)
		{
			downgrade = true;
			times = Math.abs(times);
		}

		for(let i = 0; i < times; i++)
		{
			if(downgrade)
			{
				if(this.proficiency > 0)
				{
					this.proficiency--;
					this.ability++;
				}
			}
			else
			{
				if(this.ability > 0)
				{
					this.ability--;
					this.proficiency++;
				}
				else
					this.ability++;
			}
		}
	}

	/**
	 * Transform the dialogs pool into a rollable expression
	 * @returns {string} a dialogs expression that can be used to roll the dialogs pool
	 */
	renderDiceExpression()
	{
		let dicePool = [this.challengeDice + "dh", this.characteristicDice + "da", this.conservativeDice + "do", this.expertiseDice + "de", this.fortuneDice + "df", this.misfortuneDice + "dm", this.recklessDice + "dr"];
		let finalPool = dicePool.filter((d) =>
		{
			const test = d.split(/([0-9]+)/);
			return test[1] > 0;
		});

		return finalPool.join("+");
	}

	/**
	 * Create a preview of the dialogs pool using images
	 * @param container {HTMLElement} where to place the preview. A container will be generated if this is undefined
	 * @returns {HTMLElement}
	 */
	renderPreview(container)
	{
		if(container === undefined)
		{
			container = document.createElement("div");
			container.classList.add("dialogs-pool");
		}

		const totalDice = +this.challengeDice + +this.characteristicDice + +this.conservativeDice + +this.expertiseDice + +this.fortuneDice + +this.misfortuneDice + +this.recklessDice;

		let height = 36;
		let width = 36;

		if(totalDice > 8)
		{
			height = 24;
			width = 24;
		}

		if(totalDice > 24)
		{
			height = 12;
			width = 12;
		}

		this._addIcons(container, CONFIG.WFRP3E.dice.icons.challenge, this.challenges, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.characteristic, this.characteristic, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.conservative, this.conservative, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.expertise, this.expertise, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.fortune, this.fortune, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.misfortune, this.misfortune, height, width);
		this._addIcons(container, CONFIG.WFRP3E.dice.icons.reckless, this.reckless, height, width);

		this._addSourceToolTip(container);

		return container;
	}

	renderAdvancedPreview(container)
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

	_addIcons(container, icon, times, height = 36, width = 36)
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

	_addSourceToolTip(container)
	{
		const createToolTip = this.source?.skill?.length || this.source?.boost?.length || this.source?.remsetback?.length || this.source?.setback?.length;

		if(createToolTip)
		{
			const mapDataToString = (values) =>
			{
				const item = document.createElement("div");
				item.innerHTML = values.map((i) => `<li class="">${i}</li>`).join("");
				tooltip.append(item);
			};

			const tooltip = document.createElement("div");
			tooltip.classList.add("tooltip2");

			if(this.source?.skill?.length)
				mapDataToString(this.source.skill);

			if(this.source?.boost?.length)
				mapDataToString(this.source.boost);

			if(this.source?.remsetback?.length)
				mapDataToString(this.source.remsetback);

			if(this.source?.setback?.length)
				mapDataToString(this.source.setback);

			container.classList.add("hover");
			container.append(tooltip);
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
			challengeDice: container.querySelector('[name="challengeDice"]')?.value ? container.querySelector('[name="challengeDice"]').value : 0,
			characteristicDice: container.querySelector('[name="characteristicDice"]')?.value ? container.querySelector('[name="characteristicDice"]').value : 0,
			conservativeDice: container.querySelector('[name="conservativeDice"]')?.value ? container.querySelector('[name="conservativeDice"]').value : 0,
			expertiseDice: container.querySelector('[name="expertiseDice"]')?.value ? container.querySelector('[name="expertiseDice"]').value : 0,
			fortuneDice: container.querySelector('[name="fortuneDice"]')?.value ? container.querySelector('[name="fortuneDice"]').value : 0,
			misfortuneDice: container.querySelector('[name="misfortuneDice"]')?.value ? container.querySelector('[name="misfortuneDice"]').value : 0,
			recklessDice: container.querySelector('[name="recklessDice"]')?.value ? container.querySelector('[name="recklessDice"]').value : 0,
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