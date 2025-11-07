import {capitalize} from "../../helpers.mjs";

/** @inheritDoc */
export default class CareerAdvanceDialog extends foundry.applications.api.DialogV2
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);

		if(!options.actor)
			throw new Error("An actor is required.");
		this.actor = options.actor;

		if(!options.career)
			throw new Error("A career is required.");
		this.career = options.career;

		if(options.advanceType)
			this.advanceType = options.advanceType;
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "career-advance-dialog-{id}",
		classes: ["career-advance-dialog"],
		submit: CareerAdvanceDialog.#careerAdvanceDialogSubmit
	};

	static LOCALISATION_PREFIX = "CAREERADVANCEDIALOG";

	/**
	 * The actor buying the advance.
	 * @type {Actor}
	 */
	actor;

	/**
	 * The type of career advance.
	 * @type {string}
	 */
	advanceType = "open";

	/**
	 * The career owning the advance.
	 * @type {Item}
	 */
	career;

	/** @inheritDoc */
	get title()
	{
		return game.i18n.localize(`${this.constructor.LOCALISATION_PREFIX}.${this.advanceType}Advance.title`);
	}

	/** @inheritDoc */
	_initializeApplicationOptions(options)
	{
		if(!options.content)
			options.content = `<p>${game.i18n.format(`${this.constructor.LOCALISATION_PREFIX}.${options.advanceType ?? this.advanceType}Advance.content`)}</p>`;

		if(!options.buttons)
			options.buttons = CareerAdvanceDialog.#initializeButtons(options.advanceType ?? this.advanceType);

		return super._initializeApplicationOptions(options);
	}

	/**
	 * Builds the list of buttons depending on the career advance.
	 * @param {string} advanceType The type of career advance.
	 * @returns {DialogV2Button[]}
	 * @private
	 */
	static #initializeButtons(advanceType)
	{
		switch(advanceType) {
			case "nonCareer":
				return [{
					action: wfrp3e.data.items.career.NonPrimaryCharacteristicAdvance.TYPE,
					label: game.i18n.localize(`${this.LOCALISATION_PREFIX}.BUTTONS.nonPrimaryCharacteristic`)
				}, {
					action: wfrp3e.data.items.career.NonCareerSkillAdvance.TYPE,
					label: game.i18n.localize(`${this.LOCALISATION_PREFIX}.BUTTONS.nonCareerSkill`)
				}, {
					action: wfrp3e.data.items.career.NonCareerTalentAdvance.TYPE,
					label: game.i18n.localize(`${this.LOCALISATION_PREFIX}.BUTTONS.talent`)
				}];
			default:
				return [{
					action: wfrp3e.data.items.career.RatingAdvance.TYPE,
					label: game.i18n.localize(`${this.LOCALISATION_PREFIX}.BUTTONS.primaryCharacteristic`)
				}, {
					action: wfrp3e.data.items.career.ActionAdvance.TYPE,
					label: game.i18n.localize(`${this.LOCALISATION_PREFIX}.BUTTONS.action`)
				}, {
					action: wfrp3e.data.items.career.SkillAdvance.TYPE,
					label: game.i18n.localize(`${this.LOCALISATION_PREFIX}.BUTTONS.skill`)
				}, {
					action: wfrp3e.data.items.career.TalentAdvance.TYPE,
					label: game.i18n.localize(`${this.LOCALISATION_PREFIX}.BUTTONS.talent`)
				}, {
					action: wfrp3e.data.items.career.WoundAdvance.TYPE,
					label: game.i18n.localize(`${this.LOCALISATION_PREFIX}.BUTTONS.wound`)
				}, {
					action: wfrp3e.data.items.career.ConservativeAdvance.TYPE,
					label: game.i18n.localize(`${this.LOCALISATION_PREFIX}.BUTTONS.conservative`)
				}, {
					action: wfrp3e.data.items.career.RecklessAdvance.TYPE,
					label: game.i18n.localize(`${this.LOCALISATION_PREFIX}.BUTTONS.reckless`)
				}];
		}
	}

	/**
	 * Proceeds to buying a new career advance depending on the selected type.
	 * @param {string} result Either the identifier of the button that was clicked to submit the dialog, or the result returned by that button's callback.
	 * @param {CareerAdvanceDialog} dialog The Career Advance Dialog instance.
	 * @returns {Promise<void>}
	 */
	static async #careerAdvanceDialogSubmit(result, dialog)
	{
		wfrp3e.data.items.career[`${capitalize(result)}Advance`].buyAdvance(dialog.career, true);
	}
}
