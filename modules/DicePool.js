import ChallengeDie from "./dice/ChallengeDie.js";
import CharacteristicDie from "./dice/CharacteristicDie.js";
import ConservativeDie from "./dice/ConservativeDie.js";
import ExpertiseDie from "./dice/ExpertiseDie.js";
import FortuneDie from "./dice/FortuneDie.js";
import MisfortuneDie from "./dice/MisfortuneDie.js";
import RecklessDie from "./dice/RecklessDie.js";
import WFRP3eRoll from "./WFRP3eRoll.js";

/**
 * DicePool utility helps prepare WFRP3e's special dice pools.
 * @param {Object} [startingPool]
 * @param {Object} [options]
 * @param {Object} [options.checkData]
 * @param {String} [options.flavor]
 * @param {String} [options.sound]
 */
export default class DicePool
{
	constructor(startingPool = {}, options = {checkData: null, flavor: null, sound: null})
	{
		this.dice = Object.keys(CONFIG.WFRP3e.dice).reduce((dice, dieName) => {
			dice[dieName] = startingPool.dice ? startingPool.dice[dieName] ?? 0 : 0;
			return dice;
		}, {});

		this.symbols = Object.values(CONFIG.WFRP3e.symbols).reduce((symbols, symbol) => {
			symbols[symbol.plural] = startingPool.symbols ? startingPool.symbols[symbol.plural] ?? 0 : 0;
			return symbols;
		}, {});

		this.creatureDice = Object.keys(CONFIG.WFRP3e.attributes).reduce((creatureDice, attributeName) => {
			creatureDice[attributeName] = startingPool.creatureDice ? startingPool.creatureDice[attributeName] ?? 0 : 0;
			return creatureDice;
		}, {});

		this.fortunePoints = 0;
		this.specialisations = [];

		foundry.utils.mergeObject(this, options);
	}

	/**
	 * Transforms the DicePool values into a rollable formula.
	 * @returns {string} A rollable formula.
	 */
	get formula()
	{
		return [
			this.dice.characteristic + "d" + CharacteristicDie.DENOMINATION,
			(this.dice.fortune + this.fortunePoints
				+ this.specialisations.length
				+ this.creatureDice.aggression
				+ this.creatureDice.cunning) + "d" + FortuneDie.DENOMINATION,
			(this.dice.expertise + this.creatureDice.expertise) + "d" + ExpertiseDie.DENOMINATION,
			this.dice.conservative + "d" + ConservativeDie.DENOMINATION,
			this.dice.reckless + "d" + RecklessDie.DENOMINATION,
			this.dice.challenge + "d" + ChallengeDie.DENOMINATION,
			this.dice.misfortune + "d" + MisfortuneDie.DENOMINATION
		].filter((d) => {
			const test = d.split(/([0-9]+)/);
			return test[1] > 0;
		}).join("+");
	}

	get name()
	{
		const checkData = this.checkData;
		if(checkData) {
			if(checkData.combat)
				return game.i18n.localize(`ROLL.NAMES.${checkData.combat.tags.encounterType}EncounterInitiativeCheck`);
			else if(checkData.action)
				return game.i18n.format("ROLL.NAMES.actionCheck", {action: fromUuidSync(checkData.action).name});
			else if(checkData.skill)
				return game.i18n.format("ROLL.NAMES.skillCheck", {skill: checkData.skill.name});
			else if(checkData.characteristic)
				return game.i18n.format("ROLL.NAMES.characteristicCheck", {
					characteristic: game.i18n.localize(CONFIG.WFRP3e.characteristics[checkData.characteristic.name].name)
				});
		}

		return game.i18n.localize("ROLL.NAMES.freeCheck");
	}

	/**
	 * Adds another DicePool to the current one.
	 * @param {DicePool} [otherDicePool]
	 */
	addDicePool(otherDicePool)
	{
		if(otherDicePool.dice)
			Object.keys(CONFIG.WFRP3e.dice).forEach((dieName) => {
				this.dice[dieName] += otherDicePool.dice[dieName];
			});

		if(otherDicePool.symbols)
			Object.values(CONFIG.WFRP3e.symbols).forEach((symbol) => {
				this.symbols[symbol.plural] += otherDicePool.symbols[symbol.plural];
			});

		if(otherDicePool.creatureDice)
			Object.keys(CONFIG.WFRP3e.attributes).forEach((attributeName) => {
				this.creatureDice[attributeName] += otherDicePool.creatureDice[attributeName];
			});
	}

	/**
	 * Converts any remaining Characteristic Die from the Dice Pool into a Conservative/Reckless Die. If no Characteristic Die remains, adds a Conservative/Reckless Die instead.
	 * @param {string} type The type of die the Characteristic Die must be converted to.
	 * @param {number} times The amount of conversion to perform (defaults to 1).
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
				if(this.dice[type] > 0) {
					this.dice[type]--;
					this.dice.characteristic++;
				}
				else
					ui.notifications.warn(game.i18n.format("CHECKBUILDER.WARNINGS.convertBack", {type: type}));
			}
			else {
				if(this.dice.characteristic > 0) {
					this.dice.characteristic--;
					this.dice[type]++;
				}
				else
					ui.notifications.warn(game.i18n.format("CHECKBUILDER.WARNINGS.convert", {type: "characteristic"}));
			}
		}
	}

	/**
	 * Rolls the Dice Pool, then shows the results in a Message.
	 * @returns {Promise<{WFRP3eRoll}>}
	 */
	async roll()
	{
		const checkData = this.checkData;
		let actor = checkData?.actor;

		if(checkData) {
			checkData.fortunePoints = this.fortunePoints;

			if(actor) {
				actor = await fromUuid(checkData.actor);

				// Remove the fortune points spent on the check from the Actor and/or Party.
				if(actor.type === "character" && this.fortunePoints > 0) {
					const updates = {"system.fortune.value": Math.max(actor.system.fortune.value - this.fortunePoints, 0)};

					if(this.fortunePoints > actor.system.fortune.value) {
						const party = actor.system.currentParty;
						party.update({"system.fortunePool": Math.max(party.system.fortunePool - (this.fortunePoints - actor.system.fortune.value), 0)})
					}

					actor.update(updates);
				}
				// Remove the attribute dice spent on the check from the Creature.
				else if(actor.type === "creature") {
					const updates = {system: {attributes: {}}};

					for(const [attributeName, creatureDice] of Object.entries(this.creatureDice)) {
						if(creatureDice > 0)
							updates.system.attributes[attributeName] = {
								value: actor.system.attributes[attributeName].value - creatureDice
							};
					}

					if(Object.keys(updates.system.attributes).length > 0)
						actor.update(updates);
				}
			}
		}

		const roll = await WFRP3eRoll.create(
			this.formula,
			actor ? actor.getRollData() : {},
			{checkData, flavor: this.flavor, startingSymbols: this.symbols}
		).toMessage({
			flavor: this.name,
			speaker: {actor}
		});

		if(this.sound)
			AudioHelper.play({src: this.sound}, true);

		return roll;
	}
}