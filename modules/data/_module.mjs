/** @module data */

import * as actors from "./actors/_module.mjs";
import * as items from "./items/_module.mjs";
import ActiveEffect from "./active-effect.mjs";
import Combat from "./combat.mjs";

export * as macros from "./macros/_module.mjs";
export {actors, items, Combat, ActiveEffect};

export function assignDataModels()
{
	actors.assignDataModels();
	items.assignDataModels();

	CONFIG.ActiveEffect.dataModels["base"] = ActiveEffect;
	CONFIG.Combat.dataModels["base"] = Combat;
}
