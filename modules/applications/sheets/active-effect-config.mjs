export default class ActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig
{
	/** @inheritDoc */
	static PARTS = {
		header: {template: "templates/sheets/active-effect/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"},
		details: {template: "templates/sheets/active-effect/details.hbs", scrollable: [""]},
		duration: {template: "templates/sheets/active-effect/duration.hbs"},
		changes: {template: "templates/sheets/active-effect/changes.hbs", scrollable: ["ol[data-changes]"]},
		macro: {template: "systems/wfrp3e/templates/applications/sheets/active-effect-config/macro.hbs"},
		footer: {template: "templates/generic/form-footer.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "details", icon: "fa-solid fa-book"},
				{id: "duration", icon: "fa-solid fa-clock"},
				{id: "changes", icon: "fa-solid fa-gears"},
				{id: "macro", icon: "fa-solid fa-code"}
			],
			initial: "details",
			labelPrefix: "EFFECT.TABS"
		}
	};

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partId === "macro") {
			partContext = {
				...partContext,
				fields: this.document.system.macro.schema.fields,
				system: this.document.system.macro
			};
		}

		return partContext;
	}

	/** @inheritDoc */
	async _onRender(context, options)
	{
		await super._onRender(context, options);

		for(const element of this.element.querySelectorAll('[name="system.macro.type"]'))
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
		await this.submit({
			preventClose: true,
			updateData: {
				"system.macro": {
					script: this.form.querySelector('[name="system.macro.script"]').value
						?? this.document.system.macro.script,
					type: event.target.value,
					conditionalScript: this.form.querySelector('[name="system.macro.conditionalScript"]')?.value
						?? this.document.system.macro.conditionalScript,
					postRollScript: this.form.querySelector('[name="system.macro.postRollScript"]')?.value
						?? this.document.system.macro.postRollScript
				}
			},
			recursive: false
		});
	}
}
