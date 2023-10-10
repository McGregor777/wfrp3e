export default class WFRP3eWeaponSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/weapon-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "weapon", "weapon-item-sheet"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.rarities = CONFIG.WFRP3e.rarities;
		data.groups = CONFIG.WFRP3e.weapon.groups;
		data.ranges = CONFIG.WFRP3e.weapon.ranges;

		return data;
	}
}