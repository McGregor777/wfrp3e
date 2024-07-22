import WFRP3eItemSheet from "./WFRP3eItemSheet.js";

export default class WFRP3eCareerSheet extends WFRP3eItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			height: 820,
			classes: ["wfrp3e", "sheet", "item", "career"],
			tabs: [{group: "primary", navSelector: ".career-sheet-tabs", contentSelector: ".career-sheet-body", initial: "header"}]
		};
	}

	getData()
	{
		return {
			...super.getData(),
			characteristics: CONFIG.WFRP3e.characteristics,
			races: {...CONFIG.WFRP3e.availableRaces, any: {name: "RACE.Any"}},
			talentTypes: {any: "TALENT.TYPE.Any", ...CONFIG.WFRP3e.talentTypes, insanity: "TALENT.TYPE.Insanity"}
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".race-restriction-add").click(this._onRaceRestrictionAddClick.bind(this));
		html.find(".race-restriction-remove").click(this._onRaceRestrictionRemoveClick.bind(this));

		html.find(".talent-socket-add").click(this._onTalentSocketAddClick.bind(this));
		html.find(".talent-socket-remove").click(this._onTalentSocketRemoveClick.bind(this));
	}

	/**
	 * Performs follow-up operations after clicks on a Race restriction addition icon.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onRaceRestrictionAddClick(event)
	{
		this.item.addNewRaceRestriction();
	}

	/**
	 * Performs follow-up operations after clicks on a Race restriction removal icon.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onRaceRestrictionRemoveClick(event)
	{
		this.item.removeLastRaceRestriction();
	}

	/**
	 * Performs follow-up operations after clicks on a Talent socket addition icon.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onTalentSocketAddClick(event)
	{
		this.item.addNewTalentSocket();
	}

	/**
	 * Performs follow-up operations after clicks on a Talent socket removal icon.
	 * @param event {Event}
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onTalentSocketRemoveClick(event)
	{
		this.item.removeLastTalentSocket();
	}
}