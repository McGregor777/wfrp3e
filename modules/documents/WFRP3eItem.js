import ActionEffectEditor from "../applications/apps/ActionEffectEditor.js";
import CheckBuilder from "../applications/dice/CheckBuilder.js";
import CheckHelper from "../dice/CheckHelper.js";
import WFRP3eEffect from "./WFRP3eEffect.js";
import {capitalize} from "../helpers.js";

export default class WFRP3eItem extends Item
{
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
	 * @param {Object} [options]
	 * @returns {Promise<string>}
	 * @protected
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
	 * Makes usage of the WFRP3eItem. The result depends on the type of the WFRP3eItem.
	 * @param {Object} [options]
	 */
	async useItem(options = {})
	{
		const functionName = `_use${capitalize(this.type)}`;

		if(this[`${functionName}`])
			this[`${functionName}`](options);
		else
			await this.sheet.render(true);
	}

	/**
	 * Creates a new WFRP3eEffect for the WFRP3eItem.
	 * @param {Object} [data] An Object of optional data for the new WFRP3eEffect.
	 * @returns {Promise<void>}
	 */
	async createEffect(data = {})
	{
		await WFRP3eEffect.create({
			name: this.name,
			img: "icons/svg/dice-target.svg",
			...data
		}, {parent: this});
	}

	//#region Ability methods

	/**
	 * Makes usage of the Ability by triggering one of its WFRP3eEffect.
	 * @param {number} options.id The ID of the WFRP3eEffect to trigger.
	 * @returns {Promise<void>}
	 * @private
	 */
	async _useAbility(options = {})
	{
		if(!options.id)
			throw new Error("Effect ID is needed");
		if(this.system.cooldown)
			ui.notifications.warn(game.i18n.localize("ABILITY.WARNINGS.cooldown"));
		else
			await this.effects.get(options.id).triggerEffect();
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
		const effects = this.effects.filter(effect => effect.system.type === "requirementCheck");
		let result = true;

		for(const effect of effects)
			result = await effect.triggerEffect({
				parameters: [parameters.actor ?? this.parent],
				parameterNames: ["actor"]
			});

		return result;
	}

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
	 * Adds recharge tokens to an Action equal to its recharge rating.
	 * @param {string} face The Action face used to determine the recharge rating.
	 */
	async exhaustAction(face)
	{
		await this.update({"system.rechargeTokens": this.system[face].rechargeRating});
	}

	/**
	 * Removes an effect from the Action.
	 * @param face {string} The Action's face of the effect to remove.
	 * @param symbol {string} The symbol used by the effect to remove.
	 * @param index {string} The index to the effect to remove.
	 */
	async removeActionEffect(face, symbol, index)
	{
		const effects = this.system[face].effects[symbol];

		effects.splice(index, 1);

		await this.update({[`system.${face}.effects.${symbol}`]: effects});
	}

	/**
	 * Fetches the details of the Action.
	 * @param {Object} [options]
	 * @returns {Promise<string>}
	 * @protected
	 */
	async _getActionDetails(options = {})
	{
		if(!options.face)
			return console.error("Unable to show action's details without knowing the face.");

		let html = "";

		for(const stance of Object.keys(CONFIG.WFRP3e.stances)) {
			let face = this.system[stance],
				content = `<div>
						 <div><p>${face.check}</p></div>
						 <div>${face.requirements}</div>
					 </div>`;

			const effects = {};
			for(const [key, symbol] of Object.entries(CONFIG.WFRP3e.symbols)) {
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

			const positiveEffects = Object.values(effects).filter(effect => effect.type === "positive"),
				  negativeEffects = Object.values(effects).filter(effect => effect.type === "negative");

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
	 * @private
	 */
	async _useAction(options = {})
	{
		if(!options.face)
			throw new Error("The Action face to use is needed.");

		if(this.system.rechargeTokens > 0)
			ui.notifications.warn(game.i18n.localize("ACTION.WARNINGS.recharging"));
		else if(CheckHelper.doesRequireNoCheck(this.system[options.face].check))
			await foundry.applications.api.DialogV2.confirm({
				window: {title: game.i18n.localize("APPLICATION.TITLE.ActionUsage")},
				modal: true,
				content: `<p>${game.i18n.format("APPLICATION.DESCRIPTION.ActionUsage", {action: this.system[options.face].name})}</p>`,
				submit: async (result) => {
					if(result) {
						await this.exhaustAction(options.face);

						return ChatMessage.create({
							content: await renderTemplate("systems/wfrp3e/templates/partials/action-effects.hbs", {
								action: this,
								face: options.face,
								symbols: CONFIG.WFRP3e.symbols,
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
		else
			await CheckBuilder.prepareActionCheck(this.actor, this, options.face);
	}

	//#endregion
	//#region Career methods

	/**
	 * Calculates the cost of a transition from the actual WFRP3eCareer to another.
	 * @param {WFRP3eItem} newCareer The new WFRP3eCareer which is transitioned into.
	 * @returns {number} The cost of the career transition in experience points.
	 */
	calculateCareerTransitionCost(newCareer)
	{
		let cost = 4;

		if(this.system.advances.dedicationBonus)
			cost--;

		const careerTraits = this.system.traits.toLowerCase().split(",").map(trait => trait.trim()),
			  newCareerTraits = newCareer.system.traits.toLowerCase().split(",").map(trait => trait.trim());
		for(const trait of careerTraits) {
			if(trait !== game.i18n.localize("TRAITS.specialist") && newCareerTraits.includes(trait))
				cost--;

			if(cost <= 1)
				break;
		}

		return cost;
	}

	/**
	 * Post-process an update operation for a single WFRP3eCareer instance. Post-operation events occur for all connected clients.
	 * @param changed {any} The differential data that was changed relative to the documents prior values
	 * @param options {any} Additional options which modify the update request
	 * @param userId {string} The id of the User requesting the WFRP3eCareer update
	 * @private
	 */
	_onCareerUpdate(changed, options, userId)
	{
		if(changed.system?.current)
			this.#onCurrentCareerChange();

		if(changed.system?.sockets)
			this.#onCareerSocketChange(changed.system.sockets);
	}

	/**
	 * Upon transitioning from a WFRP3eCareer to another, ensures that the sockets of the owner WFRP3eCharacter are reset.
	 * @private
	 */
	#onCurrentCareerChange()
	{
		if(this.actor) {
			const otherCareers = this.actor.itemTypes.career.filter(career => career !== this);

			for(const otherCareer of otherCareers)
				otherCareer.update({"system.current": false});

			this.actor.resetSockets(this.uuid);
		}
	}

	/**
	 * Upon change to any of the WFRP3eCareer socket's type, ensures that the sockets of the WFRP3eCharacter are reset.
	 * @param {Object} sockets The current WFRP3eCareer sockets.
	 * @private
	 */
	#onCareerSocketChange(sockets)
	{
		const socketedItems = sockets.map(socket => fromUuidSync(socket.item));

		socketedItems.forEach((item, index) => {
			if(item.system.type !== sockets[index].type)
				this.actor?.resetSockets(this.uuid);
		});
	}

	/**
	 * Adds a new socket to the Career's list of sockets.
	 */
	async addNewSocket()
	{
		await this.update({"system.sockets": [...this.system.sockets, {item: null, type: "any"}]});
	}

	/**
	 * Deletes a socket from the Career's list of sockets.
	 * @param {Number} index The index of the socket to remove.
	 */
	async deleteSocket(index)
	{
		this.system.sockets.splice(index, 1);
		await this.update({"system.sockets": this.system.sockets});
	}

	//#endregion
	//#region Skill methods

	/**
	 * Fetches the details of the Skill.
	 * @param {Object} [options]
	 * @returns {Promise<string>}
	 * @protected
	 */
	async _getSkillDetails(options = {})
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
		await CheckBuilder.prepareSkillCheck(this.actor, this);
	}

	//#endregion
	//#region Talent methods

	async exhaustTalent()
	{
		await this.update({"system.rechargeTokens": 4});
	}

	/**
	 * Post-process an update operation for a single WFRP3eTalent instance. Post-operation events occur for all connected clients.
	 * @param changed {any} The differential data that was changed relative to the documents prior values
	 * @param options {any} Additional options which modify the update request
	 * @param userId {string} The id of the User requesting the WFRP3eTalent update
	 * @private
	 */
	_onTalentUpdate(changed, options, userId)
	{
		if(changed.system?.socket)
			this.#onTalentSocketChange(changed.system.socket);
	}

	/**
	 * Performs follow-up operations after a Talent's socket has changed.
	 * @param newSocket {string} The new socket used by the Talent.
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
				if(effect.type === "onCareerSocket")
					effect.triggerEffect();
	}

	/**
	 * Makes usage of the Talent by triggering one of its WFRP3eEffect.
	 * @param {number} options.id The ID of the WFRP3eEffect to trigger.
	 * @returns {Promise<void>}
	 * @private
	 */
	async _useTalent(options= {})
	{
		if(!options.id)
			throw new Error("Effect ID is needed");
		if(this.system.rechargeTokens > 0)
			ui.notifications.warn(game.i18n.localize("TALENT.WARNINGS.recharging"));
		else if(this.system.socket == null)
			ui.notifications.warn(game.i18n.localize("TALENT.WARNINGS.notSocketed"));
		else
			await this.effects.get(options.id).triggerEffect();
	}

	//#endregion
	//#region Trapping methods

	/**
	 * Changes the quantity of the Trapping.
	 * @param increment {Number} The amount of quantity to add (or remove if negative).
	 */
	async changeQuantity(increment)
	{
		await this.update({"system.quantity": this.system.quantity + increment});
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

		await CheckBuilder.prepareActionCheck(this.actor, action, this.actor.getCurrentStanceName(), {weapon: this.uuid});
	}

	/**
	 * Adds a new quality to the Weapon's list of qualities.
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
	 * Removes a quality from the Weapon's list of qualities.
	 * @param {Number} index
	 */
	async removeQuality(index)
	{
		const qualities = this.system.qualities;

		qualities.splice(index, 1);

		await this.update({"system.qualities": qualities});
	}

	/**
	 * Removes the last quality from the Weapon's list of qualities.
	 */
	async removeLastQuality()
	{
		const qualities = this.system.qualities;

		qualities.pop();

		await this.update({"system.qualities": qualities});
	}

	/**
	 * Fetches the details of the Weapon.
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