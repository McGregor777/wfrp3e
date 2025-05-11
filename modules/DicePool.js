import ChallengeDie from "./dice/ChallengeDie.js";
import CharacteristicDie from "./dice/CharacteristicDie.js";
import ConservativeDie from "./dice/ConservativeDie.js";
import ExpertiseDie from "./dice/ExpertiseDie.js";
import FortuneDie from "./dice/FortuneDie.js";
import MisfortuneDie from "./dice/MisfortuneDie.js";
import RecklessDie from "./dice/RecklessDie.js";
import WFRP3eRoll from "./WFRP3eRoll.js";

/**
 * @typedef {Object} CheckData
 * @property {string} actor
 * @property {string} characteristic
 * @property {string} [action]
 * @property {string} [challengeLevel]
 * @property {boolean} [combat]
 * @property {string} [face]
 * @property {string} [fortunePoints]
 * @property {CheckOutcome} [outcome]
 * @property {Array} [specialisations]
 * @property {string} [skill]
 * @property {Array} [targets]
 * @property {Array} [triggeredItems]
 * @property {string} [weapon]
 */

/**
 * @typedef {Object} CheckOutcome
 */

/**
 * DicePool utility helps prepare WFRP3e's special dice pools.
 * @property {Object} dice The various dice that will be rolled.
 * @property {Object} symbols The various symbols that will be added to the results of the check once the rolled.
 * @property {CheckData} [checkData] Contains various data concerning the check of the DicePool.
 * @property {String} [flavor] A flavor text.
 * @property {String} [sound] An audio file path.
 */
export default class DicePool
{
	/**
	 * @param {Object} [startingPool]
	 * @param {Object} [options]
	 * @param {CheckData} [options.checkData] Contains various data concerning the check of the DicePool.
	 * @param {String} [options.flavor] A flavor text.
	 * @param {String} [options.sound] An audio file path.
	 */
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

		const checkData = options.checkData;
		if(checkData?.actor) {
			const actor = fromUuidSync(checkData.actor);

			if(actor.type === "creature")
				checkData.creatureDice = {
					aggression: 0,
					cunning: 0,
					expertise: 0
				}
		}

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
			this.dice.fortune + "d" + FortuneDie.DENOMINATION,
			this.dice.expertise + "d" + ExpertiseDie.DENOMINATION,
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
				return game.i18n.localize(`ROLL.NAMES.${checkData.combat.system.type}EncounterInitiativeCheck`);
			else if(checkData.action)
				return game.i18n.format("ROLL.NAMES.actionCheck", {action: fromUuidSync(checkData.action).name});
			else if(checkData.skill)
				return game.i18n.format("ROLL.NAMES.skillCheck", {skill: fromUuidSync(checkData.skill).name});
			else if(checkData.characteristic)
				return game.i18n.format("ROLL.NAMES.characteristicCheck", {
					characteristic: game.i18n.localize(CONFIG.WFRP3e.characteristics[checkData.characteristic].name)
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
	 * Determines the number of dice of each type depending on the check data.
	 */
	determineDicePoolFromCheckData()
	{
		const checkData = this.checkData;
		if(checkData.actor) {
			const actor = fromUuidSync(checkData.actor),
				  action = fromUuidSync(checkData.action),
				  characteristic = actor.system.characteristics[checkData.characteristic],
				  face = checkData.face,
				  stance = actor.system.stance.current ?? actor.system.stance,
				  match = action?.system[face].check.match(new RegExp(
					  "(([\\p{L}\\s]+) \\((\\p{L}+)\\))( " +
					  game.i18n.localize("ACTION.CHECK.against") +
					  "\\.? ([\\p{L}\\s]+))?", "u")
				  );

			this.dice = {
				characteristic: characteristic.rating - Math.abs(stance),
				fortune: characteristic.fortune
					+ (checkData.fortunePoints ?? 0)
					+ (checkData.specialisations?.length ?? 0)
					+ (checkData.creatureDice?.aggression ?? 0)
					+ (checkData.creatureDice?.cunning ?? 0),
				expertise: (fromUuidSync(checkData.skill)?.system.trainingLevel ?? 0)
					+ (checkData.creatureDice?.expertise ?? 0),
				conservative: stance < 0 ? Math.abs(stance) : 0,
				reckless: stance > 0 ? stance : 0,
				challenge: CONFIG.WFRP3e.challengeLevels[checkData.challengeLevel].challengeDice
					+ (action?.system[face].difficultyModifiers.challengeDice ?? 0),
				misfortune: action?.system[face].difficultyModifiers.misfortuneDice
					+ match && match[5] === game.i18n.localize("ACTION.CHECK.targetDefence")
						&& checkData.targets?.length > 0
							? fromUuidSync(checkData.targets[0]).system.totalDefence
							: 0
			}
		}
		else
			throw new Error("Cannot determine dicePool from checkData without an Actor");
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
			if(actor) {
				const fortunePoints = this.checkData.fortunePoints;
				actor = await fromUuid(checkData.actor);

				// Remove the fortune points spent on the check from the Actor and/or Party.
				if(actor.type === "character" && fortunePoints > 0) {
					const updates = {"system.fortune.value": Math.max(actor.system.fortune.value - fortunePoints, 0)};

					if(fortunePoints > actor.system.fortune.value) {
						const party = actor.system.currentParty;
						party.update({"system.fortunePool": Math.max(party.system.fortunePool - (fortunePoints - actor.system.fortune.value), 0)})
					}

					actor.update(updates);
				}
				// Remove the attribute dice spent on the check from the Creature.
				else if(actor.type === "creature" && checkData.creatureDice) {
					const updates = {system: {attributes: {}}};

					for(const [attributeName, creatureDice] of Object.entries(checkData.creatureDice)) {
						if(creatureDice > 0)
							updates.system.attributes[attributeName] = {
								value: actor.system.attributes[attributeName].value - creatureDice
							};
					}

					if(Object.keys(updates.system.attributes).length > 0)
						actor.update(updates);
				}
			}

			// Execute the effects from all selected items.
			const triggeredItems = this.checkData.triggeredItems;
			if(triggeredItems != null) {
				if(Array.isArray(triggeredItems))
					for(const itemUuid of triggeredItems)
						await this.executeItemEffects(itemUuid, "postScript");
				else
					await this.executeItemEffects(triggeredItems, "postScript");
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

	/**
	 * Executes scripts from onPreCheckTrigger WFRP3eEffects contained by a WFRP3eItem.
	 * @param {string} itemUuid The UUID of the WFRP3eItem.
	 * @param {string} script The type of script to execute.
	 * @returns {Promise<void>}
	 */
	async executeItemEffects(itemUuid, script = "script")
	{
		const actor = await fromUuid(this.checkData.actor),
			  item = await fromUuid(itemUuid),
			  effects = item.effects.filter(effect => effect.system.type === "onPreCheckTrigger");

		for(const effect of effects)
			await effect.triggerEffect({
				parameters: [actor, this, this.checkData],
				parameterNames: ["actor", "dicePool", "checkData"],
				script: script
			});
	}
}