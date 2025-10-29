export default class ActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig
{
	/** @inheritDoc */
	static PARTS = {
		header: {template: "templates/sheets/active-effect/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		details: {template: "templates/sheets/active-effect/details.hbs", scrollable: [""]},
		duration: {template: "templates/sheets/active-effect/duration.hbs"},
		changes: {template: "templates/sheets/active-effect/changes.hbs", scrollable: ["ol[data-changes]"]},
		scripts: {template: "systems/wfrp3e/templates/applications/sheets/active-effect-config/scripts.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "details", icon: "fa-solid fa-book"},
				{id: "duration", icon: "fa-solid fa-clock"},
				{id: "changes", icon: "fa-solid fa-gears"},
				{id: "scripts", icon: "fa-solid fa-code"}
			],
			initial: "details",
			labelPrefix: "EFFECT.TABS"
		}
	};

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partId === "scripts") {
			partContext = {
				...partContext,
				fields: this.document.system.schema.fields,
				system: this.document.system
			};
		}

		return partContext;
	}

	/** @inheritDoc */
	async _onRender(context, options)
	{
		await super._onRender(context, options);

		for(const element of this.element.querySelectorAll('[name="system.type"]'))
			element.addEventListener("change", this._onTypeChange.bind(this, options));
	}

	/**
	 * Updates the script type of the active effect.
	 * @param {Object} [options]
	 * @param {Event} event
	 * @returns {Promise<void>}
	 * @private
	 */
	async _onTypeChange(options, event)
	{
		foundry.utils.setProperty(this.document, event.target.name, event.target.value);

		await this.submit({
			preventClose: true,
			updateData: {"system.type": this.document.system.type}
		});
	}
}
