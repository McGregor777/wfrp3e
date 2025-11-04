import Die from "./die.mjs";

/** @inheritDoc */
export default class MisfortuneDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 6;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "m";

	static NAME = "misfortune";

	static RESULTS = {
		1: {name: "blank"},
		2: {name: "blank"},
		3: {name: "blank"},
		4: {
			name: "oneChallenge",
			symbols: {challenges: 1}
		},
		5: {
			name: "oneChallenge",
			symbols: {challenges: 1}
		},
		6: {
			name: "oneBane",
			symbols: {banes: 1}
		}
	};
}
