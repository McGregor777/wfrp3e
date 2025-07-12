/**
 * @typedef {Object} PartyEventEditorData
 * @property {WFRP3eActor} party
 * @property {PartyEvent} event
 * @property {number} [index]
 */

/**
 * The Application class allowing to edit Action Effects.
 * @extends {ApplicationV2<ApplicationConfiguration & PartyEventEditorData, ApplicationRenderOptions>}
 * @mixes HandlebarsApplication
 * @alias PartyEventEditor
 */
export default class PartyEventEditor extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);

		this.data = options.data;
		this.event = options.data.event;
		this.party = options.data.party;
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "party-event-editor-{id}",
		classes: ["wfrp3e party-event-editor"],
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			title: "PARTYEVENTEDITOR.title"
		},
		form: {
			handler: this.#onPartyEventFormSubmit,
			submitOnChange: false,
			closeOnSubmit: true
		},
		position: {width: 600}
	};

	/** @inheritDoc */
	static PARTS = {
		main: {template: "systems/wfrp3e/templates/applications/party-event-editor/main.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/**
	 * @type {PartyEventEditorData}
	 */
	data;

	/**
	 * The Party which event is edited.
	 * @type {WFRP3eActor}
	 */
	party;

	/**
	 * The edited Action effect.
	 * @type {PartyEvent}
	 */
	effect;

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			buttons: [{type: "submit", icon: "fa-solid fa-save", label: "PARTYEVENTEDITOR.ACTIONS.submit"}],
			event: this.event,
			index: this.data.index,
			fields: this.party.system.schema.fields.tension.fields.events.element.fields,
			rootId: this.id
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partId === "main")
			partContext.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(this.event.description);

		return partContext;
	}

	/**
	 * Processes form submission for the Party Event Editor.
	 * @this {PartyEventEditor} The handler is called with the application as its bound scope.
	 * @param {SubmitEvent} event The originating form submission event.
	 * @param {HTMLFormElement} form The form element that was submitted.
	 * @param {FormDataExtended} formData Processed data for the submitted form.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #onPartyEventFormSubmit(event, form, formData)
	{
		const events = this.party.system.tension.events,
			  submitData = foundry.utils.expandObject(formData.object);

		// If the index exists, update the event, else add the new event.
		this.data.index ? events[this.data.index] = submitData : events.push(submitData);

		this.party.update({"system.tension.events": events});
	}
}