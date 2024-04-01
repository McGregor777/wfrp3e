import DicePool from "../DicePool.js";

/** @inheritDoc */
export default class DicePoolBuilder extends FormApplication
{
	constructor(object = new DicePool(), options = {})
	{
		super(object, options);
	}

	/** @inheritDoc */
	get title()
	{
		if(this.object.checkData) {
			const checkData = this.object.checkData;

			if(checkData.combat)
				return game.i18n.localize("ROLL.InitiativeCheckBuilder");
			else if(checkData.action)
				return game.i18n.format("ROLL.ActionCheckBuilder", {action: checkData.action.name});
			else if(checkData.skill)
				return game.i18n.format("ROLL.SkillCheckBuilder", {skill: checkData.skill.name});
			else if(checkData.characteristic)
				return game.i18n.format("ROLL.CharacteristicCheckBuilder", {
					characteristic: game.i18n.localize(CONFIG.WFRP3e.characteristics[checkData.characteristic.name].name)
				});
		}

		return game.i18n.localize("ROLL.CheckBuilder");
	}

	/** @inheritDoc */
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "dice-pool-builder"],
			template: "systems/wfrp3e/templates/applications/dice-pool-builder.hbs",
			width: 640
		};
	}

	/** @inheritDoc */
	async getData()
	{
		const data = {
			...super.getData(),
			challengeLevel: ["melee", "ranged"].includes(this.object.checkData?.action?.system.type) ? "easy" : "simple",
			challengeLevels: CONFIG.WFRP3e.challengeLevels,
			diceIcons: {
				...Object.entries(CONFIG.WFRP3e.dice).reduce((object, dieType) => {
					object[dieType[0]] = dieType[1].icon;
					return object;
				}, {})
			},
			flavor: this.object.flavor,
			isGM: game.user.isGM,
			sounds: [],
			users: [{name: "Send To All", id: "all"}]
		};

		if(game.user.isGM) {
			game.users.contents.forEach((user) => {
				if(user.visible && user.id !== game.user.id)
					data.users.push({name: user.name, id: user.id});
			});
		}

		if(this.object.checkData) {
			const checkData = this.object.checkData;
			checkData.challengeLevel = data.challengeLevel;

			if(checkData.actor) {
				const actor = checkData.actor;

				data.actor = actor;
				data.characteristics = Object.entries(CONFIG.WFRP3e.characteristics).reduce((object, characteristic) => {
					if(characteristic[0] !== "varies")
						object[characteristic[0]] = characteristic[1].name;
					return object;
				}, {});
				data.skills = actor.itemTypes.skill;

				if(actor.type === "character") {
					data.maxFortunePoints = actor.system.fortune.value + actor.system.currentParty.system.fortunePool;
					data.specialisations = actor.itemTypes.skill
						.filter(skill => skill.system.specialisations)
						.reduce((specialisations, skill) => {
							specialisations.push(
								...skill.system.specialisations.split(",").map(specialisation => specialisation.trim()
							)
						);
						return specialisations;
					}, []);
				}
				else if(actor.type === "creature")
					data.attributes = actor.system.attributes;
			}

			if(checkData.characteristic)
				data.characteristic = checkData.characteristic;

			if(checkData.skill)
				data.skill = checkData.skill;

			if(checkData.characteristic)
				data.characteristic = checkData.characteristic;

			if(checkData.action) {
				const action = checkData.action;
				data.action = action;

				if(["melee", "ranged"].includes(action.system.type)) {
					data.availableWeapons = action.actor.itemTypes.weapon.filter(weapon => {
						return Object.entries(CONFIG.WFRP3e.weapon.groups).reduce((array, weaponGroup) => {
							if(weaponGroup[1].type === action.system.type)
								array.push(weaponGroup[0]);
							return array;
						}, []).includes(weapon.system.group);
					});

					data.weapon = checkData.weapon ?? Object.values(data.availableWeapons)[0];
					checkData.weapon = Object.values(data.availableWeapons)[0];
				}
			}
		}

		return data;
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		this._synchronizeInputs(html);

		html.find(".pool-container")
			.click(this._onPoolContainerInputLeftClick.bind(this, html))
			.contextmenu(this._onPoolContainerInputRightClick.bind(this, html));

		html.find(".convert-buttons button")
			.click(this._onConversionButtonLeftClick.bind(this, html))
			.contextmenu(this._onConversionButtonRightClick.bind(this, html));

		html.find(".challenge-level-select").change(this._onChallengeLevelSelectChange.bind(this, html));
		html.find(".characteristic-select").change(this._onCharacteristicSelectChange.bind(this, html));
		html.find(".skill-select").change(this._onSkillSelectChange.bind(this, html));
		html.find(".weapon-select").change(this._onWeaponSelectChange.bind(this));

		html.find(".extend-button").click(this._onExtendButtonClick.bind(this));
	}

	/** @inheritDoc */
	async _onChangeInput(event)
	{
		await super._onChangeInput(event);

		let value = [];
		for(const element of $(event.delegateTarget).find(`[name="${event.currentTarget.name}"]`)) {
			if(element.type === "checkbox") {
				if(element.checked)
					value.push(element.value);
			}
			else
				value = element.value;
		}

		setProperty(this.object, event.currentTarget.name, Array.isArray(value) || isNaN(value) ? value : Number(value));

		this._updatePreview();
	}

	/** @inheritDoc */
	_updateObject()
	{
		// if sound was not passed search for sound dropdown value
		if(!this.sound) {
			const sound = this.element.find(".sound-selection")?.[0]?.value;

			if(sound) {
				this.sound = sound;

				if(this?.checkData?.item) {
					let entity;
					let entityData;

					if(!this?.check?.item?.flags?.uuid) {
						entity = CONFIG["Actor"].documentClass.collection.get(this.check.data.actor.id);
						entityData = {_id: this.check.item.id};
					}
					else {
						const parts = this.check.item.flags.uuid.split(".");
						const [entityName, entityId, embeddedName, embeddedId] = parts;
						entity = CONFIG[entityName].documentClass.collection.get(entityId);

						if(parts.length === 4)
							entityData = {_id: embeddedId};
					}

					setProperty(entityData, "flags.ffgsound", sound);
					entity.updateOwnedItem(entityData);
				}
			}
		}

		if(!this.flavor) {
			const flavor = this.element.find(".flavor-text")?.[0]?.value;

			if(flavor)
				this.flavor = flavor;
		}

		const sentToPlayer = this.element.find(".user-selection")?.[0]?.value;

		if(sentToPlayer) {
			let container = $(`<div class="dice-pool"></div>`)[0];
			this.object.renderAdvancedPreview(container);

			const messageText = `<div>
					<div>${game.i18n.localize("WFRP3e.SentDicePoolRollHint")}</div>
					${$(container).this.element()}
					<button class="special-pool-to-player">${game.i18n.localize("WFRP3e.SentDicePoolRoll")}</button>
				</div>`;

			let chatOptions = {
				user: game.user.id,
				content: messageText,
				flags: {
					specialDice: {
						roll: this.check,
						dicePool: this.object,
						description: this.description,
					},
				},
			};

			if(sentToPlayer !== "all")
				chatOptions.whisper = [sentToPlayer];

			ChatMessage.create(chatOptions);
		}

		this.object.roll();
	}

	/**
	 * Ensures that the input values are equal to the DicePool values.
	 * @param {any} html
	 * @private
	 */
	_synchronizeInputs(html)
	{
		html.find(".dice-pool-table input, .symbols-pool-container input").each((key, input) => {
			input.value = getProperty(this.object, input.name);
		});

		this._updatePreview();
	}

	/**
	 * Gets the clicked input element.
	 * @param {HTMLElement} target The clicked element.
	 * @returns {HTMLInputElement} The clicked input element.
	 * @private
	 */
	_getClickedInput(target)
	{
		let input;

		if($(target).hasClass(".pool-container"))
			input = $(target).find(".pool-value input")[0];
		else {
			input = $(target).find("input")[0];

			if(!input)
				input = $(target.nextElementSibling).find("input")[0];
		}

		return input;
	}

	/**
	 * Performs follow-up operations after left-clicks on a pool container input.
	 * @param {any} html
	 * @param {MouseEvent} event
	 * @private
	 */
	_onPoolContainerInputLeftClick(html, event)
	{
		event.preventDefault();
		event.stopPropagation();

		const input = this._getClickedInput(event.currentTarget);

		if(event.target !== input) {
			input.value++;
			setProperty(this.object, input.name, parseInt(input.value));
			this._updatePreview();
		}
	}

	/**
	 * Performs follow-up operations after right-clicks on a pool container input.
	 * @param {any} html
	 * @param {MouseEvent} event
	 * @private
	 */
	_onPoolContainerInputRightClick(html, event)
	{
		event.stopPropagation();

		const input = this._getClickedInput(event.currentTarget);

		if(event.target !== input && input.value > 0) {
			input.value--;
			setProperty(this.object, input.name, parseInt(input.value));
			this._updatePreview();
		}
	}

	/**
	 * Performs follow-up operations after left-clicks on a conversion button.
	 * @param {MouseEvent} event
	 * @param {any} html
	 * @private
	 */
	_onConversionButtonLeftClick(html, event)
	{
		event.preventDefault();
		event.stopPropagation();

		if(event.currentTarget.classList.contains("convert-conservative"))
			this.object.convertCharacteristicDie("conservative");
		else if(event.currentTarget.classList.contains("convert-reckless"))
			this.object.convertCharacteristicDie("reckless");

		this._synchronizeInputs(html);
	}

	/**
	 * Performs follow-up operations after right-clicks on a conversion button.
	 * @param {any} html
	 * @param {MouseEvent} event
	 * @private
	 */
	_onConversionButtonRightClick(html, event)
	{
		event.preventDefault();
		event.stopPropagation();

		if(event.currentTarget.classList.contains("convert-conservative"))
			this.object.convertCharacteristicDie("conservative", -1);
		else if(event.currentTarget.classList.contains("convert-reckless"))
			this.object.convertCharacteristicDie("reckless", -1);

		this._synchronizeInputs(html);
	}

	/**
	 * Updates the dice pool and symbol pool previews.
	 * @private
	 */
	_updatePreview()
	{
		const dicePoolDiv = $(this.element).find(".dice-pool")[0];
		const symbolsPoolDiv = $(this.element).find(".symbols-pool")[0];

		if(this.object.dice)
			this._renderDicePoolPreview(dicePoolDiv);

		if(this.object.symbols)
			this._renderSymbolsPoolPreview(symbolsPoolDiv);
	}

	/**
	 * Renders a preview of the dice pool.
	 * @param {HTMLElement} container The dice pool preview container.
	 * @returns {HTMLElement}
	 */
	_renderDicePoolPreview(container)
	{
		container.innerHTML = "";

		const totalDice = Object.values(this.object.dice).reduce((accumulator, dice) => accumulator + +dice, 0)
			+ Object.values(this.object.creatureDice).reduce((accumulator, dice) => accumulator + +dice, 0)
			+ this.object.fortunePoints;
			+ this.object.specialisations.length;

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

		// Add as many dice icons as needed.
		Object.entries(this.object.dice).forEach((dice, index) => {
			if(this.object.creatureDice) {
				if(dice[0] === "fortune")
					dice[1] += this.object.fortunePoints
						+ this.object.specialisations.length
						+ this.object.creatureDice.aggression
						+ this.object.creatureDice.cunning;
				else if(dice[0] === "expertise")
					dice[1] += this.object.creatureDice.expertise;
			}

			for(let i = 0; i < dice[1]; i++) {
				const img = document.createElement("img");

				img.classList.add("special-die", dice[0]);
				img.src = CONFIG.WFRP3e.dice[dice[0]].icon;
				img.width = width;
				img.height = height;

				container.appendChild(img);
			}
		});

		return container;
	}

	/**
	 * Renders a preview of the symbol pool.
	 * @param {HTMLElement} container The symbol pool preview container.
	 * @returns {HTMLElement}
	 */
	_renderSymbolsPoolPreview(container)
	{
		container.innerHTML = "";

		Object.values(CONFIG.WFRP3e.symbols).forEach((symbol) => {
			for(let i = 0; i < this.object.symbols[symbol.plural]; i++) {
				const span = document.createElement("span");

				span.classList.add("wfrp3e-font");
				span.classList.add("symbol");
				span.classList.add(symbol.cssClass);

				container.appendChild(span);
			}
		});

		return container;
	}

	/**
	 * Performs follow-up operations after challenge level changes.
	 * @param {any} html
	 * @param {Event} event
	 * @private
	 */
	_onChallengeLevelSelectChange(html, event)
	{
		event.preventDefault();

		const challengeLevel = CONFIG.WFRP3e.challengeLevels[event.currentTarget.value];

		this.object.checkData.challengeLevel = event.currentTarget.value;
		this.object.dice.challenge = (this.object.checkData.action?.system[this.object.checkData.face].difficultyModifiers.challengeDice ?? 0) +
			(["melee", "ranged"].includes(this.object.checkData.action?.system.type) ? 1 : 0) +
			challengeLevel.challengeDice;

		this._synchronizeInputs(html);
	}

	/**
	 * Performs follow-up operations after characteristic changes.
	 * @param {any} html
	 * @param {Event} event
	 * @private
	 */
	_onCharacteristicSelectChange(html, event)
	{
		event.preventDefault();

		this.object.checkData.characteristic = {
			name: event.currentTarget.value,
			...this.object.checkData.actor.system.characteristics[event.currentTarget.value]
		};
		const stance = this.object.checkData.actor.system.stance.current;

		mergeObject(this.object.dice, {
			characteristic: this.object.checkData.characteristic.value - Math.abs(stance),
			fortune: this.object.checkData.characteristic.fortune,
			conservative: stance < 0 ? Math.abs(stance) : 0,
			reckless: stance > 0 ? stance : 0
		});

		this._synchronizeInputs(html);
	}

	/**
	 * Performs follow-up operations after skill changes.
	 * @param {any} html
	 * @param {Event} event
	 * @private
	 */
	_onSkillSelectChange(html, event)
	{
		event.preventDefault();

		const skill = this.object.checkData.actor.itemTypes.skill.find(skill => skill._id === event.currentTarget.value);

		this.object.checkData.skill = skill;

		if(skill) {
			this.object.dice.expertise = skill.system.trainingLevel;
			html.find(".characteristic-select").val(skill.system.characteristic).trigger("change");
		}
		else
			this.object.dice.expertise = 0;

		this._synchronizeInputs(html);
	}

	/**
	 * Performs follow-up operations after weapon changes.
	 * @param {Event} event
	 * @private
	 */
	_onWeaponSelectChange(event)
	{
		event.preventDefault();

		this.object.checkData.weapon = this.object.checkData.actor.itemTypes.weapon(weapon => weapon._id === event.currentTarget.value);
	}

	/**
	 * Performs follow-up operations after left-clicks on a extend button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onExtendButtonClick(event)
	{
		event.preventDefault();
		event.stopPropagation();

		$(event.currentTarget).toggleClass("minimize");

		const selector = $(event.currentTarget).next();
		$(selector).toggleClass("hide");
		$(selector).toggleClass("maximize");

		if(!$(event.currentTarget).hasClass("minimize"))
			$(selector).val("");
	}
}