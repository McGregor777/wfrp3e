import WFRP3eActorSheet from "./WFRP3eActorSheet.js";

export default class WFRP3eCreatureSheet extends WFRP3eActorSheet
{
	constructor(object = {}, options = {})
	{
		super(object, options);

		if(this.actor.system.nemesis)
			this.position.height = 780;
	}

	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			width: 600,
			height: 710,
			classes: ["wfrp3e", "sheet", "actor", "creature", "creature-sheet"],
			tabs: [
				{group: "primary", navSelector: ".primary-tabs", contentSelector: ".sheet-body", initial: "main"},
				{group: "actions", navSelector: ".action-tabs", contentSelector: ".actions", initial: "melee"},
				{group: "abilities", navSelector: ".ability-tabs", contentSelector: ".abilities", initial: "ability"}
			]
		};
	}

	/** @inheritDoc */
	getData()
	{
		return {
			...super.getData(),
			attributes: CONFIG.WFRP3e.attributes,
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".stance")
			.click(this._onStanceLinkClick.bind(this, 1))
			.contextmenu(this._onStanceLinkClick.bind(this, -1));
	}

	/**
	 * Performs follow-up operations after left-clicks on the stance link.
	 * @param {Number} amount
	 * @param {MouseEvent} event
	 * @private
	 */
	_onStanceLinkClick(event)
	{
		this.actor.update({"system.stance": this.actor.system.stance + 1});
	}
}