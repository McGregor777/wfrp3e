import StanceAdvance from "./stance-advance.mjs";

/**
 * The data model for a conservative advance.
 * @property {boolean} active Whether the career advance is active.
 * @property {string} type The type of career advance, a value in CareerAdvance.TYPES.
 */
export default class ConservativeAdvance extends StanceAdvance
{
	static {
		Object.defineProperty(this, "TYPE", {value: "conservative"});
	}
}
