import {sortTalentsByType} from "../../helpers.js";

/** @inheritDoc */
export default class WFRP3eActorSheet extends ActorSheet
{
	/** @inheritDoc */
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			dragDrop: [{dragSelector: ".item", dropSelector: null}]
		};
	}

	/** @inheritdoc */
	get template()
	{
		return `systems/wfrp3e/templates/applications/actors/${this.actor.type.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}-sheet.hbs`;
	}

	/** @inheritdoc */
	getData()
	{
		const data = {
			...super.getData(),
			actionTypes: CONFIG.WFRP3e.actionTypes,
			conditionDurations: CONFIG.WFRP3e.conditionDurations,
			characteristics: CONFIG.WFRP3e.characteristics,
			diseaseSymptoms: CONFIG.WFRP3e.disease.symptoms,
			origins: Object.values(CONFIG.WFRP3e.availableRaces).reduce((origins, race) => {
				Object.entries(race.origins).forEach(origin => origins[origin[0]] = origin[1]);
				return origins;
			}, {}),
			stances: CONFIG.WFRP3e.stances,
			symbols: CONFIG.WFRP3e.symbols,
			talentTypes: CONFIG.WFRP3e.talentTypes,
			weaponGroups: CONFIG.WFRP3e.weapon.groups,
			weaponQualities: CONFIG.WFRP3e.weapon.qualities,
			weaponRanges: CONFIG.WFRP3e.weapon.ranges
		};
		data.items = this._buildItemLists(data.items);
		data.hasAbility = data.items.abilities.length > 0
			|| data.items.conditions.length > 0
			|| data.items.criticalWounds.length > 0
			|| data.items.diseases.length > 0
			|| data.items.insanities.length > 0
			|| data.items.miscasts.length > 0
			|| data.items.mutations.length > 0;
		data.hasTrapping = (data.items.armours.length > 0 || data.items.trappings.length > 0 || data.items.weapons.length > 0);

		return data;
	}

	/**
	 * Returns items sorted by type.
	 * @param {Array} items The items owned by the Actor.
	 * @returns {Object} The sorted items owned by the Actor.
	 * @private
	 */
	_buildItemLists(items)
	{
		const basicTrait = game.i18n.localize("ACTION.TRAITS.Basic");
		const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));
		const actions = sortedItems.filter(item => item.type === "action").sort((a, b) => {
			if(a.system.conservative.traits.includes(basicTrait) && !b.system.conservative.traits.includes(basicTrait))
				return -1;
			else if(!a.system.conservative.traits.includes(basicTrait) && b.system.conservative.traits.includes(basicTrait))
				return 1
			else
				return 0;
		});
		const talents = sortedItems.filter(item => item.type === "talent");

		return {
			abilities: sortedItems.filter(item => item.type === "ability"),
			actions: Object.keys(CONFIG.WFRP3e.actionTypes).reduce((sortedActions, actionType) => {
				sortedActions[actionType] = actions.filter(action => action.system.type === actionType);
				return sortedActions;
			}, {}),
			armours: sortedItems.filter(item => item.type === "armour"),
			careers: sortedItems.filter(item => item.type === "career"),
			conditions: sortedItems.filter(item => item.type === "condition"),
			criticalWounds: sortedItems.filter(item => item.type === "criticalWound"),
			diseases: sortedItems.filter(item => item.type === "disease"),
			insanities: sortedItems.filter(item => item.type === "insanity"),
			miscasts: sortedItems.filter(item => item.type === "miscast"),
			money: sortedItems.filter(item => item.type === "money"),
			mutations: sortedItems.filter(item => item.type === "mutation"),
			skills: sortedItems.filter(item => item.type === "skill"),
			talents: sortTalentsByType(talents),
			trappings: sortedItems.filter(item => item.type === "trapping"),
			weapons: sortedItems.filter(item => item.type === "weapon")
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".characteristic a").click(this._onCharacteristicClick.bind(this));

		html.find(".impairment .token")
			.click(this._onImpairmentTokenClick.bind(this, 1))
			.contextmenu(this._onImpairmentTokenClick.bind(this, -1));

		html.find(".flip-link").click(this._onFlipClick.bind(this));

		html.find(".item-roll-link").click(this._onItemRollClick.bind(this));
		html.find(".item-expand-link").click(this._onItemExpandClick.bind(this));
		html.find(".item-edit-link").click(this._onItemEditClick.bind(this));
		html.find(".item-delete-link").click(this._onItemDeleteClick.bind(this));

		html.find(".item-name-link")
			.click(this._onItemLeftClick.bind(this))
			.contextmenu(this._onItemRightClick.bind(this));

		html.find(".item-input").change(this._onItemInput.bind(this));

		html.find(".quantity-link")
			.click(this._onQuantityClick.bind(this, 1))
			.contextmenu(this._onQuantityClick.bind(this, -1));

		html.find(".recharge-token")
			.click(this._onRechargeTokenClick.bind(this, 1))
			.contextmenu(this._onRechargeTokenClick.bind(this, -1));

		html.find(".stance-meter .stance-meter-link")
			.click(this._onStanceMeterLinkClick.bind(this, 1))
			.contextmenu(this._onStanceMeterLinkClick.bind(this, -1));

		html.find(".talent-trigger").click(this._onTalentTriggerClick.bind(this))
	}

	/**
	 * Get an Item's id from a clicked element hierarchy.
	 * @param {MouseEvent} event
	 * @private
	 */
	_getItemById(event)
	{
		return this.actor.items.get(event.currentTarget.dataset.itemId ?? $(event.currentTarget).parents(".item").data("itemId"));
	}

	/**
	 * Performs follow-up operations after clicks on a Characteristic.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onCharacteristicClick(event)
	{
		this.actor.performCharacteristicCheck(event.currentTarget.dataset.characteristic);
	}

	/**
	 * Performs follow-up operations after clicks on a sheet's flip button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onFlipClick(event)
	{
		event.preventDefault();

		const parent = $(event.currentTarget).parents(".item");
		const activeFace = parent.find(".face.active");
		const inactiveFace = parent.find(".face:not(.active)");

		activeFace.removeClass("active");
		inactiveFace.addClass("active");
	}

	/**
	 * Performs follow-up operations after clicks on an impairment token.
	 * @param {Number} amount
	 * @param {MouseEvent} event
	 * @private
	 */
	_onImpairmentTokenClick(amount, event)
	{
		this.actor.adjustImpairment(event.currentTarget.dataset.impairment, amount);
	}

	/**
	 * Performs follow-up operations after clicks on an Item delete button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onItemDeleteClick(event)
	{
		const item = this._getItemById(event);

		await new Dialog({
			title: game.i18n.localize("APPLICATION.TITLE.DeleteItem"),
			content: "<p>" + game.i18n.format("APPLICATION.DESCRIPTION.DeleteItem", {item: item.name}) + "</p>",
			buttons: {
				confirm: {
					icon: '<span class="fa fa-check"></span>',
					label: game.i18n.localize("Yes"),
					callback: async dlg => {
						await this.actor.deleteEmbeddedDocuments("Item", [item._id]);
						li.slideUp(200, () => this.render(false));
					}
				},
				cancel: {
					icon: '<span class="fas fa-xmark"></span>',
					label: game.i18n.localize("Cancel")
				},
			},
			default: "confirm"
		}).render(true);
	}

	/**
	 * Performs follow-up operations after clicks on an Item edit button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemEditClick(event)
	{
		return this._getItemById(event).sheet.render(true);
	}

	/**
	 * Performs follow-up operations after clicks on an item's expand button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemExpandClick(event)
	{
		event.preventDefault();
		event.stopPropagation();

		const itemElement = $(event.currentTarget).hasClass("item")
			? $(event.currentTarget)
			: $(event.currentTarget).parents(".item");
		const item = this._getItemById(event);

		if(itemElement.hasClass("expanded")) {
			// Toggle expansion for an item
			const details = itemElement.children(".details");

			details.slideUp(200, () => details.remove());

			itemElement.find(".item-expand-link .fas").removeClass("fa-chevron-up").addClass("fa-chevron-down");
		}
		else {
			// Add a div with the item's details below the row.
			const detailsElement = $(`<div class="details">${item.getDetails()}</div>`);

			itemElement.append(detailsElement.hide());
			detailsElement.slideDown(200);

			itemElement.find(".item-expand-link .fas").removeClass("fa-chevron-down").addClass("fa-chevron-up");
		}

		itemElement.toggleClass("expanded");
	}

	/**
	 * Performs follow-up operations after inputs on an Item.
	 * @param {Event} event
	 * @private
	 */
	_onItemInput(event)
	{
		event.preventDefault();
		event.stopPropagation();

		const item = this._getItemById(event);
		const propertyPath = event.currentTarget.dataset.path;
		let value = event.target.value;

		if(event.currentTarget.type === "checkbox" && !event.currentTarget.checked)
			value = false;
		if(value === "on")
			value = true;

		// Additional process needed for updates on Arrays.
		let itemProperty = item;
		for(let i = 0, path = propertyPath.split('.'), length = path.length; i < length; i++)
			itemProperty = itemProperty[path[i]];

		if(itemProperty instanceof Array) {
			const index = event.currentTarget.dataset.index;
			const subProperty = event.currentTarget.dataset.property;

			subProperty ? itemProperty[index][subProperty] = value : itemProperty[index] = value;

			item.update({[propertyPath]: itemProperty});
		}
		else
			item.update({[propertyPath]: value});
	}

	/**
	 * Performs follow-up operations after left-clicks on an Item button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onItemLeftClick(event)
	{
		event.stopPropagation();

		const item = this._getItemById(event);
		if(["action", "skill", "weapon"].includes(item.type)) {
			const options = {};
			const face = $(event.currentTarget).parents(".face").data("face");

			if(face)
				options.face = face;

			item.useItem(options);
		}
	}

	/**
	 * Performs follow-up operations after right-clicks on an Item button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onItemRightClick(event)
	{
		this._getItemById(event).sheet.render(true);
	}

	/**
	 * Performs follow-up operations after clicks on an Item roll button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemRollClick(event)
	{
		const options = {};
		const face = $(event.currentTarget).parents(".face").data("face");

		if(face)
			options.face = face;

		this._getItemById(event).useItem(options);
	}

	/**
	 * Performs follow-up operations after clicks on a Trapping's quantity button.
	 * @param {Number} amount
	 * @param {MouseEvent} event
	 * @private
	 */
	_onQuantityClick(amount, event)
	{
		this._getItemById(event).changeQuantity(event.ctrlKey ? amount * 10 : amount);
	}

	/**
	 * Performs follow-up operations after left-clicks on a Card's recharge token button.
	 * @param {Number} amount
	 * @param {MouseEvent} event
	 * @private
	 */
	_onRechargeTokenClick(amount, event)
	{
		const item = this._getItemById(event);

		item.update({"system.rechargeTokens": item.system.rechargeTokens + amount});
	}

	/**
	 * Performs follow-up operations after clicks on a stance meter link.
	 * @param {Number} amount
	 * @param {MouseEvent}  event
	 * @private
	 */
	_onStanceMeterLinkClick(amount, event)
	{
		this.actor.adjustStanceMeter(event.currentTarget.dataset.stance, amount);
	}

	_onTalentTriggerClick(event)
	{
		this._getItemById(event).useItem();
	}
}