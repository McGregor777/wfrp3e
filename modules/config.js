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
	"infortunepowder": "Blackpowder",
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
	success: "Success",
	righteousSuccess: "Righteous Success",
	challenge: "Challenge",
	boon: "Boon",
	bane: "Bane",
	delay: "Delay",
	exertion: "Exertion",
	sigmarsComet: "Sigmar's Comet",
	chaosStar: "Chaos Star",
};

WFRP3E.challengeDiceResults =
{
	1:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/challenge.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	2:
	{
		label: "One Challenge",
		image: `systems/wfrp3e/assets/icons/dice/challenge_onechallenge.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 1,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	3:
	{
		label: "One Challenge",
		image: `systems/wfrp3e/assets/icons/dice/challenge_onechallenge.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 1,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	4:
	{
		label: "Two Challenges",
		image: `systems/wfrp3e/assets/icons/dice/challenge_twochallenges.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 2,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	5:
	{
		label: "Two Challenges",
		image: `systems/wfrp3e/assets/icons/dice/challenge_twochallenges.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 2,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	5:
	{
		label: "One Bane",
		image: `systems/wfrp3e/assets/icons/dice/challenge_onebane.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 1,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	6:
	{
		label: "Two Banes",
		image: `systems/wfrp3e/assets/icons/dice/challenge_twobanes.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 2,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	8:
	{
		label: "One Chaos Star",
		image: `systems/wfrp3e/assets/icons/dice/challenge_onechaosstar.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 1,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 1
	}
}

WFRP3E.characteristicDiceResults =
{
    1:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/characteristic.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	2:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/characteristic.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    3:
	{
		label: "One Success",
		image: `systems/wfrp3e/assets/icons/dice/characteristic_onesuccess.webp`,
		success: 1,
		righteousSuccess: 0, 
		challenge: 0, 
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	4:
	{
		label: "One Success",
		image: `systems/wfrp3e/assets/icons/dice/characteristic_onesuccess.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	5:
	{
		label: "One Success",
		image: `systems/wfrp3e/assets/icons/dice/characteristic_onesuccess.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    6:
	{
		label: "One Success",
		image: `systems/wfrp3e/assets/icons/dice/characteristic_onesuccess.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    7:
	{
		label: "One Boon",
		image: `systems/wfrp3e/assets/icons/dice/characteristic_oneboon.webp`,
		success: 0,
		righteousSuccess: 0, 
		challenge: 0, 
		boon: 1,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    8:
	{
		label: "One Boon",
		image: `systems/wfrp3e/assets/icons/dice/characteristic_oneboon.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 1,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
}

WFRP3E.conservativeDiceResults =
{
    1:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/conservative.webp`,
		success: 0,
		righteousSuccess: 0, 
		challenge: 0, 
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    2:
	{
		label: "One Success",
		image: `systems/wfrp3e/assets/icons/dice/conservative_onesuccess.webp`,
		success: 1,
		righteousSuccess: 0, 
		challenge: 0, 
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    3:
	{
		label: "One Success",
		image: `systems/wfrp3e/assets/icons/dice/conservative_onesuccess.webp`,
		success: 1,
		righteousSuccess: 0, 
		challenge: 0, 
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    4:
	{
		label: "One Success",
		image: `systems/wfrp3e/assets/icons/dice/conservative_onesuccess.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    5:
	{
		label: "One Success",
		image: `systems/wfrp3e/assets/icons/dice/conservative_onesuccess.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    6:
	{
		label: "One Boon",
		image: `systems/wfrp3e/assets/icons/dice/conservative_oneboon.webp`,
		success: 0,
		righteousSuccess: 0, 
		challenge: 0, 
		boon: 1,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	7:
	{
		label: "One Boon",
		image: `systems/wfrp3e/assets/icons/dice/conservative_oneboon.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 1,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	8:
	{
		label: "One Success One Boon",
		image: `systems/wfrp3e/assets/icons/dice/conservative_onesuccess_oneboon.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 1,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	9:
	{
		label: "One Success One Delay",
		image: `systems/wfrp3e/assets/icons/dice/conservative_onesuccess_onedelay.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 1,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	10:
	{
		label: "One Success One Delay",
		image: `systems/wfrp3e/assets/icons/dice/conservative_onesuccess_onedelay.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 1,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
}

WFRP3E.expertiseDiceResults =
{
	1:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/expertise.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	2:
	{
		label: "One Success",
		image: `systems/wfrp3e/assets/icons/dice/expertise_onesuccess.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	3:
	{
		label: "One Righteous Success",
		image: `systems/wfrp3e/assets/icons/dice/expertise_onerighteoussuccess.webp`,
		success: 0,
		righteousSuccess: 1,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	4:
	{
		label: "One Boon",
		image: `systems/wfrp3e/assets/icons/dice/expertise_oneboon.webp`,
		success: 2,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	5:
	{
		label: "One Boon",
		image: `systems/wfrp3e/assets/icons/dice/expertise_oneboon.webp`,
		success: 2,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	6:
	{
		label: "One Sigmar's Comet",
		image: `systems/wfrp3e/assets/icons/dice/expertise_onesigmarscomet.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 1,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	}
}

WFRP3E.fortuneDiceResults =
{
	1:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/fortune.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	2:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/fortune.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	3:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/fortune.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	4:
	{
		label: "One Success",
		image: `systems/wfrp3e/assets/icons/dice/fortune_onesuccess.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 1,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	5:
	{
		label: "One Success",
		image: `systems/wfrp3e/assets/icons/dice/fortune_onesuccess.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	6:
	{
		label: "One Boon",
		image: `systems/wfrp3e/assets/icons/dice/fortune_oneboon.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 1,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
}

WFRP3E.infortuneDiceResults =
{
    1:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/infortune.webp`,
		success: 0,
		righteousSuccess: 0, 
		challenge: 0, 
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    2:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/infortune.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    3:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/infortune.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    4:
	{
		label: "One Challenge",
		image: `systems/wfrp3e/assets/icons/dice/infortune_onechallenge.webp`,
		success: 0,
		righteousSuccess: 0, 
		challenge: 1, 
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    5:
	{
		label: "One Challenge",
		image: `systems/wfrp3e/assets/icons/dice/infortune_onechallenge.webp`,
		success: 0,
		righteousSuccess: 0, 
		challenge: 1, 
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
    6:
	{
		label: "One Bane",
		image: `systems/wfrp3e/assets/icons/dice/infortune_onebane.webp`,
		success: 0,
		righteousSuccess: 0, 
		challenge: 0, 
		boon: 0,
		bane: 1,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	}
}

WFRP3E.recklessDiceResults =
{
	1:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/reckless.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	2:
	{
		label: "Blank",
		image: `systems/wfrp3e/assets/icons/dice/reckless.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	3:
	{
		label: "Two Success",
		image: `systems/wfrp3e/assets/icons/dice/reckless_twosuccess.webp`,
		success: 2,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	4:
	{
		label: "Two Success",
		image: `systems/wfrp3e/assets/icons/dice/reckless_twosuccess.webp`,
		success: 2,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	5:
	{
		label: "One Success One Boon",
		image: `systems/wfrp3e/assets/icons/dice/reckless_onesuccess_oneboon.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 1,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	6:
	{
		label: "Two Boons",
		image: `systems/wfrp3e/assets/icons/dice/reckless_twoboons.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 2,
		bane: 0,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	7:
	{
		label: "One Bane",
		image: `systems/wfrp3e/assets/icons/dice/reckless_onebane.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 1,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	8:
	{
		label: "One Bane",
		image: `systems/wfrp3e/assets/icons/dice/reckless_onebane.webp`,
		success: 0,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 1,
		delay: 0,
		exertion: 0,
		sigmarsComet: 0,
		chaosStar: 0
	},
	9:
	{
		label: "One Success One Exercion",
		image: `systems/wfrp3e/assets/icons/dice/reckless_onesuccess_oneexertion.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 1,
		sigmarsComet: 0,
		chaosStar: 0
	},
	10:
	{
		label: "One Success One Exercion",
		image: `systems/wfrp3e/assets/icons/dice/reckless_onesuccess_oneexertion.webp`,
		success: 1,
		righteousSuccess: 0,
		challenge: 0,
		boon: 0,
		bane: 0,
		delay: 0,
		exertion: 1,
		sigmarsComet: 0,
		chaosStar: 0
	},
}