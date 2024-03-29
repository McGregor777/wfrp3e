export default class WFRP3eCreatureSheet extends ActorSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "sheet", "actor", "creature", "creature-sheet"],
			dragDrop: [{dragSelector: ".item", dropSelector: null}],
			height: 660,
			tabs: [
				{group: "primary", navSelector: ".creature-sheet-tabs", contentSelector: ".creature-sheet-body", initial: "main"},
				{group: "actions", navSelector: ".creature-sheet-action-tabs", contentSelector: ".creature-sheet-actions", initial: "melee"}
			],
			template: "systems/wfrp3e/templates/applications/actors/creature-sheet.hbs",
			width: 420
		};
	}

	/** @inheritDoc */
	getData()
	{
		const data = {
			...super.getData(),
			actionTypes: CONFIG.WFRP3e.actionTypes,
			attributes: CONFIG.WFRP3e.attributes,
			characteristics: CONFIG.WFRP3e.characteristics,
			stances: CONFIG.WFRP3e.stances,
			symbols: CONFIG.WFRP3e.symbols
		};
		data.items = this._buildItemLists(data.items);

		console.log(data)

		return data;
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".characteristic a").click(this._onCharacteristicLink.bind(this));

		html.find(".creature-sheet-stance")
			.click(this._onStanceLinkLeftClick.bind(this))
			.contextmenu(this._onStanceLinkRightClick.bind(this));

		html.find(".flip-link").click(this._onFlipClick.bind(this));

		html.find(".item-edit-link").click(this._onItemEdit.bind(this));
		html.find(".item-delete-link").click(this._onItemDelete.bind(this));

		html.find(".item-name-link")
			.click(this._onItemLeftClick.bind(this))
			.contextmenu(this._onItemRightClick.bind(this));

		html.find(".recharge-token")
			.click(this._onRechargeTokenLeftClick.bind(this))
			.contextmenu(this._onRechargeTokenRightClick.bind(this));
	}

	/**
	 * Returns items sorted by type.
	 * @param {Array} items The items owned by the Actor.
	 * @returns {Object} The sorted items owned by the Actor.
	 * @private
	 */
	_buildItemLists(items)
	{
		const sortedItems = items.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
		const actions = sortedItems.filter(item => item.type === "action").sort((a, b) => {
			if(a.system.conservative.traits.includes("Basic") && !b.system.conservative.traits.includes("Basic"))
				return -1;
			else if(!a.system.conservative.traits.includes("Basic") && b.system.conservative.traits.includes("Basic"))
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
			talents: Object.keys(CONFIG.WFRP3e.talentTypes).reduce((sortedTalents, talentType) => {
				sortedTalents[talentType] = talents.filter(talent => talent.system.type === talentType);
				return sortedTalents;
			}, {}),
			trappings: sortedItems.filter(item => item.type === "trapping"),
			weapons: sortedItems.filter(item => item.type === "weapon")
		};
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
	 * Performs follow-up operations after clicks on a Characteristic link.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onCharacteristicLink(event)
	{
		this.actor.performCharacteristicCheck(event.currentTarget.dataset.characteristic);
	}

	/**
	 * Performs follow-up operations after left-clicks on the stance link.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onStanceLinkLeftClick(event)
	{
		this.actor.update({"system.stance": this.actor.system.stance + 1});
	}

	/**
	 * Performs follow-up operations after right-clicks on the stance link.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onStanceLinkRightClick(event)
	{
		this.actor.update({"system.stance": this.actor.system.stance - 1});
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
	 * Performs follow-up operations after clicks on an Item edit button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemEdit(event)
	{
		return this._getItemById(event).sheet.render(true);
	}

	/**
	 * Performs follow-up operations after clicks on an Item delete button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemDelete(event)
	{
		const item = this._getItemById(event);

		new Dialog({
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
	 * Performs follow-up operations after left-clicks on an Item button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onItemLeftClick(event)
	{
		event.stopPropagation();
		
		const item = this._getItemById(event);
		const options = {};
		const face = $(event.currentTarget).parents(".face").data("face");

		if(face)
			options.face = face;

		item.useItem(options);
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
	 * Performs follow-up operations after left-clicks on a Card's recharge token button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onRechargeTokenLeftClick(event)
	{
		const item =this._getItemById(event);

		item.update({"system.rechargeTokens": item.system.rechargeTokens + 1});
	}

	/**
	 * Performs follow-up operations after right-clicks on a Card's recharge token button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onRechargeTokenRightClick(event)
	{
		const item = this._getItemById(event);
		let rechargeTokens = item.system.rechargeTokens - 1;

		// Floor recharge tokens to 0.
		if(rechargeTokens < 0)
			rechargeTokens = 0;

		item.update({"system.rechargeTokens": rechargeTokens});
	}
}