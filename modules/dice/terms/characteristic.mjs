import Die from "./die.mjs";

/** @inheritDoc */
export default class CharacteristicDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 8;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "a";

	static NAME = "characteristic";

	static RESULTS = {
		1: {name: "blank"},
		2: {name: "blank"},
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
			name: "oneSuccess",
			symbols: {successes: 1}
		},
		7: {
			name: "oneBoon",
			symbols: {boons: 1}
		},
		8: {
			name: "oneBoon",
			symbols: {boons: 1}
		}
	};
}
