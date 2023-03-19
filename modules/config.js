export const WFRP3E = {}

WFRP3E.characteristics =
{
	"strength": "Strength",
	"toughness": "Toughness",
	"agility": "Agility",
	"intelligence": "Intelligence",
	"willpower": "Willpower",
	"fellowship": "Fellowship",
	"varies": "Varies"
}

WFRP3E.actionTypes =
{
	"melee": "Melee",
	"ranged": "Ranged",
	"support": "Support",
	"blessing": "Blessing",
	"spell": "Spell"
}

WFRP3E.talentTypes =
{
	"focus": "Focus",
	"reputation": "Reputation",
	"tactic": "Tactic",
	"faith": "Faith",
	"order": "Order",
	"tricks": "Tricks",
	"insanity": "Insanity"
}

WFRP3E.rarities =
{
	"exotic": "Exotic",
	"rare": "Rare",
	"common": "Common",
	"plentiful": "Plentiful",
	"abundant": "Abundant"
}

WFRP3E.weaponGroups =
{
	"blackpowder": "Blackpowder",
	"bow": "Bow",
	"cavalry": "Cavalry",
	"crossbow": "Crossbow",
	"fencing": "Fencing",
	"flail": "Flail",
	"great_weapon": "Great Weapon",
	"ordinary": "Ordinary",
	"polearm": "Polearm",
	"sling": "Sling",
	"spear": "Spear",
	"staff": "Staff",
	"thrown": "Thrown",
	"unarmed": "Unarmed"
}

WFRP3E.ranges =
{
	"close": "Close",
	"medium": "Medium",
	"long": "Long",
	"extreme": "Extreme"
}

WFRP3E.poolResults =
{
	successes: "Successes",
	righteousSuccesses: "Righteous Successes",
	challenges: "Challenges",
	boons: "Boons",
	banes: "Banes",
	delays: "Delays",
	exertions: "Exertions",
	sigmarsComets: "Sigmar's Comets",
	chaosStars: "Chaos Stars",
};

WFRP3E.dice =
{
	icons:
	{
		challenge: "systems/wfrp3e/assets/icons/dice/challenge.webp",
		characteristic: "systems/wfrp3e/assets/icons/dice/characteristic.webp",
		conservative: "systems/wfrp3e/assets/icons/dice/conservative.webp",
		expertise: "systems/wfrp3e/assets/icons/dice/expertise.webp",
		fortune: "systems/wfrp3e/assets/icons/dice/fortune.webp",
		misfortune: "systems/wfrp3e/assets/icons/dice/misfortune.webp",
		reckless: "systems/wfrp3e/assets/icons/dice/reckless.webp"
	},
	results:
	{
		banes: "Roll.Banes",
		boons: "Roll.Boons",
		challenges: "Roll.Challenges",
		chaosStars: "Roll.ChaosStars",
		delays: "Roll.Delays",
		exertions: "Roll.Exertions",
		righteousSuccesses: "Roll.RighteousSuccesses",
		successes: "Roll.Successes",
		sigmarsComets: "Roll.SigmarsComets"
	}
};

WFRP3E.challengeDiceResults =
{
	1:
	{
		label: "Blank",
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
	2:
	{
		label: "One Challenge",
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
	3:
	{
		label: "One Challenge",
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
	4:
	{
		label: "Two Challenges",
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
	5:
	{
		label: "Two Challenges",
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
	6:
	{
		label: "One Bane",
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
	7:
	{
		label: "Two Banes",
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
	8:
	{
		label: "One Chaos Star",
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

WFRP3E.characteristicDiceResults =
{
    1:
	{
		label: "Blank",
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
	2:
	{
		label: "Blank",
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
    3:
	{
		label: "One Success",
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
	4:
	{
		label: "One Success",
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
	5:
	{
		label: "One Success",
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
    6:
	{
		label: "One Success",
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
    7:
	{
		label: "One Boon",
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
    8:
	{
		label: "One Boon",
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
}

WFRP3E.conservativeDiceResults =
{
    1:
	{
		label: "Blank",
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
    2:
	{
		label: "One Success",
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
    3:
	{
		label: "One Success",
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
    4:
	{
		label: "One Success",
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
    5:
	{
		label: "One Success",
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
    6:
	{
		label: "One Boon",
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
	7:
	{
		label: "One Boon",
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
	8:
	{
		label: "One Success One Boon",
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
	9:
	{
		label: "One Success One Delay",
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
	10:
	{
		label: "One Success One Delay",
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
}

WFRP3E.expertiseDiceResults =
{
	1:
	{
		label: "Blank",
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
	2:
	{
		label: "One Success",
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
	3:
	{
		label: "One Righteous Success",
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
	4:
	{
		label: "One Boon",
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
	5:
	{
		label: "One Boon",
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
	6:
	{
		label: "One Sigmar's Comet",
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
}

WFRP3E.fortuneDiceResults =
{
	1:
	{
		label: "Blank",
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
	2:
	{
		label: "Blank",
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
	3:
	{
		label: "Blank",
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
	4:
	{
		label: "One Success",
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
	5:
	{
		label: "One Success",
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
	6:
	{
		label: "One Boon",
		image: "systems/wfrp3e/assets/icons/dice/fortune_oneboon.webp",
		successes: 0,
		righteousSuccesses: 0,
		challenges: 0,
		boons: 1,
		delays: 0,
		exertions: 0,
		sigmarsComets: 0,
		chaosStars: 0
	},
}

WFRP3E.misfortuneDiceResults =
{
    1:
	{
		label: "Blank",
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
    2:
	{
		label: "Blank",
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
    3:
	{
		label: "Blank",
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
    4:
	{
		label: "One Challenge",
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
    5:
	{
		label: "One Challenge",
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
    6:
	{
		label: "One Bane",
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
}

WFRP3E.recklessDiceResults =
{
	1:
	{
		label: "Blank",
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
	2:
	{
		label: "Blank",
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
	3:
	{
		label: "Two Success",
		image: "systems/wfrp3e/assets/icons/dice/reckless_twosuccess.webp",
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
	4:
	{
		label: "Two Success",
		image: "systems/wfrp3e/assets/icons/dice/reckless_twosuccess.webp",
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
	5:
	{
		label: "One Success One Boon",
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
	6:
	{
		label: "Two Boons",
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
	7:
	{
		label: "One Bane",
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
	8:
	{
		label: "One Bane",
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
	9:
	{
		label: "One Success One Exercion",
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
	10:
	{
		label: "One Success One Exercion",
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
}