export const WFRP3e = Object.freeze({
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
