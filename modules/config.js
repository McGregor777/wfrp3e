export const WFRP3e = {
	actionTypes: {
		melee: "ACTION.TYPE.Melee",
		ranged: "ACTION.TYPE.Ranged",
		support: "ACTION.TYPE.Support",
		blessing: "ACTION.TYPE.Blessing",
		spell: "ACTION.TYPE.Spell"
	},
	availableRaces: {
		human: {
			creationPoints: 25,
			defaultRatings: {
				strength: 2,
				toughness: 2,
				agility: 2,
				intelligence: 2,
				willpower: 2,
				fellowship: 2
			},
			name: "RACE.Human",
			origins: {
				reiklander: {
					abilities: ["Adaptable", "Diversity", "Favoured by Fate"],
					wound: 9,
					corruption: 5,
					name: "ORIGIN.Reiklander",
					introduction: "ORIGIN.INTRODUCTION.Reiklander",
					startingCareerRollTableId: "PoY76It3s6IkTr3g",
					art: "systems/wfrp3e/assets/images/races/empire.webp"
				}
			}
		},
		dwarf: {
			creationPoints: 20,
			defaultRatings: {
				strength: 3,
				toughness: 3,
				agility: 2,
				intelligence: 2,
				willpower: 2,
				fellowship: 2
			},
			name: "RACE.Dwarf",
			origins: {
				karakAzgaraz: {
					abilities: ["Children of Grungni", "Grudge", "Sturdy", "Night Vision"],
					wound: 10,
					corruption: 10,
					name: "ORIGIN.KarakAzgaraz",
					introduction: "ORIGIN.INTRODUCTION.KarakAzgaraz",
					startingCareerRollTableId: "Clr8Gwsfs7VkMFjd",
					art: "systems/wfrp3e/assets/images/races/dwarf.webp"
				}
			}
		},
		highElf: {
			creationPoints: 20,
			defaultRatings: {
				strength: 2,
				toughness: 2,
				agility: 3,
				intelligence: 3,
				willpower: 2,
				fellowship: 2
			},
			name: "RACE.HighElf",
			origins: {
				ulthuan: {
					abilities: ["Composure", "Erudite", "Isha's Chosen", "Night Vision"],
					wound: 8,
					corruption: 10,
					name: "ORIGIN.Ulthuan",
					introduction: "ORIGIN.INTRODUCTION.Ulthuan",
					startingCareerRollTableId: "tJU9IvQGkcIIBPce",
					art: "systems/wfrp3e/assets/images/races/high_elf.webp"
				}
			}
		},
		woodElf: {
			creationPoints: 20,
			defaultRatings: {
				strength: 2,
				toughness: 2,
				agility: 3,
				intelligence: 2,
				willpower: 3,
				fellowship: 2
			},
			name: "RACE.WoodElf",
			origins: {
				athelLoren: {
					abilities: ["Forest Walk", "Nature Bond", "Orion's Favoured", "Night Vision"],
					wound: 8,
					corruption: 10,
					name: "ORIGIN.AthelLoren",
					introduction: "ORIGIN.INTRODUCTION.AthelLoren",
					startingCareerRollTableId: "DuENZYjzQuelc4Yl",
					art: "systems/wfrp3e/assets/images/races/wood_elf.webp"
				}
			}
		}
	},
	attributes: {
		aggression: {
			name: "ATTRIBUTE.Aggression",
			abbreviation: "ATTRIBUTE.ABBREVIATION.Aggression"
		},
		cunning: {
			name: "ATTRIBUTE.Cunning",
			abbreviation: "ATTRIBUTE.ABBREVIATION.Cunning"
		},
		expertise: {
			name: "ATTRIBUTE.Expertise",
			abbreviation: "ATTRIBUTE.ABBREVIATION.Expertise"
		}
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
		}
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
		},
		heroic: {
			challengeDice: 5,
			name: "ROLL.CHALLENGELEVEL.Heroic"
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
				},
				2: {
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
				},
				3: {
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
				},
				4: {
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
				},
				5: {
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
				},
				6: {
					label: "ROLL.RESULT.OneBoon",
					image: "systems/wfrp3e/assets/icons/dice/fortune_oneboon.webp",
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
			delirium: {
				description: "DISEASE.SYMPTOM.DESCRIPTION.Delirium",
				name: "DISEASE.SYMPTOM.Delirium"
			},
			fever: {
				description: "DISEASE.SYMPTOM.DESCRIPTION.Fever",
				name: "DISEASE.SYMPTOM.Fever"
			},
			infectious: {
				description: "DISEASE.SYMPTOM.DESCRIPTION.Infectious",
				name: "DISEASE.SYMPTOM.Infectious"
			},
			lethal: {
				description: "DISEASE.SYMPTOM.DESCRIPTION.Lethal",
				name: "DISEASE.SYMPTOM.Lethal"
			},
			painful: {
				description: "DISEASE.SYMPTOM.DESCRIPTION.Painful",
				name: "DISEASE.SYMPTOM.Painful"
			},
			tiring: {
				description: "DISEASE.SYMPTOM.DESCRIPTION.Tiring",
				name: "DISEASE.SYMPTOM.Tiring"
			},
			virulent: {
				description: "DISEASE.SYMPTOM.DESCRIPTION.Virulent",
				name: "DISEASE.SYMPTOM.Virulent"
			},
			weary: {
				description: "DISEASE.SYMPTOM.DESCRIPTION.Weary",
				name: "DISEASE.SYMPTOM.Weary"
			}
		}
	},
	encounterTypes: {
		combat: "ENCOUNTER.Combat",
		social: "ENCOUNTER.Social"
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
			result: "ROLL.AMOUNT.Successes"
		},
		righteousSuccess: {
			cssClass: "righteous-success",
			name: "ROLL.SYMBOL.RighteousSuccesses",
			plural: "righteousSuccesses",
			result: "ROLL.AMOUNT.RighteousSuccesses"
		},
		boon: {
			cssClass: "boon",
			name: "ROLL.SYMBOL.Boons",
			plural: "boons",
			result: "ROLL.AMOUNT.Boons"
		},
		sigmarsComet: {
			cssClass: "sigmars-comet",
			name: "ROLL.SYMBOL.SigmarsComets",
			plural: "sigmarsComets",
			result: "ROLL.AMOUNT.SigmarsComets"
		},
		challenge: {
			cssClass: "challenge",
			name: "ROLL.SYMBOL.Challenges",
			plural: "challenges",
			result: "ROLL.AMOUNT.Challenges"
		},
		bane: {
			cssClass: "bane",
			name: "ROLL.SYMBOL.Banes",
			plural: "banes",
			result: "ROLL.AMOUNT.Banes"
		},
		chaosStar: {
			cssClass: "chaos-star",
			name: "ROLL.SYMBOL.ChaosStars",
			plural: "chaosStars",
			result: "ROLL.AMOUNT.ChaosStars"
		},
		delay: {
			cssClass: "delay",
			name: "ROLL.SYMBOL.Delays",
			plural: "delays",
			result: "ROLL.AMOUNT.Delays"
		},
		exertion: {
			cssClass: "exertion",
			name: "ROLL.SYMBOL.Exertions",
			plural: "exertions",
			result: "ROLL.AMOUNT.Exertions"
		}
	},
	talentTypes: {
		focus: "TALENT.TYPE.Focus",
		reputation: "TALENT.TYPE.Reputation",
		tactic: "TALENT.TYPE.Tactic",
		faith: "TALENT.TYPE.Faith",
		order: "TALENT.TYPE.Order",
		tricks: "TALENT.TYPE.Tricks"
	},
	weapon: {
		commonWeapons: {
			improvised: {
				id: "improvised",
				name: "WEAPON.Improvised",
				system: {
					criticalRating: 4,
					damageRating: 3,
					group: "thrown",
					qualities: ["thrown"],
					range: "close"
				}
			},
			improvisedWeapon: {
				id: "improvisedWeapon",
				name: "WEAPON.ImprovisedWeapon",
				system: {
					criticalRating: 3,
					damageRating: 3,
					group: "ordinary",
					qualities: [],
					range: "close"
				}
			},
			unarmed: {
				id: "unarmed",
				name: "WEAPON.Unarmed",
				system: {
					criticalRating: 4,
					damageRating: 3,
					group: "unarmed",
					qualities: [],
					range: "close"
				}
			}
		},
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
		qualities: {
			attuned: "WEAPON.QUALITY.Attuned",
			blast: "WEAPON.QUALITY.Blast",
			defensive: "WEAPON.QUALITY.Defensive",
			entangling: "WEAPON.QUALITY.Entangling",
			fast: "WEAPON.QUALITY.Fast",
			pierce: "WEAPON.QUALITY.Pierce",
			reload: "WEAPON.QUALITY.Reload",
			slow: "WEAPON.QUALITY.Slow",
			thrown: "WEAPON.QUALITY.Thrown",
			twohanded: "WEAPON.QUALITY.TwoHanded",
			unreliable: "WEAPON.QUALITY.Unreliable",
			vicious: "WEAPON.QUALITY.Vicious"
		},
		ranges: {
			close: "WEAPON.RANGE.Close",
			medium: "WEAPON.RANGE.Medium",
			long: "WEAPON.RANGE.Long",
			extreme: "WEAPON.RANGE.Extreme"
		}
	}
};