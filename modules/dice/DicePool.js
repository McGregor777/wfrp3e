import ChallengeDie from "./terms/ChallengeDie.js";
import CharacteristicDie from "./terms/CharacteristicDie.js";
import ConservativeDie from "./terms/ConservativeDie.js";
import ExpertiseDie from "./terms/ExpertiseDie.js";
import FortuneDie from "./terms/FortuneDie.js";
import MisfortuneDie from "./terms/MisfortuneDie.js";
import RecklessDie from "./terms/RecklessDie.js";
import CheckHelper from "./CheckHelper.js";
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
 * @property {Array} [triggeredEffects]
 * @property {string} [weapon]
 */

/**
 * @typedef {Object} CheckOutcome
 */
//#TODO Merge DicePool & WFRP3eRoll (see feasibility first).
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
					ui.notifications.warn(game.i18n.format("CHECKBUILDER.WARNINGS.convertBack", {
						type: game.i18n.localize(`DIE.${type}.name`)
					}));
			}
			else {
				if(this.dice.characteristic > 0) {
					this.dice.characteristic--;
					this.dice[type]++;
				}
				else
					ui.notifications.warn(game.i18n.format("CHECKBUILDER.WARNINGS.convert", {
						type: game.i18n.localize("DIE.characteristic.name")
					}));
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
			const triggeredEffects = this.checkData.triggeredEffects;
			if(triggeredEffects != null) {
				if(Array.isArray(triggeredEffects))
					for(const effectUuid of triggeredEffects)
						await this.executeEffect(effectUuid, "postScript");
				else
					await this.executeEffect(triggeredEffects, "postScript");
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
	 * Executes scripts from onPreCheckTrigger a WFRP3eEffect.
	 * @param {string} effectUuid The UUID of the WFRP3eEffect.
	 * @param {string} script The type of script to execute.
	 * @returns {Promise<void>}
	 */
	async executeEffect(effectUuid, script = "script")
	{
		const actor = await fromUuid(this.checkData.actor),
			  parameters = [actor, this, this.checkData];

		await fromUuid(effectUuid).then(effect => effect.triggerEffect({
			parameters,
			parameterNames: ["actor", "dicePool", "checkData"],
			script
		}));
	}


	/**
	 * Prepares a dice pool for a characteristic check.
	 * @param {WFRP3eActor}	actor The actor performing the check.
	 * @param {Object} characteristic The checked characteristic.
	 * @param {Object} [options]
	 * @param {string} [options.flavor] Flavor text to add to the outcome description of the check.
	 * @param {string} [options.sound] The path to a sound to play after the check completion.
	 * @returns {Promise<DicePool>} The dice pool built for the characteristic check.
	 */
	static async createFromCharacteristic(actor, characteristic, {flavor = null, sound = null} = {})
	{
		const stance = actor.system.stance.current,
			  checkData = {
				  actor: actor.uuid,
				  characteristic: characteristic.name,
				  challengeLevel: "simple",
				  stance,
				  targets: [...game.user.targets].map(target => target.document.actor.uuid)
			  },
			  dicePool = new DicePool({
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0
				  }
			  }, {checkData, flavor, sound})

		await CheckHelper.triggerCheckPreparationEffects(actor, checkData, dicePool);
		
		return dicePool;
	}

	/**
	 * Prepares a dice pool for a skill check.
	 * @param {WFRP3eActor}	actor The actor performing the check.
	 * @param {WFRP3eItem} skill The checked skill.
	 * @param {Object} [options]
	 * @param {string} [options.flavor] Flavor text to add to the outcome description of the check.
	 * @param {string} [options.sound] The path to a sound to play after the check completion.
	 * @returns {Promise<DicePool>} The dice pool built for the skill check.
	 */
	static async createFromSkill(actor, skill, {flavor = null, sound = null} = {})
	{
		const characteristic = actor.system.characteristics[skill.system.characteristic],
			  stance = actor.system.stance.current,
			  checkData = {
				  actor: actor.uuid,
				  characteristic: skill.system.characteristic,
				  challengeLevel: "simple",
				  skill: skill.uuid,
				  stance,
				  targets: [...game.user.targets].map(target => target.document.actor.uuid)
			  },
			  dicePool = new DicePool({
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  expertise: skill.system.trainingLevel,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0
				  }
			  }, {checkData, flavor, sound});

		await CheckHelper.triggerCheckPreparationEffects(actor, checkData, dicePool);

		return dicePool;
	}

	/**
	 * Prepares a dice pool for an action check.
	 * @param {WFRP3eActor} actor The actor performing the action.
	 * @param {WFRP3eItem} action The action that is performed.
	 * @param {string} face Which face of the action is used.
	 * @param {Object} [options]
	 * @param {WFRP3eItem} [options.weapon] The weapon used alongside the action.
	 * @param {string} [options.flavor] Flavor text to add to the outcome description of the check.
	 * @param {string} [options.sound] The path to a sound to play after the check completion.
	 * @returns {Promise<DicePool>} The dice pool built for the action check.
	 */
	static async createFromAction(actor, action, face, {weapon = null, flavor = null, sound = null} = {})
	{
		const match = action.system[face].check.match(new RegExp(
			`(([\\p{L}\\s]+) \\((\\p{L}+)\\))( ${game.i18n.localize("ACTION.CHECK.against")}\\.? ([\\p{L}\\s]+))?`,
			"u"
		));
		let skill = null,
			characteristicName = skill?.system.characteristic ?? "strength";

		if(match) {
			skill = actor.itemTypes.skill.find((skill) => skill.name === match[2]) ?? skill;
			// Either use the characteristic specified on the action's check,
			// or the characteristic the skill is based upon.
			characteristicName = Object.entries(CONFIG.WFRP3e.characteristics)
				.find((characteristic) => {
					return game.i18n.localize(characteristic[1].abbreviation) === match[3];
				})[0] ?? characteristicName;
		}

		const characteristic = actor.system.characteristics[characteristicName],
			  stance = actor.system.stance.current,
			  checkData = {
				  action: action.uuid,
				  actor: actor.uuid,
				  characteristic: characteristicName,
				  challengeLevel: (["melee", "ranged"].includes(action.system.type) ? "easy" : "simple"),
				  face,
				  skill: skill?.uuid,
				  stance,
				  targets: [...game.user.targets].map(target => target.document.actor.uuid),
				  weapon
			  },
			  target = game.user.targets[0],
			  dicePool = new DicePool({
				  dice: {
					  characteristic: characteristic?.rating - Math.abs(stance) ?? 0,
					  fortune: characteristic?.fortune ?? 0,
					  expertise: skill?.system.trainingLevel ?? 0,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0,
					  challenge: CONFIG.WFRP3e.challengeLevels[checkData.challengeLevel].challengeDice
						  + action.system[face].difficultyModifiers.challengeDice,
					  // Add misfortune dice to the pool if the action is checked against a target's defence,
					  // the check has a target and this target has defence.
					  misfortune: action.system[face].difficultyModifiers.misfortuneDice
						  + (target && match && match[5] === game.i18n.localize("ACTION.CHECK.targetDefence")
							  ? target.system.totalDefence
							  : 0)
				  }
			  }, {checkData, flavor, sound});

		await CheckHelper.triggerCheckPreparationEffects(actor, checkData, dicePool);

		return dicePool;
	}

	/**
	 * Prepares a dice pool for an initiative check.
	 * @param {WFRP3eActor} actor The actor making the initiative check.
	 * @param {WFRP3eCombat} combat The combat document associated with the initiative check.
	 * @param {Object} [options]
	 * @param {string} [options.flavor] Flavor text to add to the outcome description of the check.
	 * @param {string} [options.sound] The path to a sound to play after the check completion.
	 * @returns {Promise<DicePool>} The dice pool built for the initiative check.
	 */
	static async createFromInitiative(actor, combat, {flavor = null, sound = null} = {})
	{
		const characteristic = actor.system.characteristics[combat.initiativeCharacteristic],
			  stance = actor.system.stance.current ?? actor.system.stance,
			  checkData = {
				  actor: actor.uuid,
				  characteristic,
				  challengeLevel: "simple",
				  combat,
				  stance
			  },
			  dicePool = new DicePool({
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0
				  }
			  }, {checkData, flavor, sound})

		await CheckHelper.triggerCheckPreparationEffects(actor, checkData, dicePool);

		return dicePool;
	}
}
