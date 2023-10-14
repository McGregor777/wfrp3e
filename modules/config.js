export const WFRP3e = {
	actionTypes: {
		melee: "ACTION.TYPE.Melee",
		ranged: "ACTION.TYPE.Ranged",
		support: "ACTION.TYPE.Support",
		blessing: "ACTION.TYPE.Blessing",
		spell: "ACTION.TYPE.Spell"
	},
	characteristics: {
		strength: {
			name: "CHARACTERISTIC.Strength",
			abbreviation: "CHARACTERISTIC.ABBREVIATION.Strength",
			type: "physical"
		},
		toughness: {
			name: "CHARACTERISTIC.Toughness",
			abbreviation: "CHARACTERISTIC.ABBREVIATION.Toughness",
			type: "physical"
		},
		agility: {
			name: "CHARACTERISTIC.Agility",
			abbreviation: "CHARACTERISTIC.ABBREVIATION.Agility",
			type: "physical"
		},
		intelligence: {
			name: "CHARACTERISTIC.Intelligence",
			abbreviation: "CHARACTERISTIC.ABBREVIATION.Intelligence",
			type: "mental"
		},
		willpower: {
			name: "CHARACTERISTIC.Willpower",
			abbreviation: "CHARACTERISTIC.ABBREVIATION.Willpower",
			type: "mental"
		},
		fellowship: {
			name: "CHARACTERISTIC.Fellowship",
			abbreviation: "CHARACTERISTIC.ABBREVIATION.Fellowship",
			type: "mental"
		},
		varies: {
			name: "CHARACTERISTIC.Varies",
			abbreviation: "CHARACTERISTIC.ABBREVIATION.Varies"
		},
	},
	challengeLevels: {
		simple: {
			challengeDice: 0,
			name: "ROLL.CHALLENGELEVEL.Simple"
		},
		easy: {
			challengeDice: 1,
			name: "ROLL.CHALLENGELEVEL.Easy"
		},
		average: {
			challengeDice: 2,
			name: "ROLL.CHALLENGELEVEL.Average"
		},
		hard: {
			challengeDice: 3,
			name: "ROLL.CHALLENGELEVEL.Hard"
		},
		daunting: {
			challengeDice: 4,
			name: "ROLL.CHALLENGELEVEL.Daunting"
		}
	},
	conditionDurations: {
		brief: "CONDITION.DURATION.Brief",
		dependent: "CONDITION.DURATION.Dependent",
		lingering: "CONDITION.DURATION.Lingering"
	},
	dice: {
		characteristic: {
			icon: "systems/wfrp3e/assets/icons/dice/characteristic.webp",
			results: {
				1: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/characteristic.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				2: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/characteristic.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				3: {
					label: "ROLL.RESULT.OneSuccess",
					image: "systems/wfrp3e/assets/icons/dice/characteristic_onesuccess.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				4: {
					label: "ROLL.RESULT.OneSuccess",
					image: "systems/wfrp3e/assets/icons/dice/characteristic_onesuccess.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				5: {
					label: "ROLL.RESULT.OneSuccess",
					image: "systems/wfrp3e/assets/icons/dice/characteristic_onesuccess.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				6: {
					label: "ROLL.RESULT.OneSuccess",
					image: "systems/wfrp3e/assets/icons/dice/characteristic_onesuccess.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				7: {
					label: "ROLL.RESULT.OneBoon",
					image: "systems/wfrp3e/assets/icons/dice/characteristic_oneboon.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 1,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				8: {
					label: "ROLL.RESULT.OneBoon",
					image: "systems/wfrp3e/assets/icons/dice/characteristic_oneboon.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 1,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				}
			}
		},
		fortune: {
			icon: "systems/wfrp3e/assets/icons/dice/fortune.webp",
			results: {
				1: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/fortune.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				}, 2: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/fortune.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				}, 3: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/fortune.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				}, 4: {
					label: "ROLL.RESULT.OneSuccess",
					image: "systems/wfrp3e/assets/icons/dice/fortune_onesuccess.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				}, 5: {
					label: "ROLL.RESULT.OneSuccess",
					image: "systems/wfrp3e/assets/icons/dice/fortune_onesuccess.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				}, 6: {
					label: "ROLL.RESULT.OneBoon",
					image: "systems/wfrp3e/assets/icons/dice/fortune_oneboon.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 1,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				}
			},
		},
		expertise: {
			icon: "systems/wfrp3e/assets/icons/dice/expertise.webp",
			results: {
				1: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/expertise.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				2: {
					label: "ROLL.RESULT.OneSuccess",
					image: "systems/wfrp3e/assets/icons/dice/expertise_onesuccess.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				3: {
					label: "ROLL.RESULT.OneRighteousSuccess",
					image: "systems/wfrp3e/assets/icons/dice/expertise_onerighteoussuccess.webp",
					successes: 0,
					righteousSuccesses: 1,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				4: {
					label: "ROLL.RESULT.OneBoon",
					image: "systems/wfrp3e/assets/icons/dice/expertise_oneboon.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 1,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				5: {
					label: "ROLL.RESULT.OneBoon",
					image: "systems/wfrp3e/assets/icons/dice/expertise_oneboon.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 1,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				6: {
					label: "ROLL.RESULT.OneSigmarsComet",
					image: "systems/wfrp3e/assets/icons/dice/expertise_onesigmarscomet.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 1,
					chaosStars: 0
				}
			},
		},
		conservative: {
			icon: "systems/wfrp3e/assets/icons/dice/conservative.webp",
			results: {
				1: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/conservative.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				2: {
					label: "ROLL.RESULT.OneSuccess",
					image: "systems/wfrp3e/assets/icons/dice/conservative_onesuccess.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				3: {
					label: "ROLL.RESULT.OneSuccess",
					image: "systems/wfrp3e/assets/icons/dice/conservative_onesuccess.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				4: {
					label: "ROLL.RESULT.OneSuccess",
					image: "systems/wfrp3e/assets/icons/dice/conservative_onesuccess.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				5: {
					label: "ROLL.RESULT.OneSuccess",
					image: "systems/wfrp3e/assets/icons/dice/conservative_onesuccess.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				6: {
					label: "ROLL.RESULT.OneBoon",
					image: "systems/wfrp3e/assets/icons/dice/conservative_oneboon.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 1,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				7: {
					label: "ROLL.RESULT.OneBoon",
					image: "systems/wfrp3e/assets/icons/dice/conservative_oneboon.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 1,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				8: {
					label: "ROLL.RESULT.OneSuccessOneBoon",
					image: "systems/wfrp3e/assets/icons/dice/conservative_onesuccess_oneboon.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 1,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				9: {
					label: "ROLL.RESULT.OneSuccessOneDelay",
					image: "systems/wfrp3e/assets/icons/dice/conservative_onesuccess_onedelay.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 1,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				10: {
					label: "ROLL.RESULT.OneSuccessOneDelay",
					image: "systems/wfrp3e/assets/icons/dice/conservative_onesuccess_onedelay.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 1,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				}
			},
		},
		reckless: {
			icon: "systems/wfrp3e/assets/icons/dice/reckless.webp",
			results: {
				1: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/reckless.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				2: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/reckless.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				3: {
					label: "ROLL.RESULT.TwoSuccesses",
					image: "systems/wfrp3e/assets/icons/dice/reckless_twosuccesses.webp",
					successes: 2,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				4: {
					label: "ROLL.RESULT.TwoSuccesses",
					image: "systems/wfrp3e/assets/icons/dice/reckless_twosuccesses.webp",
					successes: 2,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				5: {
					label: "ROLL.RESULT.OneSuccessOneBoon",
					image: "systems/wfrp3e/assets/icons/dice/reckless_onesuccess_oneboon.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 1,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				6: {
					label: "ROLL.RESULT.TwoBoons",
					image: "systems/wfrp3e/assets/icons/dice/reckless_twoboons.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 2,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				7: {
					label: "ROLL.RESULT.OneBane",
					image: "systems/wfrp3e/assets/icons/dice/reckless_onebane.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 1,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				8: {
					label: "ROLL.RESULT.OneBane",
					image: "systems/wfrp3e/assets/icons/dice/reckless_onebane.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 1,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				9: {
					label: "ROLL.RESULT.OneSuccessOneExertion",
					image: "systems/wfrp3e/assets/icons/dice/reckless_onesuccess_oneexertion.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 1,
					sigmarsComets: 0,
					chaosStars: 0
				},
				10: {
					label: "ROLL.RESULT.OneSuccessOneExertion",
					image: "systems/wfrp3e/assets/icons/dice/reckless_onesuccess_oneexertion.webp",
					successes: 1,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 1,
					sigmarsComets: 0,
					chaosStars: 0
				}
			}
		},
		challenge: {
			icon: "systems/wfrp3e/assets/icons/dice/challenge.webp",
			results: {
				1: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/challenge.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				2: {
					label: "ROLL.RESULT.OneChallenge",
					image: "systems/wfrp3e/assets/icons/dice/challenge_onechallenge.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 1,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				3: {
					label: "ROLL.RESULT.OneChallenge",
					image: "systems/wfrp3e/assets/icons/dice/challenge_onechallenge.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 1,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				4: {
					label: "ROLL.RESULT.TwoChallenges",
					image: "systems/wfrp3e/assets/icons/dice/challenge_twochallenges.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 2,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				5: {
					label: "ROLL.RESULT.TwoChallenges",
					image: "systems/wfrp3e/assets/icons/dice/challenge_twochallenges.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 2,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				6: {
					label: "ROLL.RESULT.OneBane",
					image: "systems/wfrp3e/assets/icons/dice/challenge_onebane.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 1,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				7: {
					label: "ROLL.RESULT.TwoBanes",
					image: "systems/wfrp3e/assets/icons/dice/challenge_twobanes.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 2,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				8: {
					label: "ROLL.RESULT.OneChaosStar",
					image: "systems/wfrp3e/assets/icons/dice/challenge_onechaosstar.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 1
				}
			}
		},
		misfortune: {
			icon: "systems/wfrp3e/assets/icons/dice/misfortune.webp",
			results: {
				1: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/misfortune.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				2: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/misfortune.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				3: {
					label: "ROLL.RESULT.Blank",
					image: "systems/wfrp3e/assets/icons/dice/misfortune.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				4: {
					label: "ROLL.RESULT.OneChallenge",
					image: "systems/wfrp3e/assets/icons/dice/misfortune_onechallenge.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 1,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				5: {
					label: "ROLL.RESULT.OneChallenge",
					image: "systems/wfrp3e/assets/icons/dice/misfortune_onechallenge.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 1,
					boons: 0,
					banes: 0,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				},
				6: {
					label: "ROLL.RESULT.OneBane",
					image: "systems/wfrp3e/assets/icons/dice/misfortune_onebane.webp",
					successes: 0,
					righteousSuccesses: 0,
					challenges: 0,
					boons: 0,
					banes: 1,
					delays: 0,
					exertions: 0,
					sigmarsComets: 0,
					chaosStars: 0
				}
			},
		},
	},
	disease: {
		symptoms: {
			keywords: {
				delirium: "DISEASE.SYMPTOM.KEYWORD.Delirium",
				fever: "DISEASE.SYMPTOM.KEYWORD.Fever",
				infectious: "DISEASE.SYMPTOM.KEYWORD.Infectious",
				lethal: "DISEASE.SYMPTOM.KEYWORD.Lethal",
				painful: "DISEASE.SYMPTOM.KEYWORD.Painful",
				tiring: "DISEASE.SYMPTOM.KEYWORD.Tiring",
				virulent: "DISEASE.SYMPTOM.KEYWORD.Virulent",
				weary: "DISEASE.SYMPTOM.KEYWORD.Weary"
			},
			descriptions: {
				delirium: "DISEASE.SYMPTOM.DESCRIPTION.Delirium",
				fever: "DISEASE.SYMPTOM.DESCRIPTION.Fever",
				infectious: "DISEASE.SYMPTOM.DESCRIPTION.Infectious",
				lethal: "DISEASE.SYMPTOM.DESCRIPTION.Lethal",
				painful: "DISEASE.SYMPTOM.DESCRIPTION.Painful",
				tiring: "DISEASE.SYMPTOM.DESCRIPTION.Tiring",
				virulent: "DISEASE.SYMPTOM.DESCRIPTION.Virulent",
				weary: "DISEASE.SYMPTOM.DESCRIPTION.Weary"
			}
		}
	},
	rarities: {
		abundant: "TRAPPING.RARITY.Abundant",
		plentiful: "TRAPPING.RARITY.Plentiful",
		common: "TRAPPING.RARITY.Common",
		rare: "TRAPPING.RARITY.Rare",
		exotic: "TRAPPING.RARITY.Exotic"
	},
	stances: {
		"conservative": "ACTION.FACE.Conservative",
		"reckless": "ACTION.FACE.Reckless"
	},
	symbols: {
		success: {
			cssClass: "success",
			name: "ROLL.SYMBOL.Successes",
			plural: "successes",
			result: "ROLL.AMOUNT.Successes",
		},
		righteousSuccess: {
			cssClass: "righteous-success",
			name: "ROLL.SYMBOL.RighteousSuccesses",
			plural: "righteousSuccesses",
			result: "ROLL.AMOUNT.RighteousSuccesses",
		},
		boon: {
			cssClass: "boon",
			name: "ROLL.SYMBOL.Boons",
			plural: "boons",
			result: "ROLL.AMOUNT.Boons",
		},
		sigmarsComet: {
			cssClass: "sigmars-comet",
			name: "ROLL.SYMBOL.SigmarsComets",
			plural: "sigmarsComets",
			result: "ROLL.AMOUNT.SigmarsComets",
		},
		challenge: {
			cssClass: "challenge",
			name: "ROLL.SYMBOL.Challenges",
			plural: "challenges",
			result: "ROLL.AMOUNT.Challenges",
		},
		bane: {
			cssClass: "bane",
			name: "ROLL.SYMBOL.Banes",
			plural: "banes",
			result: "ROLL.AMOUNT.Banes",
		},
		chaosStar: {
			cssClass: "chaos-star",
			name: "ROLL.SYMBOL.ChaosStars",
			plural: "chaosStars",
			result: "ROLL.AMOUNT.ChaosStars",
		},
		delay: {
			cssClass: "delay",
			name: "ROLL.SYMBOL.Delays",
			plural: "delays",
			result: "ROLL.AMOUNT.Delays",
		},
		exertion: {
			cssClass: "exertion",
			name: "ROLL.SYMBOL.Exertions",
			plural: "exertions",
			result: "ROLL.AMOUNT.Exertions",
		}
	},
	talentTypes: {
		focus: "TALENT.TYPE.Focus",
		reputation: "TALENT.TYPE.Reputation",
		tactic: "TALENT.TYPE.Tactic",
		faith: "TALENT.TYPE.Faith",
		order: "TALENT.TYPE.Order",
		tricks: "TALENT.TYPE.Tricks",
		insanity: "TALENT.TYPE.Insanity"
	},
	weapon: {
		groups: {
			blackpowder: {
				name: "WEAPON.GROUP.Blackpowder",
				type: "ranged"
			},
			bow: {
				name: "WEAPON.GROUP.Bow",
				type: "ranged"
			},
			cavalry: {
				name: "WEAPON.GROUP.Cavalry",
				type: "melee"
			},
			crossbow: {
				name: "WEAPON.GROUP.Crossbow",
				type: "ranged"
			},
			fencing: {
				name: "WEAPON.GROUP.Fencing",
				type: "melee"
			},
			flail: {
				name: "WEAPON.GROUP.Flail",
				type: "melee"
			},
			greatWeapon: {
				name: "WEAPON.GROUP.GreatWeapon",
				type: "melee"
			},
			ordinary: {
				name: "WEAPON.GROUP.Ordinary",
				type: "melee"
			},
			polearm: {
				name: "WEAPON.GROUP.Polearm",
				type: "melee"
			},
			sling: {
				name: "WEAPON.GROUP.Sling",
				type: "ranged"
			},
			spear: {
				name: "WEAPON.GROUP.Spear",
				type: "melee"
			},
			staff: {
				name: "WEAPON.GROUP.Staff",
				type: "melee"
			},
			thrown: {
				name: "WEAPON.GROUP.Thrown",
				type: "ranged"
			},
			unarmed: {
				name: "WEAPON.GROUP.Unarmed",
				type: "melee"
			}
		},
		ranges: {
			close: "WEAPON.RANGE.Close",
			medium: "WEAPON.RANGE.Medium",
			long: "WEAPON.RANGE.Long",
			extreme: "WEAPON.RANGE.Extreme"
		}
	}
};