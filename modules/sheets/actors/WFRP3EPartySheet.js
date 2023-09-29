export default class WFRP3EPartySheet extends ActorSheet
{
	/** @inheritDoc */
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions, {
			template: "systems/wfrp3e/templates/party-sheet.html",
			width: 800,
			height: 540,
			classes: ["wfrp3e", "sheet", "actor", "party", "party-sheet"]
		});
	}

	/** @inheritDoc */
	getData()
	{
		const data = super.getData();

		data.talentTypes = CONFIG.WFRP3E.talentTypes;

		console.log(data);

		return data;
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".party-sheet-tension-meter .party-sheet-tension-meter-segment").click(this._onPartyTensionMeterSegmentClick.bind(this));
		html.find(".party-sheet-tension-meter .party-sheet-tension-meter-plus").click(this._onPartyTensionMeterPlusClick.bind(this));
		html.find(".party-sheet-tension-meter .party-sheet-tension-meter-minus").click(this._onPartyTensionMeterMinusClick.bind(this));
		html.find(".party-sheet-members .party-sheet-member .party-sheet-member-portrait").click(this._onPartyMemberPortraitClick.bind(this));
		html.find(".party-sheet-members .party-sheet-member .party-sheet-member-remove").click(this._onPartyMemberRemoveClick.bind(this));
		html.find(".party-sheet-footer .party-sheet-talent-socket-button-container .talent-socket-add").click(this._onTalentSocketAdd.bind(this));
		html.find(".party-sheet-footer .party-sheet-talent-socket-button-container .talent-socket-delete").click(this._onTalentSocketDelete.bind(this));
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
	_onPartyTensionMeterSegmentClick(event)
	{
		this.actor.changePartyTensionValue($(event.target).find('input').val());
	}

	/**
	 * Performs follow-up operations clicks on a Party tension meter's increase button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onPartyTensionMeterPlusClick(event)
	{
		this.actor.update({"system.tension.maximum": this.actor.system.tension.maximum + 1});
	}

	/**
	 * Performs follow-up operations clicks on a Party tension meter's decrease button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onPartyTensionMeterMinusClick(event)
	{
		const newMaximumTensionValue = this.actor.system.tension.maximum - 1;
		const tension = {
			maximum: newMaximumTensionValue,
			events: this.actor.system.tension.events
		};

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
	_onPartyMemberPortraitClick(event)
	{
		game.actors.contents.find(actor => actor.id === $(event.currentTarget).parent(".party-sheet-member").data("actorId")).sheet.render(true);
	}

	/**
	 * Performs follow-up operations clicks on a Party member's removal button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onPartyMemberRemoveClick(event)
	{
		const actorId = $(event.currentTarget).parent(".party-sheet-member").data("actorId");
		const actorName = game.actors.get(actorId).name;

		new Dialog({
			title: game.i18n.localize("DIALOG.TITLE.MemberRemovalConfirmation"),
			content: "<p>" + game.i18n.format("DIALOG.DESCRIPTION.MemberRemovalConfirmation", {actor: actorName}) + "</p>",
			buttons: {
				confirm: {
					icon: '<span class="fa fa-check"></span>',
					label: game.i18n.localize("DIALOG.BUTTON.Confirm"),
					callback: async dlg => this.actor.removeMember(actorId)
				},
				cancel: {
					icon: '<span class="fas fa-times"></span>',
					label: game.i18n.localize("DIALOG.BUTTON.Cancel")
				}
			},
			default: "confirm"
		}).render(true);
	}

	/**
	 * Performs follow-up operations clicks on a Party talent socket add button.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onTalentSocketAdd(event)
	{
		this.actor.addTalentSocket();
	}

	/**
	 * Performs follow-up operations clicks on a Party talent socket delete button.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onTalentSocketDelete(event)
	{
		this.actor.deleteTalentSocket();
	}
}