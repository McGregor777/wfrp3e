export default class WFRP3ECareerSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/career-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "career", "career-item-sheet"],
		});
	}

	getData()
	{
		const data = super.getData();

		data.characteristics = CONFIG.WFRP3E.characteristics;
		data.talentTypes = CONFIG.WFRP3E.talentTypes;

		return data;
	}

	/*
	 * Activate event listeners using the prepared sheet HTML
	 *
	 * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
	 */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".talent-socket-add").click(this._onTalentSocketAdd.bind(this));
	}

	async _onTalentSocketAdd(event)
	{
		this.item.update(system.talentSockets = {[`${Object.keys(this.item.system.talentSockets).length}`]: ""});
	}
}