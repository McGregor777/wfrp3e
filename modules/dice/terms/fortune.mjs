import Die from "./die.mjs";

/** @inheritDoc */
export default class FortuneDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 6;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "f";

	static NAME = "fortune";

	static RESULTS = {
		1: {name: "blank"},
		2: {name: "blank"},
		3: {name: "blank"},
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
		}
	};
}
