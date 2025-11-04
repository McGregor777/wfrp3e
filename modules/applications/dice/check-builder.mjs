/** @inheritDoc */
export default class CheckBuilder extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);
		this.diePool = options.diePool ?? new wfrp3e.dice.DiePool();

		if(this.diePool.checkData?.action) {
			const checkData = this.diePool.checkData;
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
		pools: {template: "systems/wfrp3e/templates/applications/dice/check-builder/pools.hbs"},
		quickSettings: {template: "systems/wfrp3e/templates/applications/dice/check-builder/quick-settings.hbs"},
		settings: {template: "systems/wfrp3e/templates/applications/dice/check-builder/settings.hbs"},
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
	 * The die pool that is being built by the Check Builder.
	 * @type {DiePool}
	 */
	diePool;

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
			checkData: this.diePool.checkData,
			buttons: [{type: "submit", icon: "fa-solid fa-d8", label: "CHECKBUILDER.ACTIONS.rollCheck"}],
			dice: wfrp3e.dice.terms.getSpecialDieClasses(),
			diePool: this.diePool,
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
				let totalDice = 0;
				for(const dice of Object.values(this.diePool.dice))
					totalDice += +dice;

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

				partContext = {
					...partContext,
					height,
					width,
					symbols: CONFIG.WFRP3e.symbols
				};
				break;
			case "quickSettings":
				if(this.diePool.checkData?.actor) {
					const checkData = this.diePool.checkData,
						  actor = await fromUuid(checkData.actor);

					partContext = {
						...partContext,
						actor: actor,
						challengeLevel: checkData.challengeLevel,
						challengeLevels: CONFIG.WFRP3e.challengeLevels,
						characteristic: checkData.characteristic,
						characteristics: wfrp3e.data.actors.Actor.CHARACTERISTICS,
						fortunePoints: checkData.fortunePoints || 0,
						skill: await fromUuid(checkData.skill),
						skills: actor.itemTypes.skill,
						availableTriggeredEffects: actor.findTriggeredEffects(
							"onPreCheckTrigger",
							{actor, diePool: this.diePool, checkData}
						),
						triggeredEffects: checkData.triggeredEffects ?? []
					};

					if(actor.type === "character") {
						const availableSpecialisations = [];
						for(const skill of actor.itemTypes.skill)
							if(skill.system.specialisations)
								availableSpecialisations.push(
									...skill.system.specialisations.split(",").map(specialisation => specialisation.trim())
								);

						partContext = {
							...partContext,
							availableSpecialisations,
							maxFortunePoints: actor.system.fortune.value
								+ (actor.system.currentParty?.system.fortunePool || 0),
							specialisations: checkData.specialisations ?? []
						};
					}
					else if(actor.type === "creature")
						partContext.attributes = actor.system.attributes;

					if(checkData.action) {
						const action = await fromUuid(checkData.action);
						partContext.action = action;

						if(["melee", "ranged"].includes(action.system.type)) {
							const Weapon = wfrp3e.data.items.Weapon,
								  validWeaponGroups = [];
							for(const [key, weaponGroup] of Object.entries(Weapon.GROUPS))
								if(weaponGroup.type === action.system.type)
									validWeaponGroups.push(key);

							partContext.availableWeapons = action.actor.items.search({
								filters: [{
									field: "type",
									operator: "equals",
									value: "weapon"
								}, {
									field: "system.group",
									operator: "contains",
									value: validWeaponGroups
								}]
							});

							if(actor.type === "character")
								for(const commonWeapon of Object.values(Weapon.COMMON_WEAPONS))
									if(validWeaponGroups.includes(commonWeapon.system.type))
										partContext.availableWeapons.push(commonWeapon);

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

		if(group === "sheet" && !this.diePool.checkData) {
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
		const diePool = this.diePool,
			  checkData = diePool.checkData,
			  form = event.currentTarget,
			  formData = new FormDataExtended(form);
		let value = formData.object[event.target.name];

		// Filter out null values in Arrays.
		if(Array.isArray(value))
			value = value.filter(value => value);

		foundry.utils.setProperty(diePool, event.target.name, value);

		if(event.target.name.startsWith("checkData"))
			await diePool.determineFromCheckData();

		if(checkData) {
			// Execute the scripts from all onCheckPreparation action effects.
			if(checkData.actor)
				await wfrp3e.dice.CheckHelper.triggerCheckPreparationEffects(
					await fromUuid(checkData.actor), checkData, diePool
				);

			// Execute the scripts from all selected effects.
			const triggeredEffects = checkData.triggeredEffects;
			if(triggeredEffects != null) {
				if(Array.isArray(triggeredEffects))
					for(const effectUuid of triggeredEffects)
						await diePool.executeEffect(effectUuid);
				else
					await diePool.executeEffect(triggeredEffects);
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

		this.diePool[target.dataset.type][target.dataset.subtype] += amount;
		await this.render();
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

		this.diePool.convertCharacteristicDie(target.dataset.type, amount);
		await this.render();
	}

	/**
	 * Processes form submission for the Check Builder.
	 * @this {CheckBuilder} The handler is called with the application as its bound scope.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 * @returns {DiePool} The built die pool.
	 * @private
	 */
	static #onCheckBuilderSubmit(event, form, formData)
	{
		this.options.submit(this.diePool);
	}

	/**
	 * Spawns a Check Builder and waits for it to be dismissed or submitted.
	 * @param {ApplicationConfiguration} [config] Configuration of the Check Builder instance
	 * @returns {Promise<any>} Resolves to the built die pool. If the dialog was dismissed, the Promise resolves to null.
	 */
	static async wait(config = {})
	{
		return new Promise(async (resolve, reject) => {
			// Wrap the submission handler with Promise resolution.
			config.submit = async result => {resolve(result)};
			const builder = new this(config);
			builder.addEventListener("close", event => reject(), {once: true});
			await builder.render({force: true});
		});
	}
}
