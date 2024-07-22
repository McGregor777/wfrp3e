export default class WFRP3eItemSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			height: 400
		};
	}

	get template()
	{
		return `systems/wfrp3e/templates/applications/items/${this.item.type.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}-sheet.hbs`;
	}
}