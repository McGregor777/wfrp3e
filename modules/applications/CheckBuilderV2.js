import DicePool from "../DicePool.js";
import CheckHelper from "../CheckHelper.js";

/** @inheritDoc */
export default class CheckBuilderV2 extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	constructor(options={})
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
		window: {title: "CHECKBUILDER.TITLES.checkBuilder"},
		//actions: {},
		form: {
			handler: this._handleForm,
			submitOnChange: false,
			closeOnSubmit: true
		},
		position: {
			top: 50,
			width: 500
		}
	}

	/** @inheritDoc */
	static PARTS = {
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		pools: {template: "systems/wfrp3e/templates/applications/check-builder-v2/pools.hbs"},
		quickSettings: {template: "systems/wfrp3e/templates/applications/check-builder-v2/quick-settings.hbs"},
		settings: {template: "systems/wfrp3e/templates/applications/check-builder-v2/settings.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	}

	/** @inheritDoc */
	tabGroups = {primary: "quickSettings"};

	/**
	 * @type {DicePool}
	 */
	dicePool;

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			checkData: this.dicePool.checkData,
			dice: CONFIG.WFRP3e.dice,
			dicePool: this.dicePool
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		switch(partId) {
			case "tabs":
				context.tabs = this._getTabs();
				break;
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
				context = {
					...context,
					height,
					tab: context.tabs[partId],
					width
				};
				break;
			case "quickSettings":
				context.tab = context.tabs[partId];

				if(this.dicePool.checkData?.actor) {
					const checkData = this.dicePool.checkData,
						  actor = await fromUuid(checkData.actor);

					context = {
						...context,
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
						context = {
							...context,
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
						context.attributes = actor.system.attributes;

					if(checkData.action) {
						const action = await fromUuid(checkData.action);
						context.action = action;

						if(["melee", "ranged"].includes(action.system.type)) {
							const validWeaponGroups = Object.entries(CONFIG.WFRP3e.weapon.groups)
								.reduce((array, weaponGroup) => {
									if(weaponGroup[1].type === action.system.type)
										array.push(weaponGroup[0]);
									return array;
								}, []);

							context.availableWeapons = [
								...action.actor.itemTypes.weapon
									.filter(weapon => validWeaponGroups.includes(weapon.system.group))
							];

							if(actor.type === "character") {
								if(action.system.type === "melee")
									context.availableWeapons.push(
										CONFIG.WFRP3e.weapon.commonWeapons.improvisedWeapon,
										CONFIG.WFRP3e.weapon.commonWeapons.unarmed
									);
								else
									context.availableWeapons.push(CONFIG.WFRP3e.weapon.commonWeapons.improvised);
							}

							if(!checkData.weapon && context.availableWeapons?.length)
								checkData.weapon = context.availableWeapons[0]?.uuid;
						}
					}
				}
				break;
			case "settings":
				context.tab = context.tabs[partId];
				break;
			case "footer":
				context.buttons = this._getFooterButtons();
				break;
		}

		return context;
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

		// Execute the scripts from all OnCheckPreparation WFRP3eEffects.
		if(checkData?.actor)
			await CheckHelper.triggerCheckPreparationEffects(await fromUuid(checkData.actor), checkData, dicePool.dice);

		// Execute the scripts from all selected items.
		const triggeredItems = checkData.triggeredItems;
		if(triggeredItems != null) {
			if(Array.isArray(triggeredItems))
				for(const itemUuid of triggeredItems)
					await dicePool.executeItemEffects(itemUuid);
			else
				await dicePool.executeItemEffects(triggeredItems);
		}

		await this.render();

		super._onChangeForm(formConfig, event);
	}

	/**
	 * Prepares an array of form header tabs.
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @protected
	 */
	_getTabs()
	{
		const tabs = {
			quickSettings: {id: "quickSettings", group: "primary", label: "CHECKBUILDER.TABS.quickSettings"},
			settings: {id: "settings", group: "primary", label: "CHECKBUILDER.TABS.settings"}
		};

		if(this.dicePool.checkData)
			for(const value of Object.values(tabs)) {
				value.active = this.tabGroups[value.group] === value.id;
				value.cssClass = value.active ? "active" : "";
			}
		else {
			delete tabs.quickSettings;
			this.tabGroups.primary = "settings";
			tabs.settings = foundry.utils.mergeObject(tabs.settings, {active: true, cssClass: "active"});
		}

		return tabs;
	}

	/**
	 * Prepares an array of form footer buttons.
	 * @returns {Partial<FormFooterButton>[]}
	 * @protected
	 */
	_getFooterButtons()
	{
		return [{type: "submit", icon: "fa-solid fa-d8", label: "CHECKBUILDER.ACTIONS.rollCheck"}]
	}

	/**
	 * Processes form submission for the Check Builder.
	 * @this {CheckBuilderV2} The handler is called with the application as its bound scope.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 * @returns {Promise<void>}
	 * @protected
	 */
	static async _handleForm(event, form, formData)
	{
		this.dicePool.roll();
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

		await new CheckBuilderV2({
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

		await new CheckBuilderV2({
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

		await new CheckBuilderV2({
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
				  characteristic: combat.initiativeCharacteristic,
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