export default class WFRP3eCreatureSheet extends ActorSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			classes: ["wfrp3e", "sheet", "actor", "creature", "creature-sheet"],
			dragDrop: [{dragSelector: ".item", dropSelector: null}],
			height: 660,
			tabs: [
				{group: "primary", navSelector: ".creature-sheet-tabs", contentSelector: ".creature-sheet-body", initial: "main"},
				{group: "actions", navSelector: ".creature-sheet-action-tabs", contentSelector: ".creature-sheet-actions", initial: "melee"}
			],
			template: "systems/wfrp3e/templates/applications/actors/creature-sheet.hbs",
			width: 420
		});
	}

	/** @inheritDoc */
	getData()
	{
		const data = super.getData();

		data.actionTypes = CONFIG.WFRP3e.actionTypes;
		data.attributes = CONFIG.WFRP3e.attributes;
		data.characteristics = CONFIG.WFRP3e.characteristics;
		data.stances = CONFIG.WFRP3e.stances;
		data.symbols = CONFIG.WFRP3e.symbols;

		data.items = this._buildItemLists(data);

		console.log(data)

		return data;
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".creature-sheet-stance")
			.click(this._onStanceLinkLeftClick.bind(this))
			.contextmenu(this._onStanceLinkRightClick.bind(this));

		html.find(".flip-link").click(this._onFlipClick.bind(this));

		html.find(".item-edit-link").click(this._onItemEdit.bind(this));
		html.find(".item-delete-link").click(this._onItemDelete.bind(this));

		html.find(".item-name-link")
			.click(this._onItemLeftClick.bind(this))
			.contextmenu(this._onItemRightClick.bind(this));
	}

	/**
	 * Returns items sorted by type.
	 * @param {Object} data The items sorted by type.
	 */
	_buildItemLists(data)
	{
		const sortedItems = data.items.sort(function(a, b) {
			if(a.name < b.name)
				return -1;
			else if(a.name > b.name)
				return 1;
			else
				return 0;
		});

		const actions = sortedItems.filter(item => item.type === "action");
		const talents = sortedItems.filter(item => item.type === "talent");

		const items = {
			abilities: sortedItems.filter(item => item.type === "ability"),
			actions: {
				melee: actions.filter(item => item.system.conservative.type === "melee"),
				ranged: actions.filter(item => item.system.conservative.type === "ranged"),
				support: actions.filter(item => item.system.conservative.type === "support"),
				blessing: actions.filter(item => item.system.conservative.type === "blessing"),
				spell: actions.filter(item => item.system.conservative.type === "spell")
			},
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
			talents: {
				focus: talents.filter(item => item.system.type === "focus"),
				reputation: talents.filter(item => item.system.type === "reputation"),
				tactic: talents.filter(item => item.system.type === "tactic"),
				faith: talents.filter(item => item.system.type === "faith"),
				order: talents.filter(item => item.system.type === "order"),
				trick: talents.filter(item => item.system.type === "trick")
			},
			trappings: sortedItems.filter(item => item.type === "trapping"),
			weapons: sortedItems.filter(item => item.type === "weapon")
		};

		return items;
	}

	/**
	 * Get an Item's id from a clicked element hierarchy.
	 * @param {MouseEvent} event
	 * @private
	 */
	_getItemId(event)
	{
		return $(event.currentTarget).parents(".item").attr("data-item-id");
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
	 * Performs follow-up operations after clicks on an Item edit button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemEdit(event)
	{
		return this.actor.items.get(this._getItemId(event)).sheet.render(true);
	}

	/**
	 * Performs follow-up operations after clicks on an Item delete button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemDelete(event)
	{
		const clickedItem = this.actor.items.get(this._getItemId(event));

		new Dialog({
			title: game.i18n.localize("APPLICATION.TITLE.DeleteItemConfirmation"),
			content: "<p>" + game.i18n.format("APPLICATION.DESCRIPTION.DeleteItemConfirmation", {item: clickedItem.name}) + "</p>",
			buttons: {
				confirm: {
					icon: '<span class="fa fa-check"></span>',
					label: game.i18n.localize("Yes"),
					callback: async dlg => {
						await this.actor.deleteEmbeddedDocuments("Item", [clickedItem._id]);
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
		const clickedItem = this.actor.items.get(this._getItemId(event));
		const options = {};
		const face = $(event.currentTarget).parents(".face").data("face");

		if(face)
			options.face = face;

		clickedItem.useItem(options);
	}

	/**
	 * Performs follow-up operations after right-clicks on an Item button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onItemRightClick(event)
	{
		this.actor.items.get(this._getItemId(event)).sheet.render(true);
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
}