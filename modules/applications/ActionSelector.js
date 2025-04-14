/** @inheritDoc */
export default class ActionSelector extends FormApplication
{
	constructor(object, career, options = {})
	{
		super(object, options);

		this.career = career;
		this.priest = this.object.itemTypes.talent.find(talent => talent.system.type === "faith") != null;
		this.wizard = this.object.itemTypes.talent.find(talent => talent.system.type === "order") != null;
	}

	/** @inheritDoc */
	get title()
	{
		return game.i18n.localize("ACTIONSELECTOR.Title");
	}

	/** @inheritDoc */
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "selector", "action-selector"],
			template: "systems/wfrp3e/templates/applications/action-selector.hbs",
			tabs: [{group: "actions", navSelector: ".action-tabs", contentSelector: ".actions", initial: "melee"}],
			width: 910,
			height: 860
		};
	}

	/** @inheritDoc */
	async getData()
	{
		await this._buildActionLists();

		return {
			...super.getData(),
			actions: this.actions,
			actionTypes: CONFIG.WFRP3e.actionTypes,
			stances: CONFIG.WFRP3e.stances,
			symbols: CONFIG.WFRP3e.symbols
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		if(!this.priest)
			html.find("a.blessing, .tab.blessing").css({display: "none"});

		if(!this.wizard)
			html.find("a.spell, .tab.spell").css({display: "none"});

		html.find(".action-card .flip-link").click(this._onFlipClick.bind(this));
		html.find(".item-container input").change(this._onActionChange.bind(this, html));
	}

	/** @inheritDoc */
	async _updateObject(event, formData)
	{
		const selectedAction = this.allActions.find(action => action._id === formData.action);

		if(!selectedAction)
			ui.notifications.warn(game.i18n.localize("ACTIONSELECTOR.NoActionSelectedWarning"));

		this.career.update({"system.advances.action": selectedAction.name});

		await Item.createDocuments([selectedAction], {parent: this.object});
	}

	async _buildActionLists()
	{
		let actions = [];

		for(const pack of [...game.packs.values()].filter(pack => pack.documentName === "Item")) {
			await pack.getDocuments({type: "action"}).then(foundActions => {
				if(foundActions.length > 0)
					actions.push(...foundActions);
			});
		}

		this.allActions = actions.sort((a, b) => {
			const basicTrait = game.i18n.localize("TRAITS.basic");
			if(a.system.conservative.traits.includes(basicTrait) && !b.system.conservative.traits.includes(basicTrait))
				return -1;
			else if(!a.system.conservative.traits.includes(basicTrait) && b.system.conservative.traits.includes(basicTrait))
				return 1
			else if(a.name < b.name)
				return -1;
			else if(a.name > b.name)
				return 1;
			else
				return 0;
		});

		actions = Object.keys(CONFIG.WFRP3e.actionTypes).reduce((sortedActions, actionType) => {
			if(!["blessing", "spell"].includes(actionType)
				|| (actionType === "blessing" && this.priest)
				|| (actionType === "spell" && this.wizard))
				sortedActions[actionType] = this.allActions.filter(action => {
					return !this.object.itemTypes.action.find(ownedAction => ownedAction.name === action.name)
						&& action.system.type === actionType;
				});

			return sortedActions;
		}, {});

		if(this.priest) {
			let faithName = null;
			const faithTalent = this.object.itemTypes.talent.find(talent => talent.type === "faith");
			const match = faithTalent.name.match(new RegExp(/([\w\s]+),?/));

			if(match)
				faithName = match[1];

			actions.blessing = actions.blessing.filter(action => action.system.reckless.traits.includes(faithName));
		}

		if(this.wizard) {
			let orderName = null;
			const orderTalent = this.object.itemTypes.talent.find(talent => talent.type === "order");
			const match = orderTalent.name.match(new RegExp(/([\w\s]+), ?[\w\s]+, ?([\w\s]+)/));

			if(match)
				orderName = match[2] ?? match[1];

			actions.spell = actions.spell.filter(action => action.system.reckless.traits.includes(orderName));
		}

		this.actions = actions;
	}

	async _onActionChange(html, event)
	{
		html.find("label.active").removeClass("active");
		$(event.currentTarget).parents("label").addClass("active");

		html.find(".selection").text(this.allActions.find(action => action._id === event.currentTarget.value).name);
	}

	/**
	 * Performs follow-up operations after clicks on a sheet's flip button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onFlipClick(event)
	{
		event.preventDefault();

		const parent = $(event.currentTarget).parents(".action-card");
		const activeFace = parent.find(".face.active");
		const inactiveFace = parent.find(".face:not(.active)");

		activeFace.removeClass("active");
		inactiveFace.addClass("active");
	}
}