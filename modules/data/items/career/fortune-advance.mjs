import RatingAdvance from "./rating-advance.mjs";

/**
 * The data model for a characteristic fortune advance.
 * @property {boolean} active Whether the career advance is active.
 * @property {string} type The type of career advance, a value in CareerAdvance.TYPES.
 * @property {string} [characteristic] The name of the characteristic which fortune is upgraded by the advance.
 */
export default class FortuneAdvance extends RatingAdvance
{
	static {
		Object.defineProperty(this, "TYPE", {value: "fortune"});
	}
}
