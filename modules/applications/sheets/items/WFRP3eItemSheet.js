/** @inheritDoc */
export default class WFRP3eItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2)
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			addActiveEffect: this.#addActiveEffect,
			editEffect: this.#editEffect,
			removeEffect: this.#removeEffect
		},
		classes: ["wfrp3e", "sheet", "item"],
		form: {submitOnChange: true},
		position: {width: 600},
		window: {contentClasses: ["standard-form"]}
	};

	/** @inheritDoc */
	static PARTS = {
		header: {template: "systems/wfrp3e/templates/applications/header.hbs"},
		tabs: {template: "templates/generic/tab-navigation.hbs"}
	};

	/** @inheritDoc */
	static TABS = {
		sheet: {
			tabs: [
				{id: "main", icon: "fa-solid fa-book"},
				{id: "effects", icon: "fa-fw fa-solid fa-person-rays"}
			],
			initial: "main",
			labelPrefix: "ITEM.TABS"
		}
	};

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			system: this.item.system
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		const partContext = await super._preparePartContext(partId, context);

		if(partContext.tabs && partId in partContext.tabs)
			partContext.tab = partContext.tabs[partId];

		switch(partId) {
			case "main":
				partContext.fields = this.item.system.schema.fields;
				break;
			case "effects":
				partContext.effects = this.item.effects;
				break;
		}

		return partContext;
	}

	/**
	 * Adds a new effect to the Item.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #addActiveEffect()
	{
		await this.item.createEffect();
	}

	/**
	 * Opens the WFRP3eEffect editor.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #editEffect(event, target)
	{
		await fromUuid(target.closest(".effect[data-uuid]").dataset.uuid).then(
			effect => effect.sheet.render(true)
		);
	}

	/**
	 * Asks for confirmation for a specific WFRP3eEffect definitive removal.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static #removeEffect(event, target)
	{
		foundry.applications.api.DialogV2.confirm({
			window: {title: game.i18n.localize("DIALOG.TITLE.EffectDeletion")},
			modal: true,
			content: `<p>${game.i18n.localize("DIALOG.DESCRIPTION.EffectDeletion")}</p>`,
			submit: async (result) => {
				if(result)
					await fromUuid(target.closest(".effect[data-uuid]").dataset.uuid).then(
						effect => effect.delete()
					);
			}
		});
	}
}
