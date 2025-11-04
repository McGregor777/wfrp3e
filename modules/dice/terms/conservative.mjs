import Die from "./die.mjs";

/** @inheritDoc */
export default class ConservativeDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 10;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "o";

	static NAME = "conservative";

	static RESULTS = {
		1: {name: "blank"},
		2: {
			name: "oneSuccess",
			symbols: {successes: 1}
		},
		3: {
			name: "oneSuccess",
			symbols: {successes: 1}
		},
		4: {
			name: "oneSuccess",
			symbols: {successes: 1}
		},
		5: {
			name: "oneSuccess",
			symbols: {successes: 1}
		},
		6: {
			name: "oneBoon",
			symbols: {boons: 1}
		},
		7: {
			name: "oneBoon",
			symbols: {boons: 1}
		},
		8: {
			name: "oneSuccessOneBoon",
			successes: 1,
			symbols: {boons: 1}
		},
		9: {
			name: "oneSuccessOneDelay",
			symbols: {
				successes: 1,
				delays: 1
			}
		},
		10: {
			name: "oneSuccessOneDelay",
			symbols: {
				successes: 1,
				delays: 1
			}
		}
	};
}
