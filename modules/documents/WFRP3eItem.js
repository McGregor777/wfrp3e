import CheckHelper from "../CheckHelper.js";
import {capitalize} from "../helpers.js";

export default class WFRP3eItem extends Item
{
	/** @inheritDoc */
	prepareData()
	{
		super.prepareData();

		const functionName = `_prepare${capitalize(this.type)}`;

		if(this[`${functionName}`])
			this[`${functionName}`]();
	}

	/**
	 * @param {Object} [options]
	 */
	useItem(options = {})
	{
		const functionName = `use${capitalize(this.type)}`;

		if(this[`${functionName}`])
			this[`${functionName}`](options);
		else
			this.sheet.render(true);
	}

	/**
	 * @param {Object} [options]
	 */
	async useAction(options = {})
	{
		if(!options.face)
			throw new Error("Knowing which face of the Action to use is needed.");

		if(this.system.rechargeTokens > 0)
			ui.notifications.warn(game.i18n.localize("ACTION.Recharging"));
		else {
			if (CheckHelper.doesRequireNoCheck(this.system[options.face].check))
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
	}

	/**
	 * @param {Object} [options]
	 */
	async useSkill(options = {})
	{
		await CheckHelper.prepareSkillCheck(this.actor, this);
	}

	/**
	 * @param {Object} [options]
	 */
	async useWeapon(options = {})
	{
		const weaponType = CONFIG.WFRP3e.weapon.groups[this.system.group].type;
		let action = null;

		if(weaponType === "melee")
			action = this.actor.itemTypes.action.find((action) => action.name === game.i18n.localize("ACTION.MeleeStrike"));
		else if(weaponType === "ranged")
			action = this.actor.itemTypes.action.find((action) => action.name === game.i18n.localize("ACTION.RangedShot"));
		else
			throw new Error("Unable to define the weapon type.");

		if(!action)
			throw new Error("Unable to find the relevant basic Action.");

		await CheckHelper.prepareActionCheck(this.actor, action, this.actor.getCurrentStanceName(), {weapon: this});
	}

	/**
	 * Adds recharge tokens to an Action equal to its recharge rating.
	 * @param {string} face
	 */
	exhaustAction(face)
	{
		this.update({"system.rechargeTokens": this.system[face].rechargeRating});
	}

	/**
	 * Adds a new effect to the Action.
	 * @param face {string} The Action's face which receives the new effect.
	 * @param symbol {string} The symbol used by the new effect.
	 */
	addNewEffect(face, symbol)
	{
		const effects = this.system[face].effects[symbol];
		const updates = {system: {}};
		updates.system[face] = {effects: {}};

		effects.push({"symbolAmount": 1, "description": ""});

		updates.system[face].effects[symbol] = effects;

		this.update(updates);

	}

	/**
	 * Removes an effect from the Action.
	 * @param face {string} The Action's face of the effect to remove.
	 * @param symbol {string} The symbol used by the effect to remove.
	 * @param index {string} The index to the effect to remove.
	 */
	removeEffect(face, symbol, index)
	{
		const effects = this.system[face].effects[symbol];
		const updates = {system: {}};
		updates.system[face] = {effects: {}};

		effects.splice(index, 1)
		updates.system[face].effects[symbol] = effects;

		this.update(updates);
	}

	/**
	 * Prepare Action's data.
	 * @private
	 */
	_prepareAction() {}

	/**
	 * Prepare Armour's data.
	 * @private
	 */
	_prepareArmour() {}

	/**
	 * Prepare Career's data.
	 * @private
	 */
	_prepareCareer() {}

	/**
	 * Prepare CriticalWound's data.
	 * @private
	 */
	_prepareCriticalWound() {}

	/**
	 * Prepare Disease's data.
	 * @private
	 */
	_prepareDisease() {}

	/**
	 * Prepare Skill's data.
	 * @private
	 */
	_prepareSkill() {}

	/**
	 * Prepare Talent's data.
	 * @private
	 */
	_prepareTalent() {}

	/**
	 * Prepare Weapon's data.
	 * @private
	 */
	_prepareWeapon()
	{
		if(!(this.system.qualities instanceof Array))
			this._convertQualitiesToArray();
	}

	/**
	/**
	 * Adds a new Quality to the Weapon's list of Qualities.
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
	 * Removes the last Quality from the Weapon's list of Qualities.
	 */
	removeLastQuality()
	{
		const qualities = this.system.qualities;

		qualities.pop();

		this.update({"system.qualities": qualities});
	}

	/**
	 * Converts the Item's Qualities to Array.
	 * @private
	 */
	_convertQualitiesToArray()
	{
		this.update({"system.qualities": Object.values(this.system.qualities)});
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
	 * Adds a new Talent socket to the Career's list of Talent sockets.
	 */
	addNewTalentSocket()
	{
		const talentSockets = this.system.talentSockets;

		talentSockets.push("focus");

		this.update({"system.talentSockets": talentSockets});
	}

	/**
	 * Removes the last Talent socket from the Career's list of Talent sockets.
	 */
	removeLastTalentSocket()
	{
		const talentSockets = this.system.talentSockets;

		talentSockets.pop();

		this.update({"system.talentSockets": talentSockets});
	}

	/** @inheritDoc */
	_onUpdate(changed, options, userId)
	{
		super._onUpdate(changed, options, userId);

		try {
			const functionName = `_on${capitalize(this.type)}Update`;

			if(this[`${functionName}`])
				this[`${functionName}`](changed, options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when updating the Item ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/**
	 * Perform follow-up operations after a Career is updated. Post-update operations occur for all clients after the update is broadcast.
	 * @param changed {any} The differential data that was changed relative to the documents prior values
	 * @param options {any} Additional options which modify the update request
	 * @param userId {string} The id of the User requesting the document update
	 * @private
	 */
	_onCareerUpdate(changed, options, userId)
	{
		if(changed.system?.current)
			this._onCurrentCareerChange();

		if(changed.system?.talentSockets)
			this._onCareerTalentSocketsChange();
	}

	/**
	 * Perform follow-up operations after a Talent is updated. Post-update operations occur for all clients after the update is broadcast.
	 * @param changed {any} The differential data that was changed relative to the documents prior values
	 * @param options {any} Additional options which modify the update request
	 * @param userId {string} The id of the User requesting the document update
	 * @private
	 */
	_onTalentUpdate(changed, options, userId)
	{
		if(changed.system?.talentSocket)
			this._onTalentSocketChange(changed.system?.talentSocket);
	}

	/**
	 * Performs check-ups following up a Career's Talent sockets change.
	 * @private
	 */
	_onCurrentCareerChange()
	{
		if(this.actor) {
			this.actor.itemTypes.career.filter(career => career !== this).forEach((otherCareer, index) => {
				otherCareer.update({"system.current": false});
			});
			this.actor.resetTalentsSocket("career");
		}
	}

	/**
	 * Performs check-ups following up a Career's Talent sockets change.
	 * @private
	 */
	_onCareerTalentSocketsChange()
	{
		if(this.actor)
			this.actor.resetTalentsSocket("career");
	}

	/**
	 * Performs check-ups following up a Talent socket change to a non-null value.
	 * @param talent {WFRP3eItem} The Talent that has been changed
	 * @param newTalentSocket {string}
	 * @private
	 */
	_onTalentSocketChange(talent, newTalentSocket)
	{
		if(this.actor)
			this.actor.checkForDuplicateTalentSockets(newTalentSocket);
	}
}