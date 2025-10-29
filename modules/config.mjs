export const WFRP3e = Object.freeze({
	actionTypes: {
		melee: "ACTION.TYPES.melee",
		ranged: "ACTION.TYPES.ranged",
		support: "ACTION.TYPES.support",
		blessing: "ACTION.TYPES.blessing",
		spell: "ACTION.TYPES.spell"
	},
	availableRaces: {
		human: {
			art: "systems/wfrp3e/assets/images/races/empire.webp",
			creationPoints: 25,
			defaultRatings: {
				strength: 2,
				toughness: 2,
				agility: 2,
				intelligence: 2,
				willpower: 2,
				fellowship: 2
			},
			name: "RACE.human",
			origins: {
				reiklander: {
					abilities: [
						"Compendium.wfrp3e.items.Item.vsdlb2SFSFDnt4r6",
						"Compendium.wfrp3e.items.Item.gToY5Bonw9mAVzkU",
						"Compendium.wfrp3e.items.Item.ppkk6UNuhTnGqrY6"
					],
					art: "systems/wfrp3e/assets/images/races/empire.webp",
					corruption: 5,
					introduction: "ORIGIN.reiklander.introduction",
					name: "ORIGIN.reiklander.name",
					wound: 9
				}
			},
			startingCareerRollTableUuid: "Compendium.wfrp3e.roll-tables.PoY76It3s6IkTr3g"
		},
		dwarf: {
			art: "systems/wfrp3e/assets/images/races/dwarf.webp",
			creationPoints: 20,
			defaultRatings: {
				strength: 3,
				toughness: 3,
				agility: 2,
				intelligence: 2,
				willpower: 2,
				fellowship: 2
			},
			name: "RACE.dwarf",
			origins: {
				karakAzgaraz: {
					abilities: [
						"Compendium.wfrp3e.items.Item.1LsUZDU1mnADiZyh",
						"Compendium.wfrp3e.items.Item.ATznsFp414qzofcJ",
						"Compendium.wfrp3e.items.Item.5zLg7T9FTNvgtJp1",
						"Compendium.wfrp3e.items.Item.VHiON3EQ7VMe41jT"
					],
					art: "systems/wfrp3e/assets/images/races/dwarf.webp",
					corruption: 10,
					introduction: "ORIGIN.karakAzgaraz.introduction",
					name: "ORIGIN.karakAzgaraz.name",
					wound: 10
				}
			},
			startingCareerRollTableUuid: "Compendium.wfrp3e.roll-tables.RollTable.Clr8Gwsfs7VkMFjd"
		},
		highElf: {
			art: "systems/wfrp3e/assets/images/races/high_elf.webp",
			creationPoints: 20,
			defaultRatings: {
				strength: 2,
				toughness: 2,
				agility: 3,
				intelligence: 3,
				willpower: 2,
				fellowship: 2
			},
			name: "RACE.highElf",
			origins: {
				ulthuan: {
					abilities: [
						"Compendium.wfrp3e.items.Item.tJc6iH8pOllVO9Go",
						"Compendium.wfrp3e.items.Item.h0pAI8aricmNHCke",
						"Compendium.wfrp3e.items.Item.zvzzGw8UBrM5GNfL",
						"Compendium.wfrp3e.items.Item.VHiON3EQ7VMe41jT"
					],
					art: "systems/wfrp3e/assets/images/races/high_elf.webp",
					corruption: 10,
					introduction: "ORIGIN.ulthuan.introduction",
					name: "ORIGIN.ulthuan.name",
					wound: 8
				}
			},
			startingCareerRollTableUuid: "Compendium.wfrp3e.roll-tables.tJU9IvQGkcIIBPce"
		},
		woodElf: {
			art: "systems/wfrp3e/assets/images/races/wood_elf.webp",
			creationPoints: 20,
			defaultRatings: {
				strength: 2,
				toughness: 2,
				agility: 3,
				intelligence: 2,
				willpower: 3,
				fellowship: 2
			},
			name: "RACE.woodElf",
			origins: {
				athelLoren: {
					abilities: [
						"Compendium.wfrp3e.items.Item.0MdYpo3lvvLgPwvZ",
						"Compendium.wfrp3e.items.Item.MFNBzJvfpOsp2G3z",
						"Compendium.wfrp3e.items.Item.djj9tirxRkjnPrBp",
						"Compendium.wfrp3e.items.Item.VHiON3EQ7VMe41jT"
					],
					art: "systems/wfrp3e/assets/images/races/wood_elf.webp",
					corruption: 10,
					introduction: "ORIGIN.athelLoren.introduction",
					name: "ORIGIN.athelLoren.name",
					wound: 8
				}
			},
			startingCareerRollTableUuid: "Compendium.wfrp3e.roll-tables.DuENZYjzQuelc4Yl"
		}
	},
	attributes: {
		aggression: {
			name: "CREATURE.FIELDS.attributes.FIELDS.aggression.label",
			abbreviation: "CREATURE.FIELDS.attributes.FIELDS.aggression.abbreviation"
		},
		cunning: {
			name: "CREATURE.FIELDS.attributes.FIELDS.cunning.label",
			abbreviation: "CREATURE.FIELDS.attributes.FIELDS.cunning.abbreviation"
		},
		expertise: {
			name: "CREATURE.FIELDS.attributes.FIELDS.expertise.label",
			abbreviation: "CREATURE.FIELDS.attributes.FIELDS.expertise.abbreviation"
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
	characteristics: {
		strength: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.strength.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.strength.abbreviation",
			type: "physical"
		},
		toughness: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.toughness.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.toughness.abbreviation",
			type: "physical"
		},
		agility: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.agility.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.agility.abbreviation",
			type: "physical"
		},
		intelligence: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.intelligence.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.intelligence.abbreviation",
			type: "mental"
		},
		willpower: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.willpower.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.willpower.abbreviation",
			type: "mental"
		},
		fellowship: {
			name: "ACTOR.FIELDS.characteristics.FIELDS.fellowship.label",
			abbreviation: "ACTOR.FIELDS.characteristics.FIELDS.fellowship.abbreviation",
			type: "mental"
		}
	},
	conditionDurations: {
		brief: "CONDITION.DURATIONS.brief",
		dependent: "CONDITION.DURATIONS.dependent",
		lingering: "CONDITION.DURATIONS.lingering"
	},
	creationPointInvestments: {
		actionCards: [{
			name: "CREATIONPOINTINVESTOR.ACTIONCARDS.CHOICES.one",
			size: 1,
			value: 0
		}, {
			name: "CREATIONPOINTINVESTOR.ACTIONCARDS.CHOICES.two",
			size: 2,
			value: 1
		}, {
			name: "CREATIONPOINTINVESTOR.ACTIONCARDS.CHOICES.three",
			size: 3,
			value: 2
		}, {
			name: "CREATIONPOINTINVESTOR.ACTIONCARDS.CHOICES.four",
			size: 4,
			value: 3
		}],
		skills: [{
			name: "CREATIONPOINTINVESTOR.SKILLS.CHOICES.one",
			size: 1,
			specialisationSize: 0,
			value: 0
		}, {
			name: "CREATIONPOINTINVESTOR.SKILLS.CHOICES.two",
			size: 2,
			specialisationSize: 0,
			value: 1
		}, {
			name: "CREATIONPOINTINVESTOR.SKILLS.CHOICES.threePlusOneSpecialisation",
			size: 3,
			specialisationSize: 1,
			value: 2
		}, {
			name: "CREATIONPOINTINVESTOR.SKILLS.CHOICES.fourPlusTwoSpecialisations",
			size: 4,
			specialisationSize: 2,
			value: 3
		}],
		talents: [{
			name: "CREATIONPOINTINVESTOR.TALENTS.CHOICES.zero",
			size: 0,
			value: 0
		}, {
			name: "CREATIONPOINTINVESTOR.TALENTS.CHOICES.one",
			size: 1,
			value: 1
		}, {
			name: "CREATIONPOINTINVESTOR.TALENTS.CHOICES.two",
			size: 2,
			value: 2
		}, {
			name: "CREATIONPOINTINVESTOR.TALENTS.CHOICES.three",
			size: 3,
			value: 3
		}],
		wealth: [{
			name: "CREATIONPOINTINVESTOR.WEALTH.CHOICES.broke",
			value: 0
		}, {
			name: "CREATIONPOINTINVESTOR.WEALTH.CHOICES.poor",
			value: 1
		}, {
			name: "CREATIONPOINTINVESTOR.WEALTH.CHOICES.comfortable",
			value: 2
		}, {
			name: "CREATIONPOINTINVESTOR.WEALTH.CHOICES.affluent",
			value: 3
		}]
	},
	dice: {
		characteristic: {
			amount: "DIE.characteristic.amount",
			name: "DIE.characteristic.name",
			icon: "systems/wfrp3e/assets/icons/dice/characteristic.webp",
			plural: "DIE.characteristic.plural",
			results: {
				1: {
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.oneSuccess",
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
					label: "DIE.RESULTS.oneSuccess",
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
					label: "DIE.RESULTS.oneSuccess",
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
					label: "DIE.RESULTS.oneSuccess",
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
					label: "DIE.RESULTS.oneBoon",
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
					label: "DIE.RESULTS.oneBoon",
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
			amount: "DIE.fortune.amount",
			name: "DIE.fortune.name",
			icon: "systems/wfrp3e/assets/icons/dice/fortune.webp",
			plural: "DIE.fortune.plural",
			results: {
				1: {
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.oneSuccess",
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
					label: "DIE.RESULTS.oneSuccess",
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
					label: "DIE.RESULTS.oneBoon",
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
			amount: "DIE.expertise.amount",
			name: "DIE.expertise.name",
			icon: "systems/wfrp3e/assets/icons/dice/expertise.webp",
			plural: "DIE.expertise.plural",
			results: {
				1: {
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.oneSuccess",
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
					label: "DIE.RESULTS.oneRighteousSuccess",
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
					label: "DIE.RESULTS.oneBoon",
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
					label: "DIE.RESULTS.oneBoon",
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
					label: "DIE.RESULTS.oneSigmarsComet",
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
			amount: "DIE.conservative.amount",
			name: "DIE.conservative.name",
			icon: "systems/wfrp3e/assets/icons/dice/conservative.webp",
			plural: "DIE.conservative.plural",
			results: {
				1: {
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.oneSuccess",
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
					label: "DIE.RESULTS.oneSuccess",
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
					label: "DIE.RESULTS.oneSuccess",
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
					label: "DIE.RESULTS.oneSuccess",
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
					label: "DIE.RESULTS.oneBoon",
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
					label: "DIE.RESULTS.oneBoon",
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
					label: "DIE.RESULTS.oneSuccessOneBoon",
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
					label: "DIE.RESULTS.oneSuccessOneDelay",
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
					label: "DIE.RESULTS.oneSuccessOneDelay",
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
			amount: "DIE.reckless.amount",
			name: "DIE.reckless.name",
			icon: "systems/wfrp3e/assets/icons/dice/reckless.webp",
			plural: "DIE.reckless.plural",
			results: {
				1: {
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.twoSuccesses",
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
					label: "DIE.RESULTS.twoSuccesses",
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
					label: "DIE.RESULTS.oneSuccessOneBoon",
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
					label: "DIE.RESULTS.twoBoons",
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
					label: "DIE.RESULTS.oneBane",
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
					label: "DIE.RESULTS.oneBane",
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
					label: "DIE.RESULTS.oneSuccessOneExertion",
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
					label: "DIE.RESULTS.oneSuccessOneExertion",
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
			amount: "DIE.challenge.amount",
			name: "DIE.challenge.name",
			icon: "systems/wfrp3e/assets/icons/dice/challenge.webp",
			plural: "DIE.challenge.plural",
			results: {
				1: {
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.oneChallenge",
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
					label: "DIE.RESULTS.oneChallenge",
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
					label: "DIE.RESULTS.twoChallenges",
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
					label: "DIE.RESULTS.twoChallenges",
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
					label: "DIE.RESULTS.oneBane",
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
					label: "DIE.RESULTS.twoBanes",
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
					label: "DIE.RESULTS.oneChaosStar",
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
			amount: "DIE.misfortune.amount",
			name: "DIE.misfortune.name",
			icon: "systems/wfrp3e/assets/icons/dice/misfortune.webp",
			plural: "DIE.misfortune.plural",
			results: {
				1: {
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.blank",
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
					label: "DIE.RESULTS.oneChallenge",
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
					label: "DIE.RESULTS.oneChallenge",
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
					label: "DIE.RESULTS.oneBane",
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
		combat: {
			characteristic: "agility",
			name: "COMBAT.TYPES.combat"
		},
		social: {
			characteristic: "fellowship",
			name: "COMBAT.TYPES.social"
		}
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
		onCreationPointInvestment: "SCRIPT.TYPES.onCreationPointInvestment",
		onPostCheckTrigger: "SCRIPT.TYPES.onPostCheckTrigger",
		onPreCheckTrigger: "SCRIPT.TYPES.onPreCheckTrigger",
		onStartingSkillTrainingSelection: "SCRIPT.TYPES.onStartingSkillTrainingSelection",
		onStartingTalentSelection: "SCRIPT.TYPES.onStartingTalentSelection",
		onTargetingCheckPreparation: "SCRIPT.TYPES.onTargetingCheckPreparation",
		onTrigger: "SCRIPT.TYPES.onTrigger",
		requirementCheck: "SCRIPT.TYPES.requirementCheck"
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
			result: "SYMBOL.AMOUNT.successes",
			type: "positive"
		},
		righteousSuccess: {
			cssClass: "righteous-success",
			name: "SYMBOL.NAMES.righteousSuccesses",
			plural: "righteousSuccesses",
			result: "SYMBOL.AMOUNT.righteousSuccesses",
			type: "positive"
		},
		boon: {
			cssClass: "boon",
			name: "SYMBOL.NAMES.boons",
			plural: "boons",
			result: "SYMBOL.AMOUNT.boons",
			type: "positive"
		},
		sigmarsComet: {
			cssClass: "sigmars-comet",
			name: "SYMBOL.NAMES.sigmarsComets",
			plural: "sigmarsComets",
			result: "SYMBOL.AMOUNT.sigmarsComets",
			type: "positive"
		},
		challenge: {
			cssClass: "challenge",
			name: "SYMBOL.NAMES.challenges",
			plural: "challenges",
			result: "SYMBOL.AMOUNT.challenges",
			type: "negative"
		},
		bane: {
			cssClass: "bane",
			name: "SYMBOL.NAMES.banes",
			plural: "banes",
			result: "SYMBOL.AMOUNT.banes",
			type: "negative"
		},
		chaosStar: {
			cssClass: "chaos-star",
			name: "SYMBOL.NAMES.chaosStars",
			plural: "chaosStars",
			result: "SYMBOL.AMOUNT.chaosStars",
			type: "negative"
		},
		delay: {
			cssClass: "delay",
			name: "SYMBOL.NAMES.delays",
			plural: "delays",
			result: "SYMBOL.AMOUNT.delays",
			type: "negative"
		},
		exertion: {
			cssClass: "exertion",
			name: "SYMBOL.NAMES.exertions",
			plural: "exertions",
			result: "SYMBOL.AMOUNT.exertions",
			type: "negative"
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
			twoHanded: "WEAPON.QUALITIES.twoHanded",
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
});

CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([{
	pattern : /\{D([a-zA-Z]+)}/gmi,
	enricher : (match, options) => {
		const icon = document.createElement("span");
		icon.classList.add("wfrp3e-font", "dice");

		if(new RegExp("^char", "i").test(match[1]))
			icon.classList.add("characteristic");
		else if(new RegExp("^chal", "i").test(match[1]))
			icon.classList.add("challenge");
		else if(new RegExp("^co", "i").test(match[1]))
			icon.classList.add("conservative");
		else if(new RegExp("^f", "i").test(match[1]))
			icon.classList.add("fortune");
		else if(new RegExp("^e", "i").test(match[1]))
			icon.classList.add("expertise");
		else if(new RegExp("^m", "i").test(match[1]))
			icon.classList.add("misfortune");
		else if(new RegExp("^r", "i").test(match[1]))
			icon.classList.add("reckless");

		return icon;
	}
}, {
	pattern : /\{S([a-zA-Z]+)}/gmi,
	enricher : (match, options) => {
		const icon = document.createElement("span");
		icon.classList.add("wfrp3e-font", "symbol");

		if(new RegExp("^bo", "i").test(match[1]))
			icon.classList.add("boon");
		else if(new RegExp("^ba", "i").test(match[1]))
			icon.classList.add("bane");
		else if(new RegExp("^ch", "i").test(match[1]))
			icon.classList.add("challenge");
		else if(new RegExp("^[cs][chao]", "i").test(match[1]))
			icon.classList.add("chaos-star");
		else if(new RegExp("^d", "i").test(match[1]))
			icon.classList.add("delay");
		else if(new RegExp("^e", "i").test(match[1]))
			icon.classList.add("exertion");
		else if(new RegExp("^[rs][ri]", "i").test(match[1]))
			icon.classList.add("righteous-success");
		else if(new RegExp("^su", "i").test(match[1]))
			icon.classList.add("success");
		else if(new RegExp("^[sc][si]", "i").test(match[1]))
			icon.classList.add("sigmars-comet");

		return icon;
	}
}]);
