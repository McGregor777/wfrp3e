/** @inheritDoc */
export default class CharacteristicUpgrader extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);

		if(!options.actor)
			throw new Error("An Actor has to be specified to a Characteristic Upgrader.");
		if(!options.career)
			throw new Error("A Career has to be specified to a Characteristic Upgrader.");

		this.actor = options.actor;
		this.career = options.career;

		if(options.nonCareerAdvance)
			this.nonCareerAdvance = options.nonCareerAdvance;
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "characteristic-upgrader-{id}",
		classes: ["wfrp3e", "characteristic-upgrader"],
		tag: "form",
		window: {title: "CHARACTERISTICUPGRADER.title"},
		form: {
			handler: this.#onUpgraderFormSubmit,
			closeOnSubmit: true
		},
		position: {width: 360}
	};

	/** @inheritDoc */
	static PARTS = {
		characteristics: {template: "systems/wfrp3e/templates/applications/apps/characteristic-upgrader/characteristics.hbs"},
		selection: {template: "systems/wfrp3e/templates/applications/apps/characteristic-upgrader/selection.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/**
	 * The actor upgrading one of its characteristics.
	 * @type {Actor}
	 */
	actor = null;

	/**
	 * The career which data is used by the Characteristic Upgrader.
	 * @type {Item}
	 */
	career = null;

	/**
	 * Whether the upgraded characteristic is a career characteristic or not.
	 * @type {boolean}
	 */
	nonCareerAdvance = false;

	/**
	 * The currently selected upgrade.
	 * @type {null}
	 */
	upgrade = null;

	/** @inheritDoc */
	async _prepareContext(options)
	{
		// Either show primary or non-primary characteristics depending on if the advance is a regular or a non-career one.
		const primaryCharacteristics = this.career.system.primaryCharacteristics,
			  characteristics = {};
		for(const [key, characteristic] of Object.entries(this.actor.system.characteristics))
			if((!this.nonCareerAdvance && primaryCharacteristics.includes(key))
				|| this.nonCareerAdvance && !primaryCharacteristics.includes(key))
				characteristics[key] = {...characteristic, ...wfrp3e.data.actors.Actor.CHARACTERISTICS[key]};

		return {
			...await super._prepareContext(options),
			buttons: [{type: "submit", icon: "fa-solid fa-check", label: "CHARACTERISTICUPGRADER.ACTIONS.upgradeCharacteristic"}],
			characteristics,
			upgrade: this.upgrade
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partId === "characteristics")
			partContext = {
				...partContext,
				actor: this.actor,
				availableOpenAdvances: this.career.system.advances.open.filter(advance => !advance),
				availableNonCareerAdvances: this.career.system.advances.nonCareer.filter(advance => !advance.type),
				nonCareerAdvance: this.nonCareerAdvance
			};

		return partContext;
	}

	/** @inheritDoc */
	async _onChangeForm(formConfig, event)
	{
		const form = event.currentTarget,
			  formData = new FormDataExtended(form),
			  matches = [...formData.object.upgrade.matchAll(new RegExp(/(^\w*)_(\w*$)/, "g"))][0],
			  newValue = this.actor.system.characteristics[matches[1]][matches[2]] + 1;
		let cost = newValue;

		if(matches[2] === "rating" && this.nonCareerAdvance)
			cost++;
		else if(matches[2] === "fortune")
			cost = 1;

		if(this.actor.system.experience.current < cost)
			return ui.notifications.warn(game.i18n.localize("CHARACTER.WARNINGS.notEnoughExperienceForAdvance"));

		this.upgrade = {
			characteristic: matches[1],
			type: matches[2],
			value: newValue
		};

		super._onChangeForm(formConfig, event);

		await this.render();
	}

	/**
	 * Spawns a Characteristic Upgrader and waits for it to be dismissed or submitted.
	 * @param {ApplicationConfiguration} [config]
	 * @returns {Promise<any>} Resolves to the selected upgrade.
	 */
	static async wait(config = {})
	{
		return new Promise(async (resolve, reject) => {
			// Wrap the submission handler with Promise resolution.
			config.submit = async result => {resolve(result)};
			const characteristicUpgrader = new this(...arguments);
			characteristicUpgrader.addEventListener("close", event => reject(), {once: true});
			await characteristicUpgrader.render({force: true});
		});
	}

	/**
	 * Processes form submission for the Characteristic Upgrader.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 */
	static async #onUpgraderFormSubmit(event, form, formData)
	{
		if(!this.upgrade)
			return ui.notifications.warn(game.i18n.localize("CHARACTERISTICUPGRADER.WARNINGS.noUpgradeSelected"));

		this.options.submit(this.upgrade);
	}
}
