import {capitalize} from "../helpers.mjs";

/**
 * The client-side Item document which extends the common Item model.
 * @mixes ClientDocumentMixin
 * @see Items The world-level collection of Item documents.
 * @see ItemSheet The item configuration application.
 */
export default class Item extends foundry.documents.Item
{
	/** @inheritDoc */
	_onCreate(data, options, userId)
	{
		super._onCreate(data, options, userId);

		try {
			const functionName = `_on${capitalize(this.type)}Create`;

			if(this[functionName])
				this[functionName](data, options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when creating the Item ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/** @inheritDoc */
	_onDelete(options, userId)
	{
		super._onDelete(options, userId);

		try {
			const functionName = `_on${capitalize(this.type)}Delete`;

			if(this[functionName])
				this[functionName](options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when deleting the Item ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/** @inheritDoc */
	_onUpdate(changed, options, userId)
	{
		super._onUpdate(changed, options, userId);

		try {
			const functionName = `_on${capitalize(this.type)}Update`;

			if(this[functionName])
				this[functionName](changed, options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when updating the Item ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/**
	 * Fetches the details of the item, depending on its type.
	 * @param {Object} [options] The options for the details fetch.
	 * @returns {Promise<string>} The details of the Item.
	 */
	async getDetails(options = {})
	{
		const functionName = `_get${capitalize(this.type)}Details`;

		if(this[`${functionName}`])
			return await this[`${functionName}`](options);
		else
			return await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.system.description);
	}

	/**
	 * Adds a number of recharge tokens to the Item depending on its type.
	 * @param {Object} [options]
	 * @returns {Promise<void>}
	 */
	async exhaust(options = {})
	{
		try {
			const functionName = `_exhaust${capitalize(this.type)}`;

			if(this[`${functionName}`])
				this[`${functionName}`](options);
		}
		catch(exception) {
			console.error(`Unable to exhaust the Item ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/**
	 * Makes usage of the item. The result depends on the type of the item.
	 * @param {Object} [options]
	 * @returns {Promise<void>}
	 */
	async use(options = {})
	{
		const functionName = `_use${capitalize(this.type)}`;

		if(this[`${functionName}`])
			this[`${functionName}`](options);
		else
			await this.sheet.render({force: true});
	}

	/**
	 * Creates a new active effect for the item.
	 * @param {Object} [data] An Object of optional data for the new active effect.
	 * @returns {Promise<void>}
	 */
	async createEffect(data = {})
	{
		await ActiveEffect.create({
			name: this.name,
			img: "icons/svg/dice-target.svg",
			...data
		}, {parent: this});
	}

	/**
	 * Either adds or removes a recharge token on an item.
	 * @param {number} amount The number of recharge tokens to add or remove.
	 * @returns {Promise<void>}
	 */
	async adjustRechargeTokens(amount)
	{
		await this.update({"system.rechargeTokens": this.system.rechargeTokens + amount});
	}

	//#region Ability methods

	/**
	 * Adds a recharge token to the Ability.
	 * @param {Object} [options]
	 * @returns {Promise<void>}
	 */
	async _exhaustAbility(options = {})
	{
		await this.update({"system.rechargeTokens": this.system.rechargeRating + 1});
	}

	/**
	 * Makes usage of the ability by triggering one of its active effect.
	 * @param {number} options.id The id of the active effect to trigger.
	 * @returns {Promise<void>}
	 * @private
	 */
	async _useAbility(options = {})
	{
		if(!options.id)
			throw new Error("ActiveEffect ID is needed");
		if(this.system.cooldown)
			ui.notifications.warn(game.i18n.localize("ABILITY.WARNINGS.cooldown"));
		else
			await this.effects.get(options.id).triggerMacro();
	}

	//#endregion
	//#region Action methods

	/**
	 * Checks if the action's requirements are met by the potential future owner.
	 * @param {Object} parameters The parameters that will be used by the requirement check script.
	 * @returns {Promise<boolean>}
	 */
	async checkRequirements(parameters)
	{
		let result = true;

		for(const effect of this.effects)
			if(effect.system.macro.type === wfrp3e.data.macros.RequirementMacro.TYPE)
				result = await effect.triggerMacro({actor: parameters.actor ?? this.parent});

		return result;
	}

	/**
	 * Creates a new effect for the action and opens the Action Effect Editor to edit it.
	 * @param face {string} The action's face, which receives the new effect.
	 * @returns {Promise<void>}
	 */
	async createActionEffect(face)
	{
		await new wfrp3e.applications.apps.ActionEffectEditor({
			data: {
				action: this,
				face,
				effect: {
					symbolAmount: 1,
					description: "",
					script: ""
				}
			}
		}).render({force: true});
	}

	/**
	 * Opens the Action Effect Editor to edit an action effect.
	 * @param face {string} The action's face of the effect to edit.
	 * @param symbol {string} The symbol used by the effect to edit.
	 * @param index {string} The index to the effect to edit.
	 * @returns {Promise<void>}
	 */
	async editActionEffect(face, symbol, index)
	{
		await new wfrp3e.applications.apps.ActionEffectEditor({
			data: {
				action: this,
				face,
				effect: this.system[face].effects[symbol][index],
				symbol,
				index
			}
		}).render({force: true});
	}

	/**
	 * Adds recharge tokens to an Action equal to its recharge rating.
	 * @param {string} options.face The Action face used to determine the recharge rating.
	 * @returns {Promise<void>}
	 */
	async _exhaustAction(options = {})
	{
		if(!options.face)
			throw ui.notifications.error("Exhausting an Action requires to know which face is concerned.");

		await this.update({"system.rechargeTokens": this.system[options.face].rechargeRating});
	}

	/**
	 * Removes an effect from the action.
	 * @param face {string} The action's face of the effect to remove.
	 * @param symbol {string} The symbol used by the effect to remove.
	 * @param index {string} The index to the effect to remove.
	 * @returns {Promise<void>}
	 */
	async removeActionEffect(face, symbol, index)
	{
		const effects = this.system[face].effects[symbol];

		effects.splice(index, 1);

		await this.update({[`system.${face}.effects.${symbol}`]: effects});
	}

	/**
	 * Fetches the details of the action.
	 * @param {Object} [options]
	 * @returns {Promise<string>}
	 * @protected
	 */
	async _getActionDetails(options = {})
	{
		if(!options.face)
			return console.error("Unable to show action's details without knowing the face.");

		let html = "";

		for(const stance of Object.keys(wfrp3e.data.actors.Actor.STANCES)) {
			let face = this.system[stance],
				content = `<div>
						 <div><p>${face.check}</p></div>
						 <div>${face.requirements}</div>
					 </div>`;

			const effects = {};
			for(const [key, symbol] of Object.entries(wfrp3e.dice.terms.Die.SYMBOLS)) {
				effects[key] = {
					descriptions: "",
					type: symbol.type
				};

				for(const effect of face.effects[key])
					if(effect.symbolAmount > 0) {
						const match = effect.description.match(new RegExp(/<\w+>/));

						effects[key].descriptions += match[0]
							+ '<span class="symbol-container">'
							+ ` <span class="wfrp3e-font symbol ${symbol.cssClass}"></span>`.repeat(effect.symbolAmount)
							+ "</span> "
							+ effect.description.slice(match.index + match[0].length, effect.description.length);
					}
					else
						effects[key].descriptions += effect.description;
			}

			const positiveEffects = [], negativeEffects = [];
			for(const effect of Object.values(effects))
				if(effect.type === "positive")
					positiveEffects.push(effect);
				else if(effect.type === "negative")
					negativeEffects.push(effect);

			if(face.special || face.uniqueEffect)
				content += `<div>${face.special} ${face.uniqueEffect}</div>`;

			for(const nextPositiveEffect of positiveEffects) {
				if(nextPositiveEffect.descriptions && !nextPositiveEffect.shown) {
					const nextNegativeEffect = negativeEffects.find(effect => effect.descriptions && !effect.shown);
					let rightSideEffectDescriptions = "";

					if(nextNegativeEffect) {
						rightSideEffectDescriptions = nextNegativeEffect.descriptions;
						nextNegativeEffect.shown = true;
					}

					content += `<div>
						<div>${nextPositiveEffect.descriptions}</div>
						<div>${rightSideEffectDescriptions}</div>
					 </div>`;

					nextPositiveEffect.shown = true;
				}
			}

			html += `<div class="face ${stance + (options.face === stance ? " active" : "")}">${content}</div>`;
		}

		return await foundry.applications.ux.TextEditor.implementation.enrichHTML(html);
	}

	/**
	 * Makes usage of the Action by preparing an Action check.
	 * @param {string} options.face The face of the Action to use.
	 * @returns {Promise<void>}
	 * @protected
	 */
	async _useAction(options = {})
	{
		if(!options.face)
			throw new Error("The Action face to use is needed.");

		if(this.system.rechargeTokens > 0)
			ui.notifications.warn(game.i18n.localize("ACTION.WARNINGS.recharging"));
		else if(wfrp3e.dice.CheckRoll.doesRequireNoCheck(this.system[options.face].check))
			await foundry.applications.api.DialogV2.confirm({
				window: {title: game.i18n.localize("APPLICATION.TITLE.ActionUsage")},
				modal: true,
				content: `<p>${game.i18n.format("APPLICATION.DESCRIPTION.ActionUsage", {action: this.system[options.face].name})}</p>`,
				submit: async (result) => {
					if(result) {
						await this.exhaust(options);

						for(const effect of actor.findTriggeredEffects(wfrp3e.data.macros.ActionUsageMacro.TYPE))
							await effect.triggerMacro({action: this, actor: this.actor, face: options.face});

						return ChatMessage.create({
							content: await foundry.applications.handlebars.renderTemplate(
								"systems/wfrp3e/templates/partials/action-effects.hbs", {
									action: this,
									face: options.face,
									symbols: wfrp3e.dice.terms.Die.SYMBOLS,
									effects: this.system[options.face].effects
								}),
							flavor: game.i18n.format("ACTION.ACTIONS.usage", {
								actor: this.actor.name,
								action: this.system[options.face].name
							}),
							speaker: ChatMessage.getSpeaker({actor: this.actor})
						});
					}
				}
			});
		else {
			const diePool = await wfrp3e.applications.dice.CheckBuilder.wait({
				diePool: await wfrp3e.dice.DiePool.createFromAction(this.actor, this, options.face)
			});
			await diePool.roll();
		}
	}

	//#endregion
	//#region Career methods

	/**
	 * Adds a recharge token to the Career.
	 * @param {Object} [options]
	 * @returns {Promise<void>}
	 */
	async _exhaustCareer(options = {})
	{
		await this.update({"system.rechargeTokens": this.system.rechargeRating + 1});
	}

	/**
	 * Post-process a creation operation for a single career instance. Post-operation events occur for all connected clients.
	 * @param data The initial data object provided to the career creation request.
	 * @param options Additional options which modify the creation request.
	 * @param userId The id of the User requesting the career update.
	 * @protected
	 */
	_onCareerCreate(data, options, userId)
	{
		if(data.parent)
			this.system.postCloningCleanup(data, data.parent._id);
	}

	/**
	 * Post-process an update operation for a single career instance. Post-operation events occur for all connected clients.
	 * @param {Object} options Additional options which modify the update request.
	 * @param {string} userId The id of the User requesting the career update.
	 * @protected
	 */
	_onCareerDelete(options, userId)
	{
		if(this.actor && this.system.current)
			this.#onCurrentCareerDelete();
	}

	/**
	 * Post-process an update operation for a single career instance. Post-operation events occur for all connected clients.
	 * @param {Object} changed The differential data that was changed relative to the career's prior values.
	 * @param {Object} options Additional options which modify the update request.
	 * @param {string} userId The id of the User requesting the career update.
	 * @protected
	 */
	_onCareerUpdate(changed, options, userId)
	{
		if(this.actor) {
			if(changed.system?.current)
				this.#onCurrentCareerChange();

			if(changed.system?.sockets)
				this.#onCareerSocketChange(changed.system.sockets);
		}
	}

	/**
	 * Defines the second last career of the character as the current career when the actual one is deleted.
	 * Also resets the talent sockets.
	 */
	#onCurrentCareerDelete()
	{
		const careerList = this.actor.itemTypes.career;
		for(let i = careerList.length; i <= 0; i--)
			if(careerList[i] !== this)
				careerList[i].update({"system.current": false});

		this.actor.resetSockets(this.uuid);
	}

	/**
	 * Upon transitioning from a career to another, ensures that the sockets of the owner character are reset.
	 * @private
	 */
	#onCurrentCareerChange()
	{
		for(const career of this.actor.itemTypes.career)
			if(career !== this)
				career.update({"system.current": false});

		this.actor.resetSockets(this.uuid);
	}

	/**
	 * Upon change to any of the career socket's type, ensures that the sockets of the character are reset.
	 * @param {Object} sockets The current career sockets.
	 * @private
	 */
	#onCareerSocketChange(sockets)
	{
		for(const socket of sockets)
			if(fromUuidSync(socket.item)?.system.type !== socket.type)
				this.actor.resetSockets(this.uuid);
	}

	/**
	 * Adds a new socket to the career's list of sockets.
	 */
	async addNewSocket()
	{
		await this.update({"system.sockets": [...this.system.sockets, {item: null, type: "any"}]});
	}

	/**
	 * Deletes a socket from the career's list of sockets.
	 * @param {number} index The index of the socket to remove.
	 * @returns {Promise<void>}
	 */
	async deleteSocket(index)
	{
		this.system.sockets.splice(index, 1);
		await this.update({"system.sockets": this.system.sockets});
	}

	//#endregion
	//#region Skill methods

	/**
	 * Fetches the details of the skill.
	 * @param {Object} [options]
	 * @returns {Promise<string>}
	 * @protected
	 */
	async _getSkillDetails(options = {})
	{
		return game.i18n.format("SKILL.specialisationList", {specialisations: this.system.specialisations ?? ""});
	}

	/**
	 * Makes usage of the skill.
	 * @param {Object} [options]
	 * @returns {Promise<void>}
	 * @protected
	 */
	async _useSkill(options = {})
	{
		const diePool = await wfrp3e.applications.dice.CheckBuilder.wait({
			diePool: await wfrp3e.dice.DiePool.createFromSkill(this.actor, this)
		});
		await diePool.roll();
	}

	//#endregion
	//#region Talent methods

	/**
	 * Adds 4 recharge tokens to a Talent.
	 * @param {Object} [options]
	 * @returns {Promise<void>}
	 */
	async _exhaustTalent(options = {})
	{
		await this.update({"system.rechargeTokens": 4});
	}

	/**
	 * Post-process an update operation for a single talent instance. Post-operation events occur for all connected clients.
	 * @param {Object} changed The differential data that was changed relative to the documents prior values.
	 * @param {Object} options Additional options which modify the update request.
	 * @param {string} userId The id of the User requesting the talent update.
	 * @protected
	 */
	_onTalentUpdate(changed, options, userId)
	{
		if(changed.system?.socket)
			this.#onTalentSocketChange(changed.system.socket);
	}

	/**
	 * Performs follow-up operations after a talent's socket has changed.
	 * @param newSocket {string} The new socket used by the talent.
	 * @private
	 */
	#onTalentSocketChange(newSocket)
	{
		this.actor?.preventMultipleItemsOnSameSocket(this);

		const matches = newSocket.match(new RegExp(/(.*)_(\d+)/)),
			  owningDocument = fromUuidSync(matches[1]),
			  owningDocumentSockets = owningDocument.system.sockets;

		owningDocumentSockets[matches[2]].item = this.uuid;
		owningDocument.update({"system.sockets": owningDocumentSockets});

		if(owningDocument.type === "career")
			for(const effect of this.effects)
				if(effect.macro.type === wfrp3e.data.macros.CareerSocketMacro.TYPE)
					effect.triggerMacro();
	}

	/**
	 * Makes usage of the talent by triggering one of its active effect.
	 * @param {number} options.id The ID of the active effect to trigger.
	 * @returns {Promise<void>}
	 * @protected
	 */
	async _useTalent(options= {})
	{
		if(!options.id)
			throw new Error("ActiveEffect ID is needed");
		if(this.system.rechargeTokens > 0)
			ui.notifications.warn(game.i18n.localize("TALENT.WARNINGS.recharging"));
		else if(this.system.socket == null)
			ui.notifications.warn(game.i18n.localize("TALENT.WARNINGS.notSocketed"));
		else
			await this.effects.get(options.id).triggerMacro();
	}

	//#endregion
	//#region Trapping methods

	/**
	 * Changes the quantity of the trapping.
	 * @param increment {Number} The amount of quantity to add (or remove if negative).
	 * @returns {Promise<void>}
	 */
	async changeQuantity(increment)
	{
		await this.update({"system.quantity": this.system.quantity + increment});
	}

	//#endregion
	//#region Weapon methods

	/**
	 * Makes usage of the weapon.
	 * @param {Object} [options]
	 * @returns {Promise<void>}
	 * @protected
	 */
	async _useWeapon(options = {})
	{
		const weaponType = wfrp3e.data.items.Weapon.GROUPS[this.system.group].type;
		let action = null;

		if(weaponType === "melee")
			action = this.actor.itemTypes.action.find((action) => action.name === game.i18n.localize("ACTION.CARDS.meleeStrike"));
		else if(weaponType === "ranged")
			action = this.actor.itemTypes.action.find((action) => action.name === game.i18n.localize("ACTION.CARDS.rangedShot"));
		else
			throw new Error("Unable to define the weapon type.");

		if(!action)
			throw new Error("Unable to find the relevant basic Action.");

		const diePool = await wfrp3e.applications.dice.CheckBuilder.wait({
			diePool: await wfrp3e.dice.DiePool.createFromAction(
				this.actor,
				action,
				this.actor.system.currentStanceName,
				{weapon: this.uuid}
			)
		});
		await diePool.roll();
	}

	/**
	 * Adds a new quality to the weapon's list of qualities.
	 * @returns {Promise<void>}
	 */
	async addNewQuality()
	{
		const qualities = this.system.qualities;
		qualities.push({
			name: "attuned",
			rating: 1
		});
		await this.update({"system.qualities": qualities});
	}


	/**
	 * Removes a quality from the weapon's list of qualities.
	 * @param {Number} index
	 * @returns {Promise<void>}
	 */
	async removeQuality(index)
	{
		const qualities = this.system.qualities;

		qualities.splice(index, 1);

		await this.update({"system.qualities": qualities});
	}

	/**
	 * Removes the last quality from the weapon's list of qualities.
	 * @returns {Promise<void>}
	 */
	async removeLastQuality()
	{
		const qualities = this.system.qualities;

		qualities.pop();

		await this.update({"system.qualities": qualities});
	}

	/**
	 * Fetches the details of the weapon.
	 * @param {Object} [options]
	 * @param options
	 * @returns {Promise<string>}
	 * @protected
	 */
	async _getWeaponDetails(options = {})
	{
		return await foundry.applications.ux.TextEditor.implementation.enrichHTML(
			`${this.system.description}${this.system.special}`
		);
	}

	//#endregion
}
