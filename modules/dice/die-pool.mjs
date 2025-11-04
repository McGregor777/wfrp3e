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

/**
 * Die pool utility helps prepare WFRP3e's special die pools.
 * @property {Object} dice The various dice that will be rolled.
 * @property {Object} symbols The various symbols that will be added to the results of the check once the rolled.
 * @property {CheckData} [checkData] Contains various data concerning the check of the die pool.
 * @property {string} [flavor] A flavor text.
 * @property {string} [sound] An audio file path.
 */
export default class DiePool
{
	/**
	 * @param {Object} [startingPool]
	 * @param {CheckData} [checkData] Contains various data concerning the check of the die pool.
	 * @param {string} [flavor] A flavor text.
	 * @param {string} [sound] An audio file path.
	 */
	constructor(startingPool = {}, checkData = null, flavor = null, sound = null)
	{
		this.dice = {};
		if(typeof startingPool.dice === "object")
			for(const key of Object.keys(startingPool.dice))
				this.dice[key] = +startingPool.dice[key] || 0;

		this.symbols = {};
		if(typeof startingPool.symbols === "object")
			for(const key of Object.keys(startingPool.symbols))
				this.symbols[key] = +startingPool.symbols[key] || 0;

		if(checkData?.actor) {
			const actor = fromUuidSync(checkData.actor);

			if(actor.type === "creature")
				checkData.creatureDice = {
					aggression: 0,
					cunning: 0,
					expertise: 0
				}
		}

		this.checkData = checkData;
		this.flavor = flavor;
		this.sound = sound;
	}

	/**
	 * Transforms the die pool values into a rollable formula.
	 * @returns {string} A rollable formula.
	 */
	get formula()
	{
		const diceFormulas = [
			this.dice.characteristic + "d" + wfrp3e.dice.terms.CharacteristicDie.DENOMINATION,
			this.dice.fortune + "d" + wfrp3e.dice.terms.FortuneDie.DENOMINATION,
			this.dice.expertise + "d" + wfrp3e.dice.terms.ExpertiseDie.DENOMINATION,
			this.dice.conservative + "d" + wfrp3e.dice.terms.ConservativeDie.DENOMINATION,
			this.dice.reckless + "d" + wfrp3e.dice.terms.RecklessDie.DENOMINATION,
			this.dice.challenge + "d" + wfrp3e.dice.terms.ChallengeDie.DENOMINATION,
			this.dice.misfortune + "d" + wfrp3e.dice.terms.MisfortuneDie.DENOMINATION
		];
		let formula = "";

		for(const diceFormula of diceFormulas)
			if(diceFormula.split(/([0-9]+)/)[1] > 0)
				formula = formula ? `${formula} + ${diceFormula}` : diceFormula;

		return formula;
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
	 * Adds another die pool to the current one.
	 * @param {DiePool} [otherDiePool]
	 */
	addDiePool(otherDiePool)
	{
		if(typeof otherDiePool.dice === "object")
			for(const key of Object.keys(otherDiePool.dice))
				this.dice[key] += +otherDiePool.dice[key] || 0;

		if(typeof otherDiePool.symbols === "object")
			for(const key of Object.keys(otherDiePool.symbols))
				this.symbols[key] += +otherDiePool.symbols[key] || 0;
	}

	/**
	 * Converts any remaining characteristic die from the die pool into a stance die.
	 * @param {string} type The type of die the characteristic die must be converted to.
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
	determineDiePoolFromCheckData()
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
			throw new Error("Cannot determine diePool from checkData without an Actor");
	}

	/**
	 * Rolls the die pool, then shows the results in a message.
	 * @returns {Promise<{CheckRoll}>}
	 */
	async roll()
	{
		const checkData = this.checkData;
		let actor = checkData?.actor;

		if(checkData) {
			if(actor) {
				const fortunePoints = this.checkData.fortunePoints;
				actor = await fromUuid(checkData.actor);

				// Remove the fortune points spent on the check from the actor and/or party.
				if(actor.type === "character" && fortunePoints > 0) {
					const updates = {"system.fortune.value": Math.max(actor.system.fortune.value - fortunePoints, 0)};

					if(fortunePoints > actor.system.fortune.value) {
						const party = actor.system.currentParty;
						party.update({"system.fortunePool": Math.max(party.system.fortunePool - (fortunePoints - actor.system.fortune.value), 0)})
					}

					actor.update(updates);
				}
				// Remove the attribute dice spent on the check from the creature.
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

		const checkRoll = await wfrp3e.dice.CheckRoll.create(
			this.formula,
			actor ? actor.getRollData() : {},
			{checkData, flavor: this.flavor, startingSymbols: this.symbols}
		).toMessage({
			flavor: this.name,
			speaker: {actor}
		});

		if(this.sound)
			AudioHelper.play({src: this.sound}, true);

		return checkRoll;
	}

	/**
	 * Executes scripts from onPreCheckTrigger an active effect.
	 * @param {string} effectUuid The uuid of the active effect.
	 * @param {string} script The type of script to execute.
	 * @returns {Promise<void>}
	 */
	async executeEffect(effectUuid, script = "script")
	{
		const actor = await fromUuid(this.checkData.actor),
			  effect = await fromUuid(effectUuid);

		await effect.triggerEffect({actor, diePool: this, checkData: this.checkData}, script);
	}


	/**
	 * Prepares a die pool for a characteristic check.
	 * @param {Actor}	actor The actor performing the check.
	 * @param {Object} characteristic The checked characteristic.
	 * @param {Object} [options]
	 * @param {string} [options.flavor] Flavor text to add to the outcome description of the check.
	 * @param {string} [options.sound] The path to a sound to play after the check completion.
	 * @returns {Promise<DiePool>} The die pool built for the characteristic check.
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
			  diePool = new DiePool({
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0
				  }
			  }, checkData, flavor, sound)

		await wfrp3e.dice.CheckHelper.triggerCheckPreparationEffects(actor, checkData, diePool);
		
		return diePool;
	}

	/**
	 * Prepares a die pool for a skill check.
	 * @param {Actor} actor The actor performing the check.
	 * @param {Item} skill The checked skill.
	 * @param {Object} [options]
	 * @param {string} [options.flavor] Flavor text to add to the outcome description of the check.
	 * @param {string} [options.sound] The path to a sound to play after the check completion.
	 * @returns {Promise<DiePool>} The die pool built for the skill check.
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
			  diePool = new DiePool({
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  expertise: skill.system.trainingLevel,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0
				  }
			  }, checkData, flavor, sound);

		await wfrp3e.dice.CheckHelper.triggerCheckPreparationEffects(actor, checkData, diePool);

		return diePool;
	}

	/**
	 * Prepares a die pool for an action check.
	 * @param {Actor} actor The actor performing the action.
	 * @param {Item} action The action that is performed.
	 * @param {string} face Which face of the action is used.
	 * @param {Object} [options]
	 * @param {Item} [options.weapon] The weapon used alongside the action.
	 * @param {string} [options.flavor] Flavor text to add to the outcome description of the check.
	 * @param {string} [options.sound] The path to a sound to play after the check completion.
	 * @returns {Promise<DiePool>} The die pool built for the action check.
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
			  diePool = new DiePool({
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
			  }, checkData, flavor, sound);

		await wfrp3e.dice.CheckHelper.triggerCheckPreparationEffects(actor, checkData, diePool);

		return diePool;
	}

	/**
	 * Prepares a die pool for an initiative check.
	 * @param {Actor} actor The actor making the initiative check.
	 * @param {Combat} combat The combat document associated with the initiative check.
	 * @param {Object} [options]
	 * @param {string} [options.flavor] Flavor text to add to the outcome description of the check.
	 * @param {string} [options.sound] The path to a sound to play after the check completion.
	 * @returns {Promise<DiePool>} The die pool built for the initiative check.
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
			  diePool = new DiePool({
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0
				  }
			  }, checkData, flavor, sound)

		await wfrp3e.dice.CheckHelper.triggerCheckPreparationEffects(actor, checkData, diePool);

		return diePool;
	}
}
