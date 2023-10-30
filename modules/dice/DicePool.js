import ChallengeDie from "./dietype/ChallengeDie.js";
import CharacteristicDie from "./dietype/CharacteristicDie.js";
import ConservativeDie from "./dietype/ConservativeDie.js";
import ExpertiseDie from "./dietype/ExpertiseDie.js";
import FortuneDie from "./dietype/FortuneDie.js";
import MisfortuneDie from "./dietype/MisfortuneDie.js";
import RecklessDie from "./dietype/RecklessDie.js";

/**
 * DicePool utility helps prepare WFRP3e's special dice pools.
 */
export default class DicePool
{
	/**
	 * @param {Object} [dicePool]
	 */
	constructor(dicePool = {})
	{
		Object.keys(CONFIG.WFRP3e.dice).forEach((diceName) => {
			this[diceName + "Dice"] = dicePool[diceName + "Dice"] ?? 0;
		});

		Object.values(CONFIG.WFRP3e.symbols).forEach((symbol) => {
			this[symbol.plural] = dicePool[symbol.plural] ?? 0;
		});

		Object.keys(CONFIG.WFRP3e.attributes).forEach((attribute) => {
			const attributeName = attribute[0].toUpperCase() + attribute.slice(1, attribute.length);

			this["creatures" + attributeName + "Dice"] = dicePool["creatures" + attributeName + "Dice"] ?? 0;
		});
	}

	/**
	 * Converts any remaining Characteristic Die from the Dice Pool into a Conservative/Reckless Die. If no Characteristic Die remains, adds a Conservative/Reckless Die instead.
	 * @param {string} type The type of die the Characteristic Die must be converted to.
	 * @param {number} times The amount of conversion to perform(defaults to 1).
	 */
	convertCharacteristicDie(type, times = 1)
	{
		let revert = false;

		if(times < 0) {
			revert = true;
			times = Math.abs(times);
		}

		for(let i = 0; i < times; i++) {
			if(revert) {
				if(this[type + "Dice"] > 0) {
					this[type + "Dice"]--;
					this.characteristicDice++;
				}
				else
					ui.notifications.warn(game.i18n.format("ROLL.CHECKBUILDER.ConvertBackWarning", {type: type}));
			}
			else {
				if(this.characteristicDice > 0) {
					this.characteristicDice--;
					this[type + "Dice"]++;
				}
				else
					ui.notifications.warn(game.i18n.format("ROLL.CHECKBUILDER.ConvertWarning", {type: "characteristic"}));
			}
		}
	}

	/**
	 * Transforms the DicePool into a rollable expression.
	 * @returns {string} a applications expression that can be used to roll the applications pool
	 */
	renderDiceExpression()
	{
		return [
			this.characteristicDice + "d" + CharacteristicDie.DENOMINATION,
			(this.fortuneDice + this.creaturesAggressionDice + this.creaturesCunningDice) + "d" + FortuneDie.DENOMINATION,
			(this.expertiseDice + this.creaturesExpertiseDice) + "d" + ExpertiseDie.DENOMINATION,
			this.conservativeDice + "d" + ConservativeDie.DENOMINATION,
			this.recklessDice + "d" + RecklessDie.DENOMINATION,
			this.challengeDice + "d" + ChallengeDie.DENOMINATION,
			this.misfortuneDice + "d" + MisfortuneDie.DENOMINATION
		].filter((d) => {
			const test = d.split(/([0-9]+)/);
			return test[1] > 0;
		}).join("+");
	}
}