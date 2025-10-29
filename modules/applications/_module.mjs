/** @module applications */

import {
	initializeHelpers as initializeHandlebarsHelpers,
	preloadTemplates as preloadHandlebarsTemplates
} from "./handlebars.mjs";

export * as apps from "./apps/_module.mjs";
export * as dice from "./dice/_module.mjs";
export * as sheets from "./sheets/_module.mjs";
export * as sidebar from "./sidebar/_module.mjs";

export function initializeHandlebars()
{
	initializeHandlebarsHelpers();
	preloadHandlebarsTemplates();
}
