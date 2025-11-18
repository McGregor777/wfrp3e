import {default as ContextMenu} from "./context-menu.mjs"

export {ContextMenu};

export function replaceContextMenu()
{
	CONFIG.ux.ContextMenu = ContextMenu;
}
