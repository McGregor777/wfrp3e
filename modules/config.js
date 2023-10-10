export const WFRP3e = {
	actionTypes: {
		melee: "ACTION.TYPE.Melee",
		ranged: "ACTION.TYPE.Ranged",
		support: "ACTION.TYPE.Support",
		blessing: "ACTION.TYPE.Blessing",
		spell: "ACTION.TYPE.Spell"
	},
	characteristics: {
		strength: "CHARACTERISTIC.Strength",
		toughness: "CHARACTERISTIC.Toughness",
		agility: "CHARACTERISTIC.Agility",
		intelligence: "CHARACTERISTIC.Intelligence",
		willpower: "CHARACTERISTIC.Willpower",
		fellowship: "CHARACTERISTIC.Fellowship",
		varies: "CHARACTERISTIC.Varies"
	},
	conditionDurations: {
		brief: "CONDITION.DURATION.Brief",
		dependent: "CONDITION.DURATION.Dependent",
		lingering: "CONDITION.DURATION.Lingering"
	},
	dice: {
		icons: {
			challenge: "systems/wfrp3e/assets/icons/dice/challenge.webp",
			characteristic: "systems/wfrp3e/assets/icons/dice/characteristic.webp",
			conservative: "systems/wfrp3e/assets/icons/dice/conservative.webp",
			expertise: "systems/wfrp3e/assets/icons/dice/expertise.webp",
			fortune: "systems/wfrp3e/assets/icons/dice/fortune.webp",
			misfortune: "systems/wfrp3e/assets/icons/dice/misfortune.webp",
			reckless: "systems/wfrp3e/assets/icons/dice/reckless.webp"
		},
		symbols: {
			successes: {
				name: "ROLL.SYMBOL.Successes",
				result: "ROLL.AMOUNT.Successes",
				cssClass: "success",
			},
			righteousSuccesses: {
				name: "ROLL.SYMBOL.RighteousSuccesses",
				result: "ROLL.AMOUNT.RighteousSuccesses",
				cssClass: "righteous-success"
			},
			boons: {
				name: "ROLL.SYMBOL.Boons",
				result: "ROLL.AMOUNT.Boons",
				cssClass: "boon"
			},
			sigmarsComets: {
				name: "ROLL.SYMBOL.SigmarsComets",
				result: "ROLL.AMOUNT.SigmarsComets",
				cssClass: "sigmars-comet"
			},
			challenges: {
				name: "ROLL.SYMBOL.Challenges",
				result: "ROLL.AMOUNT.Challenges",
				cssClass: "challenge"
			},
			banes: {
				name: "ROLL.SYMBOL.Banes",
				result: "ROLL.AMOUNT.Banes",
				cssClass: "bane"
			},
			chaosStars: {
				name: "ROLL.SYMBOL.ChaosStars",
				result: "ROLL.AMOUNT.ChaosStars",
				cssClass: "chaos-star"
			},
			delays: {
				name: "ROLL.SYMBOL.Delays",
				result: "ROLL.AMOUNT.Delays",
				cssClass: "delay"
			},
			exertions: {
				name: "ROLL.SYMBOL.Exertions",
				result: "ROLL.AMOUNT.Exertions",
				cssClass: "exertion"
			}
		},
		results: {
			challenge: {
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
			},
			characteristic: {
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
			},
			conservative: {
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
			expertise: {
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
			fortune: {
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
			misfortune: {
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
			reckless: {
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
		}
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
	effectSymbols: ["success", "boon", "sigmarsComet", "bane", "chaosStar"],
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
			"blackpowder": "WEAPON.GROUP.Blackpowder",
			"bow": "WEAPON.GROUP.Bow",
			"cavalry": "WEAPON.GROUP.Cavalry",
			"crossbow": "WEAPON.GROUP.Crossbow",
			"fencing": "WEAPON.GROUP.Fencing",
			"flail": "WEAPON.GROUP.Flail",
			"great_weapon": "WEAPON.GROUP.GreatWeapon",
			"ordinary": "WEAPON.GROUP.Ordinary",
			"polearm": "WEAPON.GROUP.Polearm",
			"sling": "WEAPON.GROUP.Sling",
			"spear": "WEAPON.GROUP.Spear",
			"staff": "WEAPON.GROUP.Staff",
			"thrown": "WEAPON.GROUP.Thrown",
			"unarmed": "WEAPON.GROUP.Unarmed"
		},
		ranges: {
			"close": "WEAPON.RANGE.Close",
			"medium": "WEAPON.RANGE.Medium",
			"long": "WEAPON.RANGE.Long",
			"extreme": "WEAPON.RANGE.Extreme"
		}
	}
};