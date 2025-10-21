import {capitalize} from "../../helpers.js";

export default class GameOfTwentyQuestions extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "game-of-twenty-questions-{id}",
		classes: ["wfrp3e", "game-of-twenty-questions"],
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			title: "GAMEOFTWENTYQUESTIONS.title"
		},
		form: {handler: this.#onGameOfTwentyQuestionsSubmit},
		position: {height: 600}
	};

	/** @inheritDoc */
	static PARTS = {
		main: {template: "systems/wfrp3e/templates/applications/apps/game-of-twenty-questions/main.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			buttons: [{type: "submit", icon: "fa-solid fa-save", label: "GAMEOFTWENTYQUESTIONS.ACTIONS.submit"}],
			rootId: this.id
		};
	}

	/**
	 * Checks for any warning in the current selection and returns the type warning if any is found.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 * @param {Object} data Expanded object of processed data for the submitted form.
	 * @returns {string|false} The type of warning, or false if no warning has been found.
	 * @protected
	 */
	_checkForWarning(event, form, formData, data)
	{
		if(Object.values(data).filter(value => value).length < 20)
			return "incompleteAnswers";

		return false;
	}

	/**
	 * Prompts the user to confirm the selection submission.
	 * @param {string} [warning] The type of warning described in the dialog.
	 * @returns {Promise<boolean>} {} The choice of the user, true if confirmed, false otherwise.
	 */
	async _askConfirmation(warning)
	{
		const selectorType = this.constructor.name,
			  warningKey = `${capitalize(selectorType)}.WARNINGS.${warning}`;
		let title = game.i18n.localize(`${warningKey}.title`),
			content = game.i18n.localize(`${warningKey}.description`);

		// Ensure that the Dialog's title and content have a fallback translation.
		if(title === `${warningKey}.title`)
			title = game.i18n.localize(`GAMEOFTWENTYQUESTIONS.WARNINGS.${warning}.title`);
		if(content === `${warningKey}.description`)
			content = game.i18n.localize(`GAMEOFTWENTYQUESTIONS.WARNINGS.${warning}.description`);

		content = `<p>${content} ${game.i18n.localize("SELECTOR.proceedDialog")}</p>`;

		return await foundry.applications.api.DialogV2.confirm({
			window: {title},
			modal: true,
			content
		});
	}

	/**
	 * Spawns a Game of Twenty Questions and waits for it to be dismissed or submitted.
	 * @param {ApplicationConfiguration} [config] Configuration of the Selector instance
	 * @returns {Promise<any>} Resolves to the selected item(s). If the dialog was dismissed, the Promise resolves to null.
	 */
	static async wait(config = {})
	{
		return new Promise(async (resolve, reject) => {
			// Wrap the submission handler with Promise resolution.
			config.submit = async result => {resolve(result)};
			const application = new this(config);
			application.addEventListener("close", event => reject(), {once: true});
			await application.render({force: true});
		});
	}

	/**
	 * Processes form submission for the Game of Twenty Questions.
	 * @this {GameOfTwentyQuestions} The handler is called with the application as its bound scope.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #onGameOfTwentyQuestionsSubmit(event, form, formData)
	{
		const data = foundry.utils.expandObject(formData.object),
			  warning = this._checkForWarning(event, form, formData, data);

		if(!warning || await this._askConfirmation(warning)) {
			this.options.submit(data);
			await this.close({submitted: true});
		}
	}
}
