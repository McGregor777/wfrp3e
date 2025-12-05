import Die from "./die.mjs";

/** @inheritDoc */
export default class ChallengeDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 8;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "h";

	static NAME = "challenge";

	static RESULTS = {
		1: {name: "blank"},
		2: {
			name: "oneChallenge",
			symbols: {challenges: 1}
		},
		3: {
			name: "oneChallenge",
			symbols: {challenges: 1}
		},
		4: {
			name: "twoChallenges",
			symbols: {challenges: 2}
		},
		5: {
			name: "twoChallenges",
			symbols: {challenges: 2}
		},
		6: {
			name: "oneBane",
			symbols: {banes: 1}
		},
		7: {
			name: "twoBanes",
			symbols: {banes: 2}
		},
		8: {
			name: "oneChaosStar",
			symbols: {chaosStars: 1}
		}
	};
}
