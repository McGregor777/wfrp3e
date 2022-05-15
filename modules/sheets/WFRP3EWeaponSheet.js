export default class WFRP3EWeaponSheet extends ItemSheet
{
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/weapon-sheet.html",
			//width: 530,
			//height: 340,
			classes: ["wfrp3e", "sheet", "item", "weapon"]
		});
	}

	getData()
	{
		const data = super.getData();

		data.rarities = CONFIG.WFRP3E.rarities;
		data.weaponGroups = CONFIG.WFRP3E.weaponGroups;
		data.ranges = CONFIG.WFRP3E.ranges;

		return data;
	}
}