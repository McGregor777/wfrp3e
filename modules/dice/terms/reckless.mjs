import Die from "./die.mjs";

/** @inheritDoc */
export default class RecklessDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 10;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "r";

	static NAME = "reckless";

	static RESULTS = {
		1: {name: "blank"},
		2: {name: "blank"},
		3: {
			name: "twoSuccesses",
			symbols: {successes: 2}
		},
		4: {
			name: "twoSuccesses",
			symbols: {successes: 2}
		},
		5: {
			name: "oneSuccessOneBoon",
			symbols: {
				successes: 1,
				boons: 1
			}
		},
		6: {
			name: "twoBoons",
			symbols: {boons: 2}
		},
		7: {
			name: "oneBane",
			symbols: {banes: 1}
		},
		8: {
			name: "oneBane",
			symbols: {banes: 1}
		},
		9: {
			name: "oneSuccessOneExertion",
			symbols: {
				successes: 1,
				exertions: 1
			}
		},
		10: {
			name: "oneSuccessOneExertion",
			symbols: {
				successes: 1,
				exertions: 1
			}
		}
	};
}
