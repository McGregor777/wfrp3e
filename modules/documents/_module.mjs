/** @module documents */

import * as combat from "./combat/_module.mjs";
import ActiveEffect from "./active-effect.mjs";
import Actor from "./actor.mjs";
import Item from "./item.mjs";
import RollTable from "./roll-table.mjs";

export {combat, ActiveEffect, Actor, Item, RollTable};

export function assignDocumentClasses()
{
	combat.assignDocumentClasses();

	CONFIG.ActiveEffect.documentClass = ActiveEffect;
	CONFIG.Actor.documentClass = Actor;
	CONFIG.Item.documentClass = Item;
	CONFIG.RollTable.documentClass = RollTable;
}
