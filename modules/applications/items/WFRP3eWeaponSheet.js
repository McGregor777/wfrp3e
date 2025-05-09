import WFRP3eTrappingSheet from "./WFRP3eTrappingSheet.js";

/** @inheritDoc */
export default class WFRP3eWeaponSheet extends WFRP3eTrappingSheet
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		actions: {
			addQuality: this.#onAddQuality,
			removeQuality: this.#onRemoveQuality
		},
		classes: ["weapon"]
	};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		main: {
			template: "systems/wfrp3e/templates/applications/items/weapon-sheet/main.hbs",
			scrollable: [".qualities-container"]
		},
		details: {template: "systems/wfrp3e/templates/applications/items/details.hbs"},
		effects: {template: "systems/wfrp3e/templates/applications/items/effects.hbs"}
	};

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partId === "main")
			partContext.qualitiesWithRating = ["attuned", "pierce", "unreliable"];

		return context;
	}

	/** @inheritDoc */
	_processFormData(event, form, formData)
	{
		const data = foundry.utils.expandObject(formData.object);

		if(data.system.qualities.element.name) {
			const qualityData = data.system.qualities.element;
			const qualities = [];

			if(Array.isArray(qualityData.name))
				for(let i = 0; i < qualityData.name.length; i++) {
					qualities.push({
						name: qualityData.name[i],
						rating: qualityData.rating[i]
					});
				}
			else
				qualities.push({
					name: qualityData.name,
					rating: qualityData.rating
				});

			data.system.qualities = qualities;
		}

		return data;
	}

	/**
	 * Performs follow-up operations after clicks on a Quality addition icon.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #onAddQuality()
	{
		await this.item.addNewQuality();
	}

	/**
	 * Performs follow-up operations after clicks on a Quality removal icon.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #onRemoveQuality(event, target)
	{
		await this.item.removeQuality(target.closest(".quality").dataset.index);
	}
}