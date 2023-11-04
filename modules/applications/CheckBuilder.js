import CheckHelper from "../CheckHelper.js";
import DicePool from "../DicePool.js";
import WFRP3eRoll from "../WFRP3eRoll.js";

/** @inheritDoc */
export default class CheckBuilder extends FormApplication
{
	/**
	 * @param {DicePool} [dicePool]
	 * @param {string} [rollName]
	 * @param {Object} [rollData]
	 * @param {?string} [rollFlavor]
	 * @param {?string} [rollSound]
	 */
	constructor(dicePool = new DicePool(), rollName = game.i18n.localize("ROLL.FreeCheck"), rollData = null, rollFlavor= null, rollSound= null)
	{
		super();

		this.roll = {
			data: rollData,
			name: rollName,
			sound: rollSound,
			flavor: rollFlavor,
		};

		this.dicePool = dicePool;
	}

	/** @inheritDoc */
	get title()
	{
		if(this.roll.data) {
			if(this.roll.data.action)
				return game.i18n.format("ROLL.ActionCheckBuilder", {action: this.roll.data.action.name});
			else if(this.roll.data.skill)
				return game.i18n.format("ROLL.SkillCheckBuilder", {skill: this.roll.data.skill.name});
			else if(this.roll.data.combat)
				return game.i18n.localize("ROLL.InitiativeCheckBuilder");
		}

		return game.i18n.localize("ROLL.CheckBuilder");
	}

	/** @inheritDoc */
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions, {
			classes: ["wfrp3e", "check-builder"],
			template: "systems/wfrp3e/templates/applications/check-builder.hbs",
			width: 640
		});
	}

	/** @inheritDoc */
	async getData()
	{
		const data = {
			challengeLevel: ["melee", "ranged"].includes(this.roll.data?.action?.system[this.roll.data.face].type) ? "easy" : "simple",
			challengeLevels: CONFIG.WFRP3e.challengeLevels,
			diceIcons: {
				...Object.entries(CONFIG.WFRP3e.dice).reduce((object, dieType) => {
					object[dieType[0]] = dieType[1].icon;
					return object;
				}, {})
			},
			flavor: this.roll.flavor,
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

		if(this.roll.data) {
			this.roll.data.challengeLevel = data.challengeLevel;

			if(this.roll.data.actor) {
				data.skills = this.roll.data.actor.itemTypes.skill;

				data.characteristics = Object.entries(CONFIG.WFRP3e.characteristics).reduce((object, characteristic) => {
					if(characteristic[0] !== "varies")
						object[characteristic[0]] = characteristic[1].name;
					return object;
				}, {});

				if(this.roll.data.actor.type === "creature")
					data.attributes = this.roll.data.actor.system.attributes;
			}

			if(this.roll.data.skill)
				data.skill = this.roll.data.skill;

			if(this.roll.data.characteristic)
				data.characteristic = this.roll.data.characteristic;

			if(this.roll.data.action) {
				data.action = this.roll.data.action

				if(["melee", "ranged"].includes(data.action.system[this.roll.data.face].type)) {
					data.availableWeapons = data.action.actor.itemTypes.weapon.filter(weapon => {
						return Object.entries(CONFIG.WFRP3e.weapon.groups).reduce((array, weaponGroup) => {
							if (weaponGroup[1].type === data.action.system[this.roll.data.face].type)
								array.push(weaponGroup[0]);
							return array;
						}, []).includes(weapon.system.group);
					});

					data.weapon = this.roll.data.weapon ?? Object.values(data.availableWeapons)[0];
					this.roll.data.weapon = Object.values(data.availableWeapons)[0];
				}
			}

			if(this.roll.data.combat)
				data.encounterTypes = CONFIG.WFRP3e.encounterTypes;
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

		html.find(".attribute-dice input").change(this._onAttributeDiceChange.bind(this, html));

		html.find(".challenge-level-select").change(this._onChallengeLevelSelectChange.bind(this, html));
		html.find(".characteristic-select").change(this._onCharacteristicSelectChange.bind(this, html));
		html.find(".skill-select").change(this._onSkillSelectChange.bind(this, html));
		html.find(".weapon-select").change(this._onWeaponSelectChange.bind(this));

		html.find(".extend-button").click(this._onExtendButtonClick.bind(this));
		html.find(".roll-check-button").click(this._onRollCheckButtonClick.bind(this, html));
	}

	/**
	 * Ensures that the input values are equal to the DicePool values.
	 * @param {any} html
	 * @private
	 */
	_synchronizeInputs(html)
	{
		html.find(".dice-pool-table input").each((key, value) => {
			value.value = this.dicePool[value.name];
		});

		html.find(".symbols-pool-container input").each((key, value) => {
			value.value = this.dicePool[value.name];
		});

		this._updatePreview(html);
	}

	_updateObject() {}

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
		const input = this._getClickedInput(event.currentTarget);

		input.value++;

		this.dicePool[input.name] = parseInt(input.value);
		this._updatePreview(html);
	}

	/**
	 * Performs follow-up operations after right-clicks on a pool container input.
	 * @param {any} html
	 * @param {MouseEvent} event
	 * @private
	 */
	_onPoolContainerInputRightClick(html, event)
	{
		const input = this._getClickedInput(event.currentTarget);

		if(input.value > 0) {
			input.value--;
			this.dicePool[input.name] = parseInt(input.value);
			this._updatePreview(html);
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
			this.dicePool.convertCharacteristicDie("conservative");
		else if(event.currentTarget.classList.contains("convert-reckless"))
			this.dicePool.convertCharacteristicDie("reckless");

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
			this.dicePool.convertCharacteristicDie("conservative", -1);
		else if(event.currentTarget.classList.contains("convert-reckless"))
			this.dicePool.convertCharacteristicDie("reckless", -1);

		this._synchronizeInputs(html);
	}

	/**
	 * Performs follow-up operations after changes on an attribute dice.
	 * @param {Event} event
	 * @param {any} html
	 * @private
	 */
	_onAttributeDiceChange(html, event)
	{
		const input = event.currentTarget;

		this.dicePool[input.name] = parseInt(input.value);

		this._updatePreview(html);
	}

	/**
	 * Updates the dice pool and symbol pool previews.
	 * @param {any} html
	 * @private
	 */
	_updatePreview(html)
	{
		const dicePoolDiv = html.find(".dice-pool")[0];
		const symbolsPoolDiv = html.find(".symbols-pool")[0];

		this._renderDicePoolPreview(dicePoolDiv);
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

		const totalDice = Object.keys(CONFIG.WFRP3e.dice).reduce((accumulator, diceName) => accumulator + +this.dicePool[diceName + "Dice"], 0);

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
		Object.entries(CONFIG.WFRP3e.dice).forEach((dieType, index) => {
			let diceAmount = this.dicePool[dieType[0] + "Dice"];

			if(dieType[0] === "fortune")
				diceAmount += this.dicePool.creaturesAggressionDice + this.dicePool.creaturesCunningDice;
			else if(dieType[0] === "expertise")
				diceAmount += this.dicePool.creaturesExpertiseDice;

			for(let i = 0; i < diceAmount; i++) {
				const img = document.createElement("img");

				img.classList.add("special-die");
				img.src = dieType[1].icon;
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
			for(let i = 0; i < this.dicePool[symbol.plural]; i++) {
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
		const challengeLevel = CONFIG.WFRP3e.challengeLevels[event.currentTarget.value];

		this.roll.data.challengeLevel = event.currentTarget.value;
		this.dicePool.challengeDice = this.roll.action?.system[this.roll.face].difficultyModifiers.challengeDice ?? 0 +
			(["melee", "ranged"].includes(this.roll.action?.system[this.roll.face].type) ? 1 : 0) +
			challengeLevel.challengeDice;

		this._synchronizeInputs(html, html);
	}

	/**
	 * Performs follow-up operations after characteristic changes.
	 * @param {any} html
	 * @param {Event} event
	 * @private
	 */
	_onCharacteristicSelectChange(html, event)
	{
		const characteristic = this.roll.data.actor.system.characteristics[event.currentTarget.value];
		const stance = this.roll.data.actor.system.stance.current;

		this.roll.data.skill = event.currentTarget.value;
		this.dicePool.characteristicDice = characteristic.value - Math.abs(stance);
		this.dicePool.fortuneDice = characteristic.fortune;
		this.dicePool.conservativeDice = stance > 0 ? stance : 0;
		this.dicePool.recklessDice = stance < 0 ? Math.abs(stance) : 0;

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
		const skill = this.roll.data.actor.itemTypes.skill.find(skill => skill._id === event.currentTarget.value)

		this.roll.data.skill = skill;
		this.dicePool.expertiseDice = skill.system.trainingLevel;

		html.find(".characteristic-select")
			.val(skill.system.characteristic)
			.trigger("change");

		this._synchronizeInputs(html);
	}

	/**
	 * Performs follow-up operations after weapon changes.
	 * @param {Event} event
	 * @private
	 */
	_onWeaponSelectChange(event)
	{
		this.roll.data.weapon = this.roll.data.actor.itemTypes.weapon(weapon => weapon._id === event.currentTarget.value);
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

	/**
	 * Performs follow-up operations after left-clicks on a roll check button.
	 * @param {any} html
	 * @param {MouseEvent} event
	 * @returns {WFRP3eRoll}
	 * @private
	 */
	async _onRollCheckButtonClick(html, event)
	{
		// if sound was not passed search for sound dropdown value
		if(!this.roll.sound) {
			const sound = html.find(".sound-selection")?.[0]?.value;

			if(sound) {
				this.roll.sound = sound;

				if(this?.roll?.item) {
					let entity;
					let entityData;

					if(!this?.roll?.item?.flags?.uuid) {
						entity = CONFIG["Actor"].documentClass.collection.get(this.roll.data.actor.id);
						entityData = {_id: this.roll.item.id};
					}
					else {
						const parts = this.roll.item.flags.uuid.split(".");
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

		if(!this.roll.flavor) {
			const flavor = html.find(".flavor-text")?.[0]?.value;

			if(flavor)
				this.roll.flavor = flavor;
		}

		const sentToPlayer = html.find(".user-selection")?.[0]?.value;

		if(sentToPlayer) {
			let container = $(`<div class="dice-pool"></div>`)[0];
			this.dicePool.renderAdvancedPreview(container);

			const messageText = `<div>
					<div>${game.i18n.localize("WFRP3e.SentDicePoolRollHint")}</div>
					${$(container).html()}
					<button class="special-pool-to-player">${game.i18n.localize("WFRP3e.SentDicePoolRoll")}</button>
				</div>`;

			let chatOptions = {
				user: game.user.id,
				content: messageText,
				flags: {
					specialDice: {
						roll: this.roll,
						dicePool: this.dicePool,
						description: this.description,
					},
				},
			};

			if(sentToPlayer !== "all")
				chatOptions.whisper = [sentToPlayer];

			ChatMessage.create(chatOptions);
		}
		else if(this.roll.data?.combat) {
			const currentCombatantId = this.roll.data.combat.combatant?.id;
			const encounterType = html.find('.encounter-type input:checked').val();
			const initiativeCharacteristic = encounterType === "social" ? "fellowship" : "agility";

			// Iterate over Combatants, performing an initiative roll for each.
			const [updates, messages] = await this.roll.data.combatantIds.reduce(async(results, id, i) => {
				const [updates, messages] = await results;

				// Get Combatant data
				const combatant = this.roll.data.combat.getCombatantByToken(
					this.roll.data.combat.combatants
						.map(combatant => combatant)
						.filter(combatantData => combatantData._id === id)[0].tokenId
				);

				if(!combatant || !combatant.isOwner)
					return results;

				// Determine formula.
				this.dicePool.addDicePool(await CheckHelper.prepareInitiativeCheck(combatant.actor, initiativeCharacteristic));
				const initiativeRoll = new WFRP3eRoll(
					this.dicePool.renderDiceExpression(),
					this.dicePool,
					{data: combatant.actor ? combatant.actor.getRollData() : {}}
				).roll();

				const totalInitiative = initiativeRoll.symbols.successes;

				initiativeRoll._result = totalInitiative;
				initiativeRoll._total = totalInitiative;

				// Roll initiative
				updates.push({_id: id, initiative: initiativeRoll.total});

				// Determine the roll mode
				let rollMode = this.roll.data.messageOptions.rollMode || game.settings.get("core", "rollMode");
				if((combatant.token.hidden || combatant.hidden) && rollMode === "roll")
					rollMode = "gmroll";

				// Construct chat message data
				const messageData = mergeObject({
					speaker: {
						scene: canvas.scene.id,
						actor: combatant.actor ? combatant.actor.id : null,
						token: combatant.token.id,
						alias: combatant.token.name,
					},
					flavor: game.i18n.localize("ROLL." + (encounterType[0].toUpperCase() + encounterType.slice(1)) + "EncounterInitiativeCheck"),
					flags: { "core.initiativeRoll": true },
				}, this.roll.data.messageOptions);

				const chatData = await initiativeRoll.toMessage(messageData, {create: false, rollMode});

				// Play 1 sound for the whole rolled set
				if(i > 0)
					chatData.sound = null;

				messages.push(chatData);

				// Return the Roll and the chat data
				return results;
			}, [[], []]);

			if(!updates.length)
				return this.roll.data.combat;

			// Update multiple combatants
			await this.roll.data.combat.updateEmbeddedDocuments("Combatant", updates);

			// Ensure the turn order remains with the same combatant if there was one active
			if(this.roll.data.updateTurn && !!currentCombatantId)
				await this.roll.data.combat.update({turn: this.roll.data.combat.turns.findIndex((turn) => turn.id === currentCombatantId)});

			// Create multiple chat messages
			await CONFIG.ChatMessage.documentClass.create(messages);

			return this.roll.data.combat;
		}
		else {
			const roll = new WFRP3eRoll(this.dicePool.renderDiceExpression(), this.dicePool, {
				data: this.roll.data,
				flavor: this.roll.flavor
			});

			roll.toMessage({
				flavor: this.roll.name,
				speaker: {actor: this.roll.data?.actor},
				user: game.user.id
			});

			if(this.roll?.sound)
				AudioHelper.play({src: this.roll.sound}, true);

			if(this.roll.data?.actor.type === "creature")
				Object.keys(CONFIG.WFRP3e.attributes).forEach((attribute) => {
					const attributeDiceAmount = this.dicePool["creatures" + (attribute[0].toUpperCase() + attribute.slice(1, attribute.length)) + "Dice"];

					if(attributeDiceAmount > 0) {
						const changes = {system: {attributes: {}}};
						changes.system.attributes[attribute] = {current: this.roll.data.actor.system.attributes[attribute].current - attributeDiceAmount};

						console.log(changes)

						this.roll.data.actor.update(changes);
					}
				});

			return roll;
		}
	}
}