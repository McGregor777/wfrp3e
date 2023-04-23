import WFRP3ERoll from "./WFRP3ERoll.js";

export default class CheckBuilder extends FormApplication
{
	/**
	 * CheckBuilder constructor.
	 * @param rollData
	 * @param {DicePool} dicePool
	 * @param {string} [dialogTitle]
	 * @param {string} [rollSkillName]
	 * @param {string} [flavor]
	 * @param {string} [rollSound]
	 */
	constructor(rollData, dicePool, dialogTitle = game.i18n.localize("WFRP3E.RollingDefaultTitle"), rollSkillName, flavor, rollSound)
	{
		super();

		this.roll =
		{
			data: rollData,
			skillName: rollSkillName,
			sound: rollSound,
			flavor: flavor,
		};

		this.dicePool = dicePool;
		this.dialogTitle = dialogTitle;
	}

	/** @override */
	get title()
	{
		return this.dialogTitle;
	}

	/** @override */
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			classes: ["wfrp3e", "roll-dialog"],
			template: "systems/wfrp3e/templates/dialogs/check-dialog.html",
		});
	}

	/** @override */
	async getData()
	{
		// Get all possible sounds
		let sounds = [];
		let users = [{name: "Send To All", id: "all"}];

		if(game.user.isGM)
		{
			game.users.contents.forEach((user) =>
			{
				if(user.visible && user.id !== game.user.id)
					users.push({name: user.name, id: user.id});
			});
		}

		return {
			sounds,
			isGM: game.user.isGM,
			flavor: this.roll.flavor,
			users
		};
	}

	/** @override */
	activateListeners(html)
	{
		super.activateListeners(html);

		this._initializeInputs(html);
		this._activateInputs(html);

		html.find(".btn").click((event) =>
		{
			// if sound was not passed search for sound dropdown value
			if(!this.roll.sound)
			{
				const sound = html.find(".sound-selection")?.[0]?.value;

				if(sound)
				{
					this.roll.sound = sound;

					if(this?.roll?.item)
					{
						let entity;
						let entityData;

						if(!this?.roll?.item?.flags?.uuid)
						{
							entity = CONFIG["Actor"].documentClass.collection.get(this.roll.data.actor.id);
							entityData = {_id: this.roll.item.id};
						}
						else
						{
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

			if(!this.roll.flavor)
			{
				const flavor = html.find(".flavor-text")?.[0]?.value;

				if(flavor)
					this.roll.flavor = flavor;
			}

			const sentToPlayer = html.find(".user-selection")?.[0]?.value;

			if(sentToPlayer)
			{
				let container = $(`<div class="dice-pool"></div>`)[0];
				this.dicePool.renderAdvancedPreview(container);

				const messageText =
				`<div>
					<div>${game.i18n.localize("WFRP3E.SentDicePoolRollHint")}</div>
					${$(container).html()}
					<button class="special-pool-to-player">${game.i18n.localize("WFRP3E.SentDicePoolRoll")}</button>
				</div>`;

				let chatOptions =
				{
					user: game.user.id,
					content: messageText,
					flags:
					{
						specialDice:
						{
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
			else
			{
				const roll = new WFRP3ERoll(this.dicePool.renderDiceExpression(), this.dicePool, {flavor: this.roll.flavor});

				roll.toMessage({
					user: game.user.id,
					speaker: {actor: game.actors.get(this.roll.data?.actor?._id)},
					flavor: game.i18n.format("ROLL.SkillCheck", {skill: this.roll.skillName}),
				});

				if(this.roll?.sound)
					AudioHelper.play({src: this.roll.sound}, true);

				return roll;
			}
		});

		html.find(".extend-button").on("click", (event) =>
		{
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

	_updatePreview(html)
	{
		const poolDiv = html.find(".dice-pool-dialog .dice-pool")[0];
		poolDiv.innerHTML = "";
		this.dicePool.renderPreview(poolDiv);
	}

	_initializeInputs(html)
	{
		html.find(".pool-value input").each((key, value) =>
		{
			const name = $(value).attr("name");
			value.value = this.dicePool[name];
		});

		html.find(".pool-additional input").each((key, value) =>
		{
			const name = $(value).attr("name");
			value.value = this.dicePool[name];
			$(value).attr("allowNegative", true);
		});

		this._updatePreview(html);
	}

	_activateInputs(html)
	{
		html.find(".upgrade-buttons button").on("click", (event) =>
		{
			event.preventDefault();
			event.stopPropagation();

			const id = $(event.currentTarget).attr("id");

			switch(id.toLowerCase())
			{
				case "upgrade-ability":
				{
					this.dicePool.upgrade(1);
					break;
				}
				case "downgrade-ability":
				{
					this.dicePool.upgrade(-1);
					break;
				}
				case "upgrade-difficulty":
				{
					this.dicePool.upgradeDifficulty(1);
					break;
				}
				case "downgrade-difficulty":
				{
					this.dicePool.upgradeDifficulty(-1);
					break;
				}
			}

			this._initializeInputs(html);
		});

		html.find(".pool-container, .pool-additional").on("click", (event) =>
		{
			let input;

			if($(event.currentTarget).hasClass(".pool-container"))
				input = $(event.currentTarget).find(".pool-value input")[0];
			else
			{
				input = $(event.currentTarget).find("input")[0];

				if(!input)
					input = $(event.currentTarget.nextElementSibling).find("input")[0];
			}

			input.value++;

			this.dicePool[input.name] = parseInt(input.value);
			this._updatePreview(html);
		});

		html.find(".pool-container, .pool-additional").on("contextmenu", (event) =>
		{
			let input;

			if($(event.currentTarget).hasClass(".pool-container"))
				input = $(event.currentTarget).find(".pool-value input")[0];
			else
			{
				input = $(event.currentTarget).find("input")[0];

				if(!input)
					input = $(event.currentTarget.nextElementSibling).find("input")[0];
			}

			const allowNegative = $(input).attr("allowNegative");

			if(input.value > 0 || allowNegative)
			{
				input.value--;
				this.dicePool[input.name] = parseInt(input.value);
				this._updatePreview(html);
			}
		});
	}

	_updateObject() {}
}