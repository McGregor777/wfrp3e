import * as actors from "./actors/_module.mjs";
import * as items from "./items/_module.mjs";
import ActiveEffectConfig from "./active-effect-config.mjs";

export {actors, items, ActiveEffectConfig};

export function registerSheets()
{
	actors.registerSheets();
	items.registerSheets();

	foundry.applications.apps.DocumentSheetConfig.registerSheet(
		CONFIG.ActiveEffect.documentClass,
		"wfrp3e",
		ActiveEffectConfig,
		{label: "WFRP3e Active Effect Config", makeDefault: true}
	);
}
