/** @inheritDoc */
export default class TalentSelectorV2 extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "talent-selector-{id}",
		classes: ["wfrp3e", "selector", "talent-selector"],
		tag: "form",
		window: {title: "TALENTSELECTOR.title"},
		form: {
			handler: this._handleForm,
			closeOnSubmit: true
		},
		position: {
			width: 850,
			height: 780
		}
	}

	/** @inheritDoc */
	static PARTS = {
		heading:  {template: "systems/wfrp3e/templates/applications/talent-selector/heading.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		main: {
			template: "systems/wfrp3e/templates/applications/talent-selector/main.hbs",
			scrollable: [".item-container"]
		},
		footer: {template: "templates/generic/form-footer.hbs"}
	}

	/** @inheritDoc */
	tabGroups = {talentTypes: "focus"}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		switch(partId) {
			case "tabs":
				context.tabs = this._getTabs()
				break;
			case "main":
				context.talents = this.options.talents;
				break;
			case "footer":
				context.buttons = this._getFooterButtons();
				break;
		}

		return context;
	}

	/** @inheritDoc */
	async _onChangeForm(formConfig, event)
	{
		const form = event.currentTarget,
			  formData = new FormDataExtended(form),
			  selectedInput = this.element.querySelector(`input[name="selection"][value="${formData.object.selection}"]`),
			  selectedLabel = selectedInput.closest("label"),
			  selectedItem = await fromUuid(formData.object.selection),
			  selectionSpan = this.element.querySelector('section[data-application-part="main"] .selection');

		this.element.querySelectorAll("label").forEach(element => {
			if(selectedLabel !== element)
				element.classList.remove("active");
		});
		selectedLabel.classList.add("active");
		selectionSpan.innerText = selectedItem.name;

		super._onChangeForm(formConfig, event);
	}

	/**
	 * Prepare an array of Talent type tabs.
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @private
	 */
	_getTabs()
	{
		const tabs = {};
		let activeTalentType = null;

		for(const [talentType, talents] of Object.entries(this.options.talents)) {
			if(talents.length > 0) {
				tabs[talentType] = {id: talentType, group: "talentTypes", label: CONFIG.WFRP3e.talentTypes[talentType]}

				if(activeTalentType === null) {
					activeTalentType = talentType;

					tabs[talentType] = {
						...tabs[talentType],
						active: true,
						cssClass: "active"
					};
				}
			}
		}

		return tabs;
	}

	/**
	 * Prepare an array of form footer buttons.
	 * @returns {Partial<FormFooterButton>[]}
	 */
	_getFooterButtons()
	{
		return [{type: "submit", icon: "fa-solid fa-gears", label: "TALENTSELECTOR.ACTIONS.chooseTalent"}]
	}

	/**
	 * Processes form submission for the TalentSelectorV2.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 */
	static async _handleForm(event, form, formData)
	{
		this.options.submit(formData.object.selection);
	}

	/**
	 * Spawns a TalentSelectorV2 and waits for it to be dismissed or submitted.
	 * @param {ApplicationConfiguration} [options] Options used to configure the Application instance.
	 * @returns {Promise<any>} Resolves to the selected Talent.
	 */
	static async wait(options = {})
	{
		return new Promise((resolve, reject) => {
			// Wrap submission handler with Promise resolution.
			options.submit = async result => {resolve(result)};
			new this(options).render(true);
		});
	}
}