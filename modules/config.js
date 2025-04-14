export const WFRP3e = {
	actionTypes: {
		melee: "ACTION.TYPES.melee",
		ranged: "ACTION.TYPES.ranged",
		support: "ACTION.TYPES.support",
		blessing: "ACTION.TYPES.blessing",
		spell: "ACTION.TYPES.spell"
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
			name: "CHARACTERISTICS.strength.name",
			abbreviation: "CHARACTERISTICS.strength.abbreviation",
			type: "physical"
		},
		toughness: {
			name: "CHARACTERISTICS.toughness.name",
			abbreviation: "CHARACTERISTICS.toughness.abbreviation",
			type: "physical"
		},
		agility: {
			name: "CHARACTERISTICS.agility.name",
			abbreviation: "CHARACTERISTICS.agility.abbreviation",
			type: "physical"
		},
		intelligence: {
			name: "CHARACTERISTICS.intelligence.name",
			abbreviation: "CHARACTERISTICS.intelligence.abbreviation",
			type: "mental"
		},
		willpower: {
			name: "CHARACTERISTICS.willpower.name",
			abbreviation: "CHARACTERISTICS.willpower.abbreviation",
			type: "mental"
		},
		fellowship: {
			name: "CHARACTERISTICS.fellowship.name",
			abbreviation: "CHARACTERISTICS.fellowship.abbreviation",
			type: "mental"
		},
		varies: {
			name: "CHARACTERISTICS.varies.name",
			abbreviation: "CHARACTERISTICS.varies.abbreviation"
		}
	},
	challengeLevels: {
		simple: {
			challengeDice: 0,
			name: "CHALLENGELEVEL.simple"
		},
		easy: {
			challengeDice: 1,
			name: "CHALLENGELEVEL.easy"
		},
		average: {
			challengeDice: 2,
			name: "CHALLENGELEVEL.average"
		},
		hard: {
			challengeDice: 3,
			name: "CHALLENGELEVEL.hard"
		},
		daunting: {
			challengeDice: 4,
			name: "CHALLENGELEVEL.daunting"
		},
		heroic: {
			challengeDice: 5,
			name: "CHALLENGELEVEL.heroic"
		}
	},
	conditionDurations: {
		brief: "CONDITION.DURATIONS.brief",
		dependent: "CONDITION.DURATIONS.dependent",
		lingering: "CONDITION.DURATIONS.lingering"
	},
	dice: {
		characteristic: {
			amount: "DIE.AMOUNT.characteristicDice",
			icon: "systems/wfrp3e/assets/icons/dice/characteristic.webp",
			results: {
				1: {
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.oneSuccess",
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
					label: "ROLL.RESULTS.oneSuccess",
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
					label: "ROLL.RESULTS.oneSuccess",
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
					label: "ROLL.RESULTS.oneSuccess",
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
					label: "ROLL.RESULTS.oneBoon",
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
					label: "ROLL.RESULTS.oneBoon",
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
			amount: "DIE.AMOUNT.fortuneDice",
			icon: "systems/wfrp3e/assets/icons/dice/fortune.webp",
			results: {
				1: {
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.oneSuccess",
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
					label: "ROLL.RESULTS.oneSuccess",
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
					label: "ROLL.RESULTS.oneBoon",
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
			amount: "DIE.AMOUNT.expertiseDice",
			icon: "systems/wfrp3e/assets/icons/dice/expertise.webp",
			results: {
				1: {
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.oneSuccess",
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
					label: "ROLL.RESULTS.oneRighteousSuccess",
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
					label: "ROLL.RESULTS.oneBoon",
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
					label: "ROLL.RESULTS.oneBoon",
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
					label: "ROLL.RESULTS.oneSigmarsComet",
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
			amount: "DIE.AMOUNT.conservativeDice",
			icon: "systems/wfrp3e/assets/icons/dice/conservative.webp",
			results: {
				1: {
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.oneSuccess",
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
					label: "ROLL.RESULTS.oneSuccess",
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
					label: "ROLL.RESULTS.oneSuccess",
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
					label: "ROLL.RESULTS.oneSuccess",
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
					label: "ROLL.RESULTS.oneBoon",
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
					label: "ROLL.RESULTS.oneBoon",
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
					label: "ROLL.RESULTS.oneSuccessOneBoon",
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
					label: "ROLL.RESULTS.oneSuccessOneDelay",
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
					label: "ROLL.RESULTS.oneSuccessOneDelay",
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
			amount: "DIE.AMOUNT.recklessDice",
			icon: "systems/wfrp3e/assets/icons/dice/reckless.webp",
			results: {
				1: {
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.twoSuccesses",
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
					label: "ROLL.RESULTS.twoSuccesses",
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
					label: "ROLL.RESULTS.oneSuccessOneBoon",
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
					label: "ROLL.RESULTS.twoBoons",
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
					label: "ROLL.RESULTS.oneBane",
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
					label: "ROLL.RESULTS.oneBane",
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
					label: "ROLL.RESULTS.oneSuccessOneExertion",
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
					label: "ROLL.RESULTS.oneSuccessOneExertion",
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
			amount: "DIE.AMOUNT.challengeDice",
			icon: "systems/wfrp3e/assets/icons/dice/challenge.webp",
			results: {
				1: {
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.oneChallenge",
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
					label: "ROLL.RESULTS.oneChallenge",
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
					label: "ROLL.RESULTS.twoChallenges",
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
					label: "ROLL.RESULTS.twoChallenges",
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
					label: "ROLL.RESULTS.oneBane",
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
					label: "ROLL.RESULTS.twoBanes",
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
					label: "ROLL.RESULTS.oneChaosStar",
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
			amount: "DIE.AMOUNT.misfortuneDice",
			icon: "systems/wfrp3e/assets/icons/dice/misfortune.webp",
			results: {
				1: {
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.blank",
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
					label: "ROLL.RESULTS.oneChallenge",
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
					label: "ROLL.RESULTS.oneChallenge",
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
					label: "ROLL.RESULTS.oneBane",
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
				description: "DISEASE.SYMPTOMS.delirium.description",
				name: "DISEASE.SYMPTOMS.delirium.name"
			},
			fever: {
				description: "DISEASE.SYMPTOMS.fever.description",
				name: "DISEASE.SYMPTOMS.fever.name"
			},
			infectious: {
				description: "DISEASE.SYMPTOMS.infectious.description",
				name: "DISEASE.SYMPTOMS.infectious.name"
			},
			lethal: {
				description: "DISEASE.SYMPTOMS.lethal.description",
				name: "DISEASE.SYMPTOMS.lethal.name"
			},
			painful: {
				description: "DISEASE.SYMPTOMS.painful.description",
				name: "DISEASE.SYMPTOMS.painful.name"
			},
			tiring: {
				description: "DISEASE.SYMPTOMS.tiring.description",
				name: "DISEASE.SYMPTOMS.tiring.name"
			},
			virulent: {
				description: "DISEASE.SYMPTOMS.virulent.description",
				name: "DISEASE.SYMPTOMS.virulent.name"
			},
			weary: {
				description: "DISEASE.SYMPTOMS.weary.description",
				name: "DISEASE.SYMPTOMS.weary.name"
			}
		}
	},
	encounterTypes: {
		combat: "ENCOUNTER.Combat",
		social: "ENCOUNTER.Social"
	},
	rarities: {
		abundant: "TRAPPING.RARITIES.abundant",
		plentiful: "TRAPPING.RARITIES.plentiful",
		common: "TRAPPING.RARITIES.common",
		rare: "TRAPPING.RARITIES.rare",
		exotic: "TRAPPING.RARITIES.exotic"
	},
	scriptTypes: {
		onCareerSocket: "SCRIPT.TYPES.onCareerSocket",
		onCheckPreparation: "SCRIPT.TYPES.onCheckPreparation",
		onCheckRoll: "SCRIPT.TYPES.onCheckRoll",
		onPostCheckTrigger: "SCRIPT.TYPES.onPostCheckTrigger",
		onPreCheckTrigger: "SCRIPT.TYPES.onPreCheckTrigger",
		onTargettingCheckPreparation: "SCRIPT.TYPES.onTargettingCheckPreparation",
		onTrigger: "SCRIPT.TYPES.onTrigger"
	},
	stances: {
		conservative: "STANCES.conservative",
		reckless: "STANCES.reckless"
	},
	symbols: {
		success: {
			cssClass: "success",
			name: "SYMBOL.NAMES.successes",
			plural: "successes",
			result: "SYMBOL.AMOUNT.successes"
		},
		righteousSuccess: {
			cssClass: "righteous-success",
			name: "SYMBOL.NAMES.righteousSuccesses",
			plural: "righteousSuccesses",
			result: "SYMBOL.AMOUNT.righteousSuccesses"
		},
		boon: {
			cssClass: "boon",
			name: "SYMBOL.NAMES.boons",
			plural: "boons",
			result: "SYMBOL.AMOUNT.boons"
		},
		sigmarsComet: {
			cssClass: "sigmars-comet",
			name: "SYMBOL.NAMES.sigmarsComets",
			plural: "sigmarsComets",
			result: "SYMBOL.AMOUNT.sigmarsComets"
		},
		challenge: {
			cssClass: "challenge",
			name: "SYMBOL.NAMES.challenges",
			plural: "challenges",
			result: "SYMBOL.AMOUNT.challenges"
		},
		bane: {
			cssClass: "bane",
			name: "SYMBOL.NAMES.banes",
			plural: "banes",
			result: "SYMBOL.AMOUNT.banes"
		},
		chaosStar: {
			cssClass: "chaos-star",
			name: "SYMBOL.NAMES.chaosStars",
			plural: "chaosStars",
			result: "SYMBOL.AMOUNT.chaosStars"
		},
		delay: {
			cssClass: "delay",
			name: "SYMBOL.NAMES.delays",
			plural: "delays",
			result: "SYMBOL.AMOUNT.delays"
		},
		exertion: {
			cssClass: "exertion",
			name: "SYMBOL.NAMES.exertions",
			plural: "exertions",
			result: "SYMBOL.AMOUNT.exertions"
		}
	},
	talentTypes: {
		focus: "TALENT.TYPES.focus",
		reputation: "TALENT.TYPES.reputation",
		tactic: "TALENT.TYPES.tactic",
		faith: "TALENT.TYPES.faith",
		order: "TALENT.TYPES.order",
		tricks: "TALENT.TYPES.tricks"
	},
	weapon: {
		commonWeapons: {
			improvised: {
				id: "improvised",
				name: "WEAPON.improvised",
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
				name: "WEAPON.improvisedWeapon",
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
				name: "WEAPON.unarmed",
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
				name: "WEAPON.GROUPS.blackpowder",
				type: "ranged"
			},
			bow: {
				name: "WEAPON.GROUPS.bow",
				type: "ranged"
			},
			cavalry: {
				name: "WEAPON.GROUPS.cavalry",
				type: "melee"
			},
			crossbow: {
				name: "WEAPON.GROUPS.crossbow",
				type: "ranged"
			},
			fencing: {
				name: "WEAPON.GROUPS.fencing",
				type: "melee"
			},
			flail: {
				name: "WEAPON.GROUPS.flail",
				type: "melee"
			},
			greatWeapon: {
				name: "WEAPON.GROUPS.greatWeapon",
				type: "melee"
			},
			ordinary: {
				name: "WEAPON.GROUPS.ordinary",
				type: "melee"
			},
			polearm: {
				name: "WEAPON.GROUPS.polearm",
				type: "melee"
			},
			sling: {
				name: "WEAPON.GROUPS.sling",
				type: "ranged"
			},
			spear: {
				name: "WEAPON.GROUPS.spear",
				type: "melee"
			},
			staff: {
				name: "WEAPON.GROUPS.staff",
				type: "melee"
			},
			thrown: {
				name: "WEAPON.GROUPS.thrown",
				type: "ranged"
			},
			unarmed: {
				name: "WEAPON.GROUPS.unarmed",
				type: "melee"
			}
		},
		qualities: {
			attuned: "WEAPON.QUALITIES.attuned",
			blast: "WEAPON.QUALITIES.blast",
			defensive: "WEAPON.QUALITIES.defensive",
			entangling: "WEAPON.QUALITIES.entangling",
			fast: "WEAPON.QUALITIES.fast",
			pierce: "WEAPON.QUALITIES.pierce",
			reload: "WEAPON.QUALITIES.reload",
			slow: "WEAPON.QUALITIES.slow",
			thrown: "WEAPON.QUALITIES.thrown",
			twohanded: "WEAPON.QUALITIES.twoHanded",
			unreliable: "WEAPON.QUALITIES.unreliable",
			vicious: "WEAPON.QUALITIES.vicious"
		},
		ranges: {
			close: "WEAPON.RANGES.close",
			medium: "WEAPON.RANGES.medium",
			long: "WEAPON.RANGES.long",
			extreme: "WEAPON.RANGES.extreme"
		}
	}
};