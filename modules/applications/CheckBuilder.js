import DicePool from "../DicePool.js";
import CheckHelper from "../CheckHelper.js";

/** @inheritDoc */
export default class CheckBuilder extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);
		this.dicePool = options.dicePool ?? new DicePool();

		if(this.dicePool.checkData?.action) {
			const checkData = this.dicePool.checkData;
			checkData.challengeLevel = ["melee", "ranged"].includes(fromUuidSync(checkData.action).system.type)
				? "easy"
				: "simple";
		}
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "check-builder-{id}",
		classes: ["wfrp3e", "check-builder"],
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			title: "CHECKBUILDER.TITLES.checkBuilder"
		},
		actions: {
			adjustAmount: {handler: this.#adjustAmount, buttons: [0, 2]},
			convertCharacteristicDie: {handler: this.#convertCharacteristicDie, buttons: [0, 2]}
		},
		form: {
			handler: this.#onCheckBuilderSubmit,
			submitOnChange: false,
			closeOnSubmit: true
		},
		position: {
			width: 500,
			height: "auto",
			top: 40
		}
	};

	/** @inheritDoc */
	static PARTS = {
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		pools: {template: "systems/wfrp3e/templates/applications/check-builder/pools.hbs"},
		quickSettings: {template: "systems/wfrp3e/templates/applications/check-builder/quick-settings.hbs"},
		settings: {template: "systems/wfrp3e/templates/applications/check-builder/settings.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "quickSettings", icon: "fa-solid fa-bolt"},
				{id: "settings", icon: "fa-solid fa-sliders"}
			],
			initial: "quickSettings",
			labelPrefix: "CHECKBUILDER.TABS"
		}
	};

	/**
	 * @type {DicePool}
	 */
	dicePool;

	/** @inheritDoc */
	_preSyncPartState(partId, newElement, priorElement, state)
	{
		super._preSyncPartState(partId, newElement, priorElement, state);

		if(partId === "settings")
			state.symbolsPoolOpen = priorElement.querySelector("details.symbols-pool-container")?.open;
	}

	/** @inheritDoc */
	_syncPartState(partId, newElement, priorElement, state)
	{
		if(state.symbolsPoolOpen)
			newElement.querySelector("details.symbols-pool-container").open = true;

		super._syncPartState(partId, newElement, priorElement, state);
	}

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			checkData: this.dicePool.checkData,
			buttons: [{type: "submit", icon: "fa-solid fa-d8", label: "CHECKBUILDER.ACTIONS.rollCheck"}],
			dice: CONFIG.WFRP3e.dice,
			dicePool: this.dicePool,
			rootId: this.id
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partContext.tabs && partId in partContext.tabs)
			partContext.tab = partContext.tabs[partId];

		switch(partId) {
			case "pools":
				const totalDice = Object.values(this.dicePool.dice).reduce((accumulator, dice) => accumulator + +dice, 0);

				// Adjust dice icons' size.
				let height = 48;
				let width = 48;

				if(totalDice > 15) {
					height = 12;
					width = 12;
				}
				else if(totalDice > 10) {
					height = 24;
					width = 24;
				}
				else if(totalDice > 7) {
					height = 36;
					width = 36;
				}

				partContext = {...partContext,
					height,
					width,
					symbols: CONFIG.WFRP3e.symbols
				};
				break;
			case "quickSettings":
				if(this.dicePool.checkData?.actor) {
					const checkData = this.dicePool.checkData,
						  actor = await fromUuid(checkData.actor);

					partContext = {
						...partContext,
						actor: actor,
						challengeLevel: checkData.challengeLevel,
						challengeLevels: CONFIG.WFRP3e.challengeLevels,
						characteristic: checkData.characteristic,
						characteristics: Object.entries(CONFIG.WFRP3e.characteristics).reduce((object, characteristic) => {
							if(characteristic[0] !== "varies")
								object[characteristic[0]] = characteristic[1].name;
							return object;
						}, {}),
						fortunePoints: checkData.fortunePoints ?? 0,
						skill: await fromUuid(checkData.skill),
						skills: actor.itemTypes.skill,
						availableTriggeredItems: actor.findTriggeredItems(
							"onPreCheckTrigger", {
								parameters: [actor, this.dicePool, checkData],
								parameterNames: ["actor", "dicePool", "checkData"]
							}),
						triggeredItems: checkData.triggeredItems ?? []
					};

					if(actor.type === "character") {
						partContext = {
							...partContext,
							availableSpecialisations: actor.itemTypes.skill
								.filter(skill => skill.system.specialisations)
								.reduce((specialisations, skill) => {
									specialisations.push(
										...skill.system.specialisations.split(",").map(
											specialisation => specialisation.trim()
										)
									);
									return specialisations;
								}, []),
							maxFortunePoints: actor.system.fortune.value
								+ (actor.system.currentParty?.system.fortunePool ?? 0),
							specialisations: checkData.specialisations ?? []
						};
					}
					else if(actor.type === "creature")
						partContext.attributes = actor.system.attributes;

					if(checkData.action) {
						const action = await fromUuid(checkData.action);
						partContext.action = action;

						if(["melee", "ranged"].includes(action.system.type)) {
							const validWeaponGroups = Object.entries(CONFIG.WFRP3e.weapon.groups)
								.reduce((array, weaponGroup) => {
									if(weaponGroup[1].type === action.system.type)
										array.push(weaponGroup[0]);
									return array;
								}, []);

							partContext.availableWeapons = [
								...action.actor.itemTypes.weapon
									.filter(weapon => validWeaponGroups.includes(weapon.system.group))
							];

							if(actor.type === "character") {
								if(action.system.type === "melee")
									partContext.availableWeapons.push(
										CONFIG.WFRP3e.weapon.commonWeapons.improvisedWeapon,
										CONFIG.WFRP3e.weapon.commonWeapons.unarmed
									);
								else
									partContext.availableWeapons.push(CONFIG.WFRP3e.weapon.commonWeapons.improvised);
							}

							if(!checkData.weapon && partContext.availableWeapons?.length)
								checkData.weapon = partContext.availableWeapons[0]?.uuid;
						}
					}
				}
				break;
		}

		return partContext;
	}

	/** @inheritDoc */
	_prepareTabs(group)
	{
		let tabs = super._prepareTabs(group);

		if(group === "sheet" && !this.dicePool.checkData) {
			tabs.quickSettings = {
				...tabs.quickSettings,
				active: false,
				cssClass: "hidden"
			};

			tabs.settings = {
				...tabs.settings,
				active: true,
				cssClass: "active"
			};
		}

		return tabs;
	}

	/** @inheritDoc */
	async _onChangeForm(formConfig, event)
	{
		const dicePool = this.dicePool,
			  checkData = dicePool.checkData,
			  form = event.currentTarget,
			  formData = new FormDataExtended(form);
		let value = formData.object[event.target.name];

		// Filter out null values in Arrays.
		if(Array.isArray(value))
			value = value.filter(value => value);

		foundry.utils.setProperty(dicePool, event.target.name, value);

		if(event.target.name.startsWith("checkData"))
			dicePool.determineDicePoolFromCheckData();

		if(checkData) {
			// Execute the scripts from all OnCheckPreparation WFRP3eEffects.
			if(checkData.actor)
				await CheckHelper.triggerCheckPreparationEffects(await fromUuid(checkData.actor), checkData, dicePool);

			// Execute the scripts from all selected items.
			const triggeredItems = checkData.triggeredItems;
			if(triggeredItems != null) {
				if(Array.isArray(triggeredItems))
					for(const itemUuid of triggeredItems)
						await dicePool.executeItemEffects(itemUuid);
				else
					await dicePool.executeItemEffects(triggeredItems);
			}
		}

		await this.render();

		super._onChangeForm(formConfig, event);
	}

	/**
	 * Adjusts the amount of dice of a specific type depending on the clicked element.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #adjustAmount(event, target)
	{
		let amount = 0;

		switch(event.button) {
			case 0:
				amount = 1;
				break;
			case 2:
				amount = -1;
				break;
		}

		this.dicePool[target.dataset.type][target.dataset.subtype] += amount;
		this.render();
	}

	/**
	 * Converts a characteristic die into a conservative or reckless die, or converts a conservative/reckless die into a
	 * characteristic die depending on the button clicked.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #convertCharacteristicDie(event, target)
	{
		event.preventDefault();

		let amount = 0;

		switch(event.button) {
			case 0:
				amount = 1;
				break;
			case 2:
				amount = -1;
				break;
		}

		this.dicePool.convertCharacteristicDie(target.dataset.type, amount);
		this.render();
	}

	/**
	 * Processes form submission for the Check Builder.
	 * @this {CheckBuilder} The handler is called with the application as its bound scope.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #onCheckBuilderSubmit(event, form, formData)
	{
		await this.dicePool.roll();
	}

	/**
	 * Prepares a Characteristic check then opens the Check Builder afterwards.
	 * @param {WFRP3eActor}	actor The WFRP3eActor performing the check.
	 * @param {Object} characteristic The Characteristic used for the check.
	 * @param {Object} [options]
	 * @param {String} [options.flavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {String} [options.sound] Some sound to play after the Skill check completion.
	 * @returns {Promise<void>} The DicePool for a characteristic check.
	 */
	static async prepareCharacteristicCheck(actor, characteristic, {flavor = null, sound = null} = {})
	{
		const stance = actor.system.stance.current,
			  checkData = {
				  actor: actor.uuid,
				  characteristic: characteristic.name,
				  challengeLevel: "simple",
				  stance,
				  targets: [...game.user.targets].map(target => target.document.actor.uuid)
			  },
			  startingPool = {
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  expertise: 0,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0,
					  challenge: 0,
					  misfortune: 0
				  }
			  };

		await CheckHelper.triggerCheckPreparationEffects(actor, checkData, startingPool);
		await new CheckBuilder({
			dicePool: new DicePool(startingPool, {checkData, flavor, sound})
		}).render(true);
	}

	/**
	 * Prepares a Skill check then opens the Dice Pool Builder afterwards.
	 * @param {WFRP3eActor}	actor The WFRP3eActor performing the check.
	 * @param {WFRP3eItem} skill The Skill used for the check.
	 * @param {Object} [options]
	 * @param {String} [options.flavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {String} [options.sound] Some sound to play after the Skill check completion.
	 * @returns {Promise<void>} The DicePool for an skill check.
	 */
	static async prepareSkillCheck(actor, skill, {flavor = null, sound = null} = {})
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
			  startingPool = {
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  expertise: skill.system.trainingLevel,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0,
					  challenge: 0,
					  misfortune: 0
				  }
			  };

		await CheckHelper.triggerCheckPreparationEffects(actor, checkData, startingPool);

		await new CheckBuilder({
			dicePool: new DicePool(startingPool, {checkData, flavor, sound})
		}).render(true);
	}

	/**
	 * Prepares an Action check then opens the Dice Pool Builder afterwards.
	 * @param {WFRP3eActor} actor The WFRP3eActor using the Action.
	 * @param {WFRP3eItem} action The Action that is used.
	 * @param {string} face The Action face.
	 * @param {Object} [options]
	 * @param {WFRP3eItem} [options.weapon] The weapon used alongside the Action.
	 * @param {String} [options.flavor] Some flavor text to add to the Action check's outcome description.
	 * @param {String} [options.sound] Some sound to play after the Action check completion.
	 * @returns {Promise<void>} The DicePool for an action check.
	 */
	static async prepareActionCheck(actor, action, face, {weapon = null, flavor = null, sound = null} = {})
	{
		const match = action.system[face].check.match(new RegExp(
			"(([\\p{L}\\s]+) \\((\\p{L}+)\\))( " +
			game.i18n.localize("ACTION.CHECK.against") +
			"\\.? ([\\p{L}\\s]+))?", "u")
		);
		let skill = null,
			characteristicName = skill?.system.characteristic ?? "strength";

		if(match) {
			skill = actor.itemTypes.skill.find((skill) => skill.name === match[2]) ?? skill;
			// Either get the Characteristic specified on the Action's check, or use the Characteristic used by the Skill.
			characteristicName = Object.entries(CONFIG.WFRP3e.characteristics).find((characteristic) => {
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
				  targets: [...game.user.targets].map(target => target.document.actor.uuid)
			  },
			  startingPool = {
				  dice: {
					  characteristic: characteristic?.rating - Math.abs(stance) ?? 0,
					  fortune: characteristic?.fortune ?? 0,
					  expertise: skill?.system.trainingLevel ?? 0,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0,
					  challenge: CONFIG.WFRP3e.challengeLevels[checkData.challengeLevel].challengeDice
						  + action.system[face].difficultyModifiers.challengeDice,
					  misfortune: action.system[face].difficultyModifiers.misfortuneDice
						  + (match && match[5] === game.i18n.localize("ACTION.CHECK.targetDefence")
						  	&& checkData.targets.length > 0
								  ? await fromUuid(checkData.targets[0]).then(actor => actor.system.totalDefence)
								  : 0)
				  }
			  }

		if(weapon)
			checkData.weapon = weapon;

		await CheckHelper.triggerCheckPreparationEffects(actor, checkData, startingPool);

		await new CheckBuilder({
			dicePool: new DicePool(startingPool, {checkData, flavor, sound})
		}).render(true);
	}

	/**
	 * Prepares an initiative check.
	 * @param {WFRP3eActor} actor The Character making the initiative check.
	 * @param {WFRP3eCombat} combat The Combat document associated with the initiative check.
	 * @param {Object} [options]
	 * @param {String} [options.flavor] Some flavor text to add to the Skill check's outcome description.
	 * @param {String} [options.sound] Some sound to play after the Skill check completion.
	 * @returns {DicePool} The DicePool for an initiative check.
	 */
	static async prepareInitiativeCheck(actor, combat, {flavor = null, sound = null} = {})
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
			  startingPool = {
				  dice: {
					  characteristic: characteristic.rating - Math.abs(stance),
					  fortune: characteristic.fortune,
					  expertise: 0,
					  conservative: stance < 0 ? Math.abs(stance) : 0,
					  reckless: stance > 0 ? stance : 0,
					  challenge: 0,
					  misfortune: 0
				  }
			  }

		await CheckHelper.triggerCheckPreparationEffects(actor, checkData, startingPool);

		return new DicePool(startingPool, {checkData, flavor, sound});
	}
}