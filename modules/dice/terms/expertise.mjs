import Die from "./die.mjs";

/** @inheritDoc */
export default class ExpertiseDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 6;
		termData.modifiers = ["x3"]
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "e";

	static NAME = "expertise";

	static RESULTS = {
		1: {name: "blank"},
		2: {
			name: "oneSuccess",
			symbols: {successes: 1}
		},
		3: {
			name: "oneRighteousSuccess",
			symbols: {righteousSuccesses: 1}
		},
		4: {
			name: "oneBoon",
			symbols: {boons: 1}
		},
		5: {
			name: "oneBoon",
			symbols: {boons: 1}
		},
		6: {
			name: "oneSigmarsComet",
			symbols: {sigmarsComets: 1}
		}
	};
}
