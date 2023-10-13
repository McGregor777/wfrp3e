import DicePool from "./DicePool.js";
import WFRP3eRoll from "./WFRP3eRoll.js";

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
	constructor(dicePool= new DicePool(), rollName = game.i18n.localize("ROLL.FreeCheck"), rollData = null, rollFlavor= null, rollSound= null)
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
		switch(this.roll.data?.type) {
			case "action":
				return game.i18n.format("ROLL.ActionCheckBuilder", {action: this.roll.data.name});
			case "skill":
				return game.i18n.format("ROLL.SkillCheckBuilder", {skill: this.roll.data.name});
			default:
				return game.i18n.localize("ROLL.CheckBuilder");
		}
	}

	/** @inheritDoc */
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions, {
			classes: ["wfrp3e", "check-builder"],
			template: "systems/wfrp3e/templates/applications/check-builder.hbs",
			width: 420
		});
	}

	/** @inheritDoc */
	async getData()
	{
		// Get all possible sounds
		let sounds = [];
		let users = [{name: "Send To All", id: "all"}];

		if(game.user.isGM) {
			game.users.contents.forEach((user) => {
				if(user.visible && user.id !== game.user.id)
					users.push({name: user.name, id: user.id});
			});
		}

		return {
			diceIcons: {
				...Object.entries(CONFIG.WFRP3e.dice).reduce((object, dieType) => {
					object[dieType[0]] = dieType[1].icon;
					return object;
				}, {})
			},
			flavor: this.roll.flavor,
			isGM: game.user.isGM,
			sounds,
			users
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		this._initializeInputs(html);
		this._activateInputs(html);

		html.find(".btn").click((event) => {
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
			else {
				const roll = new WFRP3eRoll(this.dicePool.renderDiceExpression(), this.dicePool, {flavor: this.roll.flavor});

				roll.toMessage({
					user: game.user.id,
					speaker: {actor: game.actors.get(this.roll.data?.actor?._id)},
					flavor: this.roll.name,
				});

				if(this.roll?.sound)
					AudioHelper.play({src: this.roll.sound}, true);

				return roll;
			}
		});

		html.find(".extend-button").on("click", (event) => {
			event.preventDefault();
			event.stopPropagation();

			$(event.currentTarget).toggleClass("minimize");

			const selector = $(event.currentTarget).next();
			$(selector).toggleClass("hide");
			$(selector).toggleClass("maximize");

			if(!$(event.currentTarget).hasClass("minimize"))
				$(selector).val("");
		});
	}

	_initializeInputs(html)
	{
		html.find(".dice-pool-table input").each((key, value) => {
			const name = $(value).attr("name");
			value.value = this.dicePool[name];
		});

		html.find(".symbols-pool-container input").each((key, value) => {
			const name = $(value).attr("name");
			value.value = this.dicePool[name];
			$(value).attr("allowNegative", true);
		});

		this._updatePreview(html);
	}

	_activateInputs(html)
	{
		const poolContainers = html.find(".pool-container");
		const convertButtons = html.find(".convert-buttons button");

		poolContainers
			.on("click", (event) => {
				let input;

				if($(event.currentTarget).hasClass(".pool-container"))
					input = $(event.currentTarget).find(".pool-value input")[0];
				else {
					input = $(event.currentTarget).find("input")[0];

					if(!input)
						input = $(event.currentTarget.nextElementSibling).find("input")[0];
				}

				input.value++;

				this.dicePool[input.name] = parseInt(input.value);
				this._updatePreview(html);
			})
			.on("contextmenu", (event) => {
				let input;

				if($(event.currentTarget).hasClass(".pool-container"))
					input = $(event.currentTarget).find(".pool-value input")[0];
				else {
					input = $(event.currentTarget).find("input")[0];

					if(!input)
						input = $(event.currentTarget.nextElementSibling).find("input")[0];
				}

				const allowNegative = $(input).attr("allowNegative");

				if(input.value > 0 || allowNegative) {
					input.value--;
					this.dicePool[input.name] = parseInt(input.value);
					this._updatePreview(html);
				}
			});

		convertButtons
			.on("click", (event) => {
				event.preventDefault();
				event.stopPropagation();

				const id = $(event.currentTarget).attr("id");

				switch(id.toLowerCase()) {
					case "convert-conservative": {
						this.dicePool.convertCharacteristicDie("conservative");
						break;
					}
					case "convert-reckless": {
						this.dicePool.convertCharacteristicDie("reckless");
						break;
					}
				}

				this._initializeInputs(html);
			})
			.on("contextmenu", (event) => {
				event.preventDefault();
				event.stopPropagation();

				const id = $(event.currentTarget).attr("id");

				switch(id.toLowerCase()) {
					case "convert-conservative": {
						this.dicePool.convertCharacteristicDie("conservative", -1);
						break;
					}
					case "convert-reckless": {
						this.dicePool.convertCharacteristicDie("reckless", -1);
						break;
					}
				}

				this._initializeInputs(html);
			});
	}

	_updateObject() {}

	/**
	 * Updates the dice pool and symbol pool previews.
	 * @param html
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
			for(let i = 0; i < this.dicePool[dieType[0] + "Dice"]; i++) {
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

		Object.entries(CONFIG.WFRP3e.symbols).forEach((symbol, index) => {
			for(let i = 0; i < this.dicePool[symbol[0]]; i++) {
				const span = document.createElement("span");

				span.classList.add("wfrp3e-font");
				span.classList.add("symbol");
				span.classList.add(symbol[1].cssClass);

				container.appendChild(span);
			}
		});

		return container;
	}
}