export default class WFRP3EWeaponSheet extends ItemSheet
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

		data.rarities = CONFIG.WFRP3E.rarities;
		data.groups = CONFIG.WFRP3E.weapon.groups;
		data.ranges = CONFIG.WFRP3E.weapon.ranges;

		return data;
	}
}