import {capitalize} from "../../helpers.js";

/**
 * @typedef {Object} CreationPointInvestments
 * @property {Object} characteristics
 * @property {number} characteristics.strength
 * @property {number} characteristics.toughness
 * @property {number} characteristics.agility
 * @property {number} characteristics.intelligence
 * @property {number} characteristics.willpower
 * @property {number} characteristics.fellowship
 * @property {number} wealth
 * @property {number} skills
 * @property {number} talents
 * @property {number} actionCards
 */

/** @inheritDoc */
export default class CreationPointInvestor extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);

		if(!options.race)
			throw new Error("Defining a race is needed for the Creation Point Investor.");
		this.race = options.race;

		if(!options.startingCreationPoints)
			throw new Error("Defining a pool of starting creation points is needed for the Creation Point Investor.");
		this.startingCreationPoints = options.startingCreationPoints;

		this.creationPointInvestments.characteristics = foundry.utils.deepClone(options.race.defaultRatings);
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "creation-point-investor-{id}",
		classes: ["wfrp3e", "creation-point-investor"],
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			title: "CREATIONPOINTINVESTOR.title"
		},
		actions: {
			decrementCharacteristicRating: this.#decrementCharacteristicRating,
			incrementCharacteristicRating: this.#incrementCharacteristicRating
		},
		form: {handler: this.#onCreationPointInvestorFormSubmit},
		position: {width: 920}
	};

	/** @inheritDoc */
	static PARTS = {
		main: {template: "systems/wfrp3e/templates/applications/apps/creation-point-investor/main.hbs"},
		count: {template: "systems/wfrp3e/templates/applications/apps/creation-point-investor/count.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/**
	 * The race defining which rules are used by the Creation Point Investor.
	 * @type {Object}
	 */
	race = {};

	/**
	 * The current investments of Creation Points.
	 * @type {CreationPointInvestments}
	 */
	creationPointInvestments = {
		characteristics: {
			strength: 2,
			toughness: 2,
			agility: 2,
			intelligence: 2,
			willpower: 2,
			fellowship: 2
		},
		wealth: 0,
		skills: 0,
		talents: 0,
		actionCards: 0
	};

	/** @inheritDoc */
	type = "creationPoint";

	/**
	 * The remaining number of Creation Points.
	 * @returns {number}
	 */
	get remainingCreationPoints()
	{
		let remainingCreationPoints= this.startingCreationPoints
			- this.creationPointInvestments.wealth
			- this.creationPointInvestments.skills
			- this.creationPointInvestments.talents
			- this.creationPointInvestments.actionCards;

		for(const [key, rating] of Object.entries(this.creationPointInvestments.characteristics)) {
			// Each increment of a characteristic rating increases the number of used Creation Points
			// by the increment value.
			for(let i = this.race.defaultRatings[key] + 1; i <= rating; i++)
				remainingCreationPoints -= i;
		}

		return remainingCreationPoints;
	}

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			buttons: [{type: "submit", icon: "fa-solid fa-check", label: "CREATIONPOINTINVESTOR.ACTIONS.submit"}],
			rootId: this.id
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		switch(partId) {
			case "main":
				const characteristics = foundry.utils.deepClone(CONFIG.WFRP3e.characteristics);

				for(const key of Object.keys(characteristics)) {
					characteristics[key] = {
						...characteristics[key],
						defaultRating: this.race.defaultRatings[key]
					}
				}

				partContext = {
					...partContext,
					characteristics,
					creationPointInvestments: this.creationPointInvestments,
					creationPointInvestmentCategories: CONFIG.WFRP3e.creationPointInvestments
				};

				break;
			case "count":
				partContext = {
					...partContext,
					remainingCreationPoints: this.remainingCreationPoints,
					startingCreationPoints: this.startingCreationPoints,
				}
				break;
		}

		return partContext;
	}

	/** @inheritDoc */
	async _onChangeForm(formConfig, event)
	{
		this._handleNewInvestment(event.target.value, formConfig, event);

		super._onChangeForm(formConfig, event);

		await this.render();
	}

	/** @inheritDoc */
	_handleNewInvestment(value, formConfig, event)
	{
		const name = event.target.name,
			  currentValue = foundry.utils.getProperty(this, name);

		if(name.includes("characteristics")) {
			const key = event.target.dataset.characteristic,
				  minimumRating = this.race.defaultRatings[key];
			let investment = value;

			for(let i = value - 1; i > currentValue; i--)
				investment += i;

			if(value < minimumRating)
				return ui.notifications.warn(game.i18n.format(
					"CREATIONPOINTINVESTOR.WARNINGs.minimumRatingReached", {
						characteristic: game.i18n.localize(CONFIG.WFRP3e.characteristics[key].name),
						race: game.i18n.localize(this.race.name),
						rating: minimumRating
					}
				));
			else if(value > 5)
				return ui.notifications.warn(
					game.i18n.localize("CREATIONPOINTINVESTOR.WARNINGS.maximumRatingReached")
				);
			else if(investment > this.remainingCreationPoints)
				return ui.notifications.warn(
					game.i18n.localize("CREATIONPOINTINVESTOR.WARNINGS.notEnoughCreationPoints")
				);
		}
		else if(value < 0)
			return ui.notifications.warn(
				game.i18n.localize("CREATIONPOINTINVESTOR.WARNINGS.cannotInvestLessThanZero")
			);
		else if(value > 4)
			return ui.notifications.warn(
				game.i18n.localize("CREATIONPOINTINVESTOR.WARNINGS.cannotInvestMoreThanFour")
			);
		else if(value > currentValue && value - currentValue > this.remainingCreationPoints)
			return ui.notifications.warn(
				game.i18n.localize("CREATIONPOINTINVESTOR.WARNINGS.notEnoughCreationPoints")
			);
		
		foundry.utils.setProperty(this, name, event.target.value);
	}

	/**
	 * Checks for any error in the current investments and returns the type error if any is found.
	 * @returns {string|false} The type of error, or false if no error has been found.
	 * @protected
	 */
	_checkForError()
	{
		if(this.remainingCreationPoints < 0)
			return "tooManyCreationPointSpent";

		return false;
	}

	/**
	 * Checks for any warning in the current investments and returns the type warning if any is found.
	 * @returns {string|false} The type of warning, or false if no warning has been found.
	 * @protected
	 */
	_checkForWarning()
	{
		if(this.remainingCreationPoints > 0)
			return "unspentCreationPoints";

		return false;
	}

	/**
	 * Prompts the user to confirm the investments' submission.
	 * @param {string} [warning] The type of warning described in the dialog.
	 * @returns {Promise<boolean>} {} The choice of the user, true if confirmed, false otherwise.
	 */
	async _askConfirmation(warning)
	{
		const warningKey = `CREATIONPOINTINVESTOR.WARNINGS.${warning}`,
			  content = `<p>${game.i18n.localize(`${warningKey}.description`)}
							   ${game.i18n.localize("SELECTOR.proceedDialog")}</p>`;

		return await foundry.applications.api.DialogV2.confirm({
			window: {title: game.i18n.localize(`${warningKey}.title`)},
			modal: true,
			content
		});
	}

	/**
	 * Decrements the characteristic rating by one. If decreasing the characteristic rating puts it below
	 * the default rating, a warning is shown instead.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #decrementCharacteristicRating(event, target)
	{
		event.preventDefault();

		const key = target.closest("[data-characteristic]").dataset.characteristic,
			  defaultRating = this.race.defaultRatings[key];
		
		if(this.creationPointInvestments.characteristics[key] <= defaultRating)	{
			this.creationPointInvestments.characteristics[key] = defaultRating;

			return ui.notifications.warn(
				game.i18n.localize("CREATIONPOINTINVESTOR.WARNINGS.minimumRatingReached")
			);
		}

		this.creationPointInvestments.characteristics[key]--;
		
		await this.render();
	}

	/**
	 * Tries to increment the characteristic rating by one if enough creation points are left.
	 * If successful, it recalculates how many creation points are left. If failed, a warning is shown. 
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #incrementCharacteristicRating(event, target)
	{
		event.preventDefault();

		const key = target.closest("[data-characteristic]").dataset.characteristic,
			  currentInvestment = this.creationPointInvestments.characteristics[key];
		
		if(currentInvestment >= 5)	{
			this.creationPointInvestments.characteristics[key] = 5;

			return ui.notifications.warn(
				game.i18n.localize("CREATIONPOINTINVESTOR.WARNINGS.maximumRatingReached")
			);
		}
		else if(this.remainingCreationPoints < currentInvestment + 1)
			return ui.notifications.warn(
				game.i18n.localize("CREATIONPOINTINVESTOR.WARNINGS.notEnoughCreationPoints")
			);

		this.creationPointInvestments.characteristics[key]++;

		await this.render();
	}

	/**
	 * Spawns a Creation Point Investor and waits for it to be dismissed or submitted.
	 * @param {ApplicationConfiguration} [config] Configuration of the Creation Point Investor instance
	 * @returns {Promise<any>} Resolves to the selected creation point investments. If the dialog was dismissed, the Promise resolves to null.
	 */
	static async wait(config = {})
	{
		return new Promise(async (resolve, reject) => {
			// Wrap the submission handler with Promise resolution.
			config.submit = async result => {resolve(result)};
			const investor = new this(config);
			investor.addEventListener("close", event => reject(), {once: true});
			await investor.render({force: true});
		});
	}

	/**
	 * Processes form submission for the Creation Point Investor.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 */
	static async #onCreationPointInvestorFormSubmit(event, form, formData)
	{
		const error = this._checkForError();
		if(error)
			return ui.notifications.error(game.i18n.format("SELECTOR.WARNINGS.cannotSubmit", {
				error: game.i18n.localize(`${capitalize(this.constructor.name)}.WARNINGS.${error}`)
			}));

		const warning = this._checkForWarning();
		if(!warning || await this._askConfirmation(warning)) {
			this.options.submit(foundry.utils.expandObject(formData.object).creationPointInvestments);
			await this.close({submitted: true});
		}
	}
}
