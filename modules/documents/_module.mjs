/** @module documents */

import * as combat from "./combat/_module.mjs";
import ActiveEffect from "./active-effect.mjs";
import Actor from "./actor.mjs";
import Item from "./item.mjs";

export {combat, ActiveEffect, Actor, Item};

export function assignDocumentClasses()
{
	combat.assignDocumentClasses();

	CONFIG.ActiveEffect.documentClass = ActiveEffect;
	CONFIG.Actor.documentClass = Actor;
	CONFIG.Item.documentClass = Item;
}
