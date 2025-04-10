import WFRP3eActorSheet from "./WFRP3eActorSheet.js";

export default class WFRP3ePartySheet extends WFRP3eActorSheet
{
	/** @inheritDoc */
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			width: 800,
			height: 540,
			classes: ["wfrp3e", "sheet", "actor", "party", "party-sheet"]
		};
	}

	/** @inheritDoc */
	getData()
	{
		return {
			...super.getData(),
			socketTypes: {any: "TALENT.TYPES.any", ...CONFIG.WFRP3e.talentTypes, insanity: "TALENT.TYPES.insanity"}
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".party-sheet-tension-meter .party-sheet-tension-meter-segment").click(this._onTensionMeterSegmentClick.bind(this));
		html.find(".party-sheet-tension-meter .party-sheet-tension-meter-plus").click(this._onTensionMeterPlusClick.bind(this));
		html.find(".party-sheet-tension-meter .party-sheet-tension-meter-minus").click(this._onTensionMeterMinusClick.bind(this));
		html.find(".party-sheet-members .party-sheet-member .party-sheet-member-portrait").click(this._onMemberPortraitClick.bind(this));
		html.find(".party-sheet-members .party-sheet-member .party-sheet-member-remove").click(this._onMemberRemoveClick.bind(this));

		html.find(".fortune-token")
			.click(this._onFortunePoolClick.bind(this, 1))
			.contextmenu(this._onFortunePoolClick.bind(this, -1));

		html.find(".party-sheet-footer .party-sheet-talent-socket-button-container .socket-add").click(this._onSocketAdd.bind(this));
		html.find(".party-sheet-footer .party-sheet-talent-socket-button-container .socket-remove").click(this._onSocketRemove.bind(this));
	}

	/** @inheritDoc */
	async _onDrop(event)
	{
		super._onDrop(event);

		const data = JSON.parse(event.dataTransfer.getData("text/plain"));
		const droppedActor = await Actor.implementation.fromDropData(data);

		this.actor.addNewMember(droppedActor);
	}

	/**
	 * Performs follow-up operations clicks on a Party tension segment.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onTensionMeterSegmentClick(event)
	{
		this.actor.changePartyTensionValue($(event.target).find('input').val());
	}

	/**
	 * Performs follow-up operations clicks on a Party tension meter's increase button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onTensionMeterPlusClick(event)
	{
		this.actor.update({"system.tension.maximum": this.actor.system.tension.maximum + 1});
	}

	/**
	 * Performs follow-up operations clicks on a Party tension meter's decrease button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onTensionMeterMinusClick(event)
	{
		const newMaximumTensionValue = this.actor.system.tension.maximum - 1;
		const tension = this.actor.system.tension;

		tension.maximum--;
		if(tension.value > tension.maximum)
			tension.value = tension.maximum;

		tension.events.forEach((event) => {
			if(event.threshold >= this.actor.system.tension.maximum)
				event.threshold = newMaximumTensionValue;
		});

		this.actor.update({"system.tension": tension});
	}

	/**
	 * Performs follow-up operations clicks on a Party member's portrait.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onMemberPortraitClick(event)
	{
		game.actors.contents.find(actor => actor.id === $(event.currentTarget).parent(".party-sheet-member").data("actorId")).sheet.render(true);
	}

	/**
	 * Performs follow-up operations clicks on a Party member's removal button.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onMemberRemoveClick(event)
	{
		const actorId = $(event.currentTarget).parent(".party-sheet-member").data("actorId");
		const actorName = game.actors.get(actorId).name;

		await new Dialog({
			title: game.i18n.localize("APPLICATION.TITLE.MemberRemoval"),
			content: "<p>" + game.i18n.format("APPLICATION.DESCRIPTION.MemberRemoval", {actor: actorName}) + "</p>",
			buttons: {
				confirm: {
					icon: '<span class="fa fa-check"></span>',
					label: game.i18n.localize("APPLICATION.BUTTON.Confirm"),
					callback: async dlg => this.actor.removeMember(actorId)
				},
				cancel: {
					icon: '<span class="fas fa-times"></span>',
					label: game.i18n.localize("APPLICATION.BUTTON.Cancel")
				}
			},
			default: "confirm"
		}).render(true);
	}

	/**
	 * Performs follow-up operations after clicks on the Fortune Pool's button.
	 * @param {Number} amount
	 * @param {MouseEvent} event
	 * @private
	 */
	_onFortunePoolClick(amount, event)
	{
		this.actor.update({"system.fortunePool": this.actor.system.fortunePool + amount});
	}

	/**
	 * Performs follow-up operations clicks on a Party socket addition button.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onSocketAdd(event)
	{
		this.actor.addNewSocket();
	}

	/**
	 * Performs follow-up operations clicks on a Party socket removal button.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onSocketRemove(event)
	{
		this.actor.removeLastSocket();
	}
}