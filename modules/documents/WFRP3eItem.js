import ActionEffectEditor from "../applications/ActionEffectEditor.js";
import CheckHelper from "../CheckHelper.js";
import {capitalize} from "../helpers.js";

export default class WFRP3eItem extends Item
{
	/** @inheritDoc */
	prepareData()
	{
		super.prepareData();

		try {
			const functionName = `_prepare${capitalize(this.type)}`;

			if(this[functionName])
				this[functionName]();
		}
		catch(error) {
			console.error(`Something went wrong when updating the Item ${this.name} of type ${this.type}: ${error}`);
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
	 * Fetches the details of the WFRP3eItem, depending on its type.
	 * @returns {*}
	 */
	getDetails()
	{
		const functionName = `_get${capitalize(this.type)}Details`;

		if(this[`${functionName}`])
			return this[`${functionName}`]();
		else
			return this.system.description;
	}

	/**
	 * Makes usage of the WFRP3eItem. The result depends on the type of the WFRP3eItem.
	 * @param {Object} [options]
	 */
	useItem(options = {})
	{
		const functionName = `_use${capitalize(this.type)}`;

		if(this[`${functionName}`])
			this[`${functionName}`](options);
		else
			this.sheet.render(true);
	}

	/**
	 * Creates a new effect for the WFRP3eItem.
	 */
	async createEffect()
	{
		const effects = this.system.effects;
		effects.push({
			script: null,
			type: Object.keys(CONFIG.WFRP3e.scriptTypes)[0]
		});
		this.update({"system.effects": effects});
	}

	/**
	 * Removes an effect from the WFRP3eItem.
	 * @param index {string} The index to the effect to remove.
	 */
	removeEffect(index)
	{
		const effects = this.system.effects;
		effects.splice(index, 1);
		this.update({["system.effects"]: effects});
	}

	/**
	 * Triggers an effect contained by the WFRP3eItem.
	 * @param {Object} effect The effect to trigger.
	 * @param {Object} options
	 * @param {Object[]} [options.parameters]
	 * @param {string[]} [options.parameterNames]
	 * @returns {Promise<void>}
	 */
	async triggerEffect(effect, {parameters = [], parameterNames = []} = {})
	{
		try {
			const fn = new foundry.utils.AsyncFunction(...parameterNames, effect.script);
			await fn.call(this, ...parameters);
		}
		catch(error) {
			console.error(error);
		}
	}

	/**
	 * Checks an effect condition script.
	 * @param {Object} effect The effect to trigger.
	 * @param {Object} options
	 * @param {Object[]} [options.parameters]
	 * @param {string[]} [options.parameterNames]
	 * @returns {Promise<boolean>} The result of the condition script.
	 * @private
	 */
	checkEffectConditionScript(effect, {parameters = [], parameterNames = []} = {})
	{
		try {
			const fn = new Function(...parameterNames, effect.conditionScript);
			return fn.call(this, ...parameters);
		}
		catch(error) {
			console.error(error);
		}
	}

	//#region Ability methods

	/**
	 * Makes usage of the Ability by triggering one of its effects.
	 * @param {number} options.index The index of the effect to trigger.
	 * @returns {Promise<void>}
	 * @private
	 */
	async _useAbility(options = {})
	{
		if(!options.index)
			throw new Error("Effect index is needed");
		if(this.system.cooldown)
			ui.notifications.warn(game.i18n.localize("ABILITY.WARNINGS.cooldown"));
		else
			await this.triggerEffect(this.system.effects[options.index]);
	}

	//#endregion
	//#region Action methods

	/**
	 * Creates a new effect for the Action and opens the Action Effect Editor to edit it.
	 * @param face {string} The Action's face which receives the new effect.
	 */
	async createActionEffect(face)
	{
		await new ActionEffectEditor({
			data: {
				action: this,
				face,
				effect: {
					symbolAmount: 1,
					description: "",
					script: ""
				}
			}
		}).render(true);
	}

	/**
	 * Opens the Action Effect Editor to edit an Action effect.
	 * @param face {string} The Action's face of the effect to edit.
	 * @param symbol {string} The symbol used by the effect to edit.
	 * @param index {string} The index to the effect to edit.
	 */
	async editActionEffect(face, symbol, index)
	{
		await new ActionEffectEditor({
			data: {
				action: this,
				face,
				effect: this.system[face].effects[symbol][index],
				symbol,
				index
			}
		}).render(true);
	}

	/**
	 * Removes an effect from the Action.
	 * @param face {string} The Action's face of the effect to remove.
	 * @param symbol {string} The symbol used by the effect to remove.
	 * @param index {string} The index to the effect to remove.
	 */
	removeActionEffect(face, symbol, index)
	{
		const effects = this.system[face].effects[symbol];

		effects.splice(index, 1);

		this.update({[`system.${face}.effects.${symbol}`]: effects});
	}

	/**
	 * Adds recharge tokens to an Action equal to its recharge rating.
	 * @param {string} face The Action face used to determine the recharge rating.
	 */
	exhaustAction(face)
	{
		this.update({"system.rechargeTokens": this.system[face].rechargeRating});
	}

	/**
	 * Makes usage of the Action.
	 * @param {Object} [options]
	 * @returns {Promise<void>}
	 * @private
	 */
	async _useAction(options = {})
	{
		if(!options.face)
			throw new Error("Knowing which face of the Action to use is needed.");

		if(this.system.rechargeTokens > 0)
			ui.notifications.warn(game.i18n.localize("ACTION.WARNINGS.recharging"));
		else if(CheckHelper.doesRequireNoCheck(this.system[options.face].check))
			await new Dialog({
				title: game.i18n.localize("APPLICATION.TITLE.ActionUsage"),
				content: "<p>" + game.i18n.format("APPLICATION.DESCRIPTION.ActionUsage", {action: this.system[options.face].name}) + "</p>",
				buttons: {
					confirm: {
						icon: '<span class="fa fa-check"></span>',
						label: game.i18n.localize("Yes"),
						callback: async dlg => {
							this.exhaustAction(options.face);

							return ChatMessage.create({
								content: await renderTemplate("systems/wfrp3e/templates/partials/action-effects.hbs", {
									action: this,
									face: options.face,
									symbols: CONFIG.WFRP3e.symbols,
									effects: this.system[options.face].effects
								}),
								flavor: game.i18n.format("ACTION.UsageMessage", {
									actor: this.actor.name,
									action: this.system[options.face].name
								}),
								speaker: ChatMessage.getSpeaker({actor: this.actor})
							});
						}
					},
					cancel: {
						icon: '<span class="fas fa-xmark"></span>',
						label: game.i18n.localize("Cancel")
					},
				},
				default: "confirm"
			}).render(true);
		else
			await CheckHelper.prepareActionCheck(this.actor, this, options.face);
	}

	//#endregion
	//#region Career methods

	/**
	 * Performs follow-up operations after a Career is updated. Post-update operations occur for all clients after the update is broadcast.
	 * @param changed {any} The differential data that was changed relative to the documents prior values
	 * @param options {any} Additional options which modify the update request
	 * @param userId {string} The id of the User requesting the document update
	 * @private
	 */
	_onCareerUpdate(changed, options, userId)
	{
		if(changed.system?.current)
			this._onCurrentCareerChange();

		if(changed.system?.sockets)
			this._onCareerSocketsChange();
	}

	/**
	 * Performs follow-up operations after a Character's current Career has changed.
	 * @private
	 */
	_onCurrentCareerChange()
	{
		if(this.actor) {
			this.actor.itemTypes.career.filter(career => career !== this).forEach((otherCareer, index) => {
				otherCareer.update({"system.current": false});
			});
			this.actor.resetSocket("career");
		}
	}

	/**
	 * Performs follow-up operations after a Career's Talent sockets change.
	 * @private
	 */
	_onCareerSocketsChange()
	{
		this.actor?.resetSocket("career");
	}

	/**
	 * Adds a new Race restriction to the Career's list of Race restrictions.
	 */
	addNewRaceRestriction()
	{
		const raceRestrictions = this.system.raceRestrictions;
		raceRestrictions.push("human");
		this.update({"system.raceRestrictions": raceRestrictions});
	}

	/**
	 * Removes the last Race restriction from the Career's list of Race restrictions.
	 */
	removeLastRaceRestriction()
	{
		const raceRestrictions = this.system.raceRestrictions;
		raceRestrictions.pop();
		this.update({"system.raceRestrictions": raceRestrictions});
	}

	/**
	 * Adds a new socket to the Career's list of sockets.
	 */
	addNewSocket()
	{
		this.update({"system.sockets": [...this.system.sockets, {item: null, type: "any"}]});
	}

	/**
	 * Removes the last socket from the Career's list of sockets.
	 */
	removeLastSocket()
	{
		const sockets = this.system.sockets;
		sockets.pop();
		this.update({"system.sockets": sockets});
	}

	//#endregion
	//#region Skill methods

	/**
	 * Fetches the details of the Skill.
	 * @returns {String}
	 * @private
	 */
	_getSkillDetails()
	{
		return game.i18n.format("SKILL.specialisationList", {specialisations: this.system.specialisations ?? ""});
	}

	/**
	 * Makes usage of the Skill.
	 * @param {Object} [options]
	 * @returns {Promise<void>}
	 * @private
	 */
	async _useSkill(options = {})
	{
		await CheckHelper.prepareSkillCheck(this.actor, this);
	}

	//#endregion
	//#region Talent methods

	exhaustTalent()
	{
		this.update({"system.rechargeTokens": 4});
	}

	/**
	 * Performs follow-up operations after a Talent is updated. Post-update operations occur for all clients after the update is broadcast.
	 * @param changed {any} The differential data that was changed relative to the documents prior values
	 * @param options {any} Additional options which modify the update request
	 * @param userId {string} The id of the User requesting the document update
	 * @private
	 */
	_onTalentUpdate(changed, options, userId)
	{
		if(changed.system?.socket)
			this._onSocketChange(changed.system.socket);
	}

	/**
	 * Performs follow-up operations after a Talent's socket has changed.
	 * @param newSocket {string} The new socket used by the Talent.
	 * @private
	 */
	_onSocketChange(newSocket)
	{
		this.actor?.preventMultipleItemsOnSameSocket(this);

		const matches = newSocket.match(new RegExp(/(.*)_(\d+)/)),
			  owningDocument = fromUuidSync(matches[1]),
			  owningDocumentSockets = owningDocument.system.sockets;

		owningDocumentSockets[matches[2]].item = this.uuid;
		owningDocument.update({"system.sockets": owningDocumentSockets});

		if(owningDocument.type === "career")
			this.system.effects.forEach(async effect => {
				if(effect.type === "onCareerSocket")
					await this.triggerEffect(effect);
			});
	}

	/**
	 * Makes usage of the Talent by triggering one of its effects.
	 * @param {number} options.index The index of the effect to trigger.
	 * @returns {Promise<void>}
	 * @private
	 */
	async _useTalent(options= {})
	{
		if(!options.index)
			throw new Error("Effect index is needed");
		if(this.system.rechargeTokens > 0)
			ui.notifications.warn(game.i18n.localize("TALENT.WARNINGS.recharging"));
		else if(this.system.socket == null)
			ui.notifications.warn(game.i18n.localize("TALENT.WARNINGS.notSocketed"));
		else
			await this.triggerEffect(this.system.effects[options.index]);
	}

	//#endregion
	//#region Trapping methods

	/**
	 * Changes the quantity of the Trapping.
	 * @param increment {Number} The amount of quantity to add (or remove if negative).
	 */
	changeQuantity(increment)
	{
		this.update({"system.quantity": this.system.quantity + increment});
	}

	//#endregion
	//#region Weapon methods

	/**
	 * Makes usage of the Weapon.
	 * @param {Object} [options]
	 * @returns {Promise<void>}
	 * @private
	 */
	async _useWeapon(options = {})
	{
		const weaponType = CONFIG.WFRP3e.weapon.groups[this.system.group].type;
		let action = null;

		if(weaponType === "melee")
			action = this.actor.itemTypes.action.find((action) => action.name === game.i18n.localize("ACTION.CARDS.meleeStrike"));
		else if(weaponType === "ranged")
			action = this.actor.itemTypes.action.find((action) => action.name === game.i18n.localize("ACTION.CARDS.rangedShot"));
		else
			throw new Error("Unable to define the weapon type.");

		if(!action)
			throw new Error("Unable to find the relevant basic Action.");

		await CheckHelper.prepareActionCheck(this.actor, action, this.actor.getCurrentStanceName(), {weapon: this});
	}

	/**
	 * Adds a new quality to the Weapon's list of qualities.
	 */
	addNewQuality()
	{
		const qualities = this.system.qualities;
		qualities.push({
			name: "attuned",
			rating: 1
		});
		this.update({"system.qualities": qualities});
	}

	/**
	 * Removes the last quality from the Weapon's list of qualities.
	 */
	removeLastQuality()
	{
		const qualities = this.system.qualities;

		qualities.pop();

		this.update({"system.qualities": qualities});
	}

	/**
	 * Fetches the details of the Weapon.
	 * @returns {String}
	 * @private
	 */
	_getWeaponDetails()
	{
		return this.system.description.concat(this.system.special);
	}

	//#endregion
}