import AbilitySheet from "./ability-sheet.mjs";
import ActionSheet from "./action-sheet.mjs";
import ArmourSheet from "./armour-sheet.mjs";
import CareerSheet from "./career-sheet.mjs";
import ConditionSheet from "./condition-sheet.mjs";
import CriticalWoundSheet from "./critical-wound-sheet.mjs";
import DiseaseSheet from "./disease-sheet.mjs";
import InsanitySheet from "./insanity-sheet.mjs";
import MiscastSheet from "./miscast-sheet.mjs";
import MoneySheet from "./money-sheet.mjs";
import MutationSheet from "./mutation-sheet.mjs";
import SkillSheet from "./skill-sheet.mjs";
import TalentSheet from "./talent-sheet.mjs";
import TrappingSheet from "./trapping-sheet.mjs";
import WeaponSheet from "./weapon-sheet.mjs";

export {
	AbilitySheet,
	ActionSheet,
	ArmourSheet,
	CareerSheet,
	ConditionSheet,
	CriticalWoundSheet,
	DiseaseSheet,
	InsanitySheet,
	MiscastSheet,
	MoneySheet,
	MutationSheet,
	SkillSheet,
	TalentSheet,
	TrappingSheet,
	WeaponSheet
};

export function registerSheets()
{
	const {DocumentSheetConfig} = foundry.applications.apps;
	const itemClass = CONFIG.Item.documentClass;

	DocumentSheetConfig.unregisterSheet(itemClass, "core", foundry.appv1.sheets.ItemSheet);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		AbilitySheet,
		{label: "Ability Sheet", types: ["ability"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		ActionSheet,
		{label: "Action Sheet", types: ["action"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		ArmourSheet,
		{label: "Armour Sheet", types: ["armour"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		CareerSheet,
		{label: "Career Sheet", types: ["career"], makeDefault: true}
	)
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		ConditionSheet,
		{label: "Condition Sheet", types: ["condition"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		CriticalWoundSheet,
		{label: "Critical Wound Sheet", types: ["criticalWound"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		DiseaseSheet,
		{label: "Disease Sheet", types: ["disease"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		InsanitySheet,
		{label: "Insanity Sheet", types: ["insanity"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		MiscastSheet,
		{label: "Miscast Sheet", types: ["miscast"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		MoneySheet,
		{label: "Money Sheet", types: ["money"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		MutationSheet,
		{label: "Mutation Sheet", types: ["mutation"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		SkillSheet,
		{label: "Skill Sheet", types: ["skill"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		TalentSheet,
		{label: "Talent Sheet", types: ["talent"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		TrappingSheet,
		{label: "Trapping Sheet", types: ["trapping"], makeDefault: true}
	);
	DocumentSheetConfig.registerSheet(
		itemClass,
		"wfrp3e",
		WeaponSheet,
		{label: "Weapon Sheet", types: ["weapon"], makeDefault: true}
	);
}
