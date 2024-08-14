import WFRP3eActorSheet from "./WFRP3eActorSheet.js";

export default class WFRP3eGroupSheet extends WFRP3eActorSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			width: 830,
			height: 540,
			classes: ["wfrp3e", "sheet", "actor", "group", "group-sheet"],
			tabs: [
				{group: "primary", navSelector: ".primary-tabs", contentSelector: ".sheet-body", initial: "main"},
				{group: "talents", navSelector: ".talent-tabs", contentSelector: ".talents", initial: "focus"}
			]
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".ability-track-edit").click(this._onAbilityTrackEditButtonClick.bind(this));
		html.find(".ability-track-editor-plus").click(this._onAbilityTrackPlusClick.bind(this));
		html.find(".ability-track-editor-minus").click(this._onAbilityTrackMinusClick.bind(this));
		html.find(".ability-track-editor-segment > input").change(this._onAbilityTrackSegmentTextChange.bind(this));
		html.find(".ability-track-editor-trigger").change(this._onAbilityTrackTriggerChange.bind(this));
		html.find(".ability-track-editor-submit").click(this._onAbilityTrackEditorSubmit.bind(this));
		html.find(".talent-socket-add").click(this._onTalentSocketAdd.bind(this));
		html.find(".talent-socket-delete").click(this._onTalentSocketDelete.bind(this));
	}

	/**
	 * Performs follow-up operations clicks on an Ability Track edit button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onAbilityTrackEditButtonClick(event)
	{
		const abilityTrackElement = $(event.currentTarget).parents(".ability-track");

		abilityTrackElement.find(".ability-track-editor").css({display: "block"});
		abilityTrackElement.find(".ability-track-segment-container").css({display: "none"});
	}

	/**
	 * Performs follow-up operations clicks on an Ability Track Editor's increase button.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onAbilityTrackPlusClick(event)
	{
		const segmentContainer = $(event.currentTarget).siblings(".ability-track-editor-segment-container");
		const newSegment = segmentContainer.append(
			await renderTemplate("systems/wfrp3e/templates/partials/ability-track-editor-segment.hbs", {
				value: {
					content: segmentContainer.children().length,
					trigger: false
				},
				index: segmentContainer.children().length,
				specialAbilityIndex: parseInt($(event.currentTarget).parents(".ability-track").data("specialAbilityIndex"))
			})
		);

		newSegment.find(".ability-track-editor-segment > input").change(this._onAbilityTrackSegmentTextChange.bind(this));
		newSegment.find(".ability-track-editor-trigger").change(this._onAbilityTrackTriggerChange.bind(this));
	}

	/**
	 * Performs follow-up operations after clicks on an Ability Track Editor's decrease button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onAbilityTrackMinusClick(event)
	{
		$(event.currentTarget).siblings(".ability-track-editor-segment-container").children().last().remove();
	}

	/**
	 * Performs follow-up operations after changes on an Ability Track segment's text input.
	 * @param event {Event}
	 * @private
	 */
	_onAbilityTrackSegmentTextChange(event)
	{
		event.preventDefault();
		event.stopPropagation();
	}

	/**
	 * Performs follow-up operations after changes to an Ability Track segment's trigger checkbox.
	 * @param event {Event}
	 * @private
	 */
	_onAbilityTrackTriggerChange(event)
	{
		event.preventDefault();
		event.stopPropagation();

		const segment = $(event.currentTarget).siblings(".ability-track-editor-segment");

		event.currentTarget.checked ? segment.addClass("trigger") : segment.removeClass("trigger");
	}

	/**
	 * Performs follow-up operations clicks on an Ability Track edit button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onAbilityTrackEditorSubmit(event)
	{
		const $abilityTrackElement = $(event.currentTarget).parents(".ability-track");

		$abilityTrackElement.find(".ability-track-segment-container").css({display: "block"});
		$abilityTrackElement.find(".ability-track-editor").css({display: "none"});
	}

	/**
	 * Performs follow-up operations after clicks on a Group talent socket addition button.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onTalentSocketAdd(event)
	{
		this.actor.addNewTalentSocket();
	}

	/**
	 * Performs follow-up operations after clicks on a Group talent socket removal button.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onTalentSocketDelete(event)
	{
		this.actor.removeLastTalentSocket();
	}
}