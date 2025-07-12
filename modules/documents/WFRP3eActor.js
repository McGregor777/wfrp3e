import ActionSelector from "../applications/selectors/ActionSelector.js";
import CareerSelector from "../applications/selectors/CareerSelector.js";
import TalentSelector from "../applications/selectors/TalentSelector.js";
import SkillUpgrader from "../applications/selectors/SkillUpgrader.js";
import CareerAdvanceDialog from "../applications/CareerAdvanceDialog.js";
import CheckBuilder from "../applications/CheckBuilder.js";
import PartyEventEditor from "../applications/PartyEventEditor.js";
import WFRP3eEffect from "./WFRP3eEffect.js";
import {capitalize} from "../helpers.js";

/**
 * Provides the main Actor data computation and organization.
 * WFRP3eActor contains all the preparation data and methods used for preparing an actors: going through each Owned Item, preparing them for display based on characteristics.
 * @see WFRP3eCharacterSheet - Character sheet class
 */
export default class WFRP3eActor extends Actor
{
	/** @inheritDoc */
	_onCreate(data, options, userId)
	{
		super._onCreate(data, options, userId);

		try {
			const functionName = `_on${capitalize(this.type)}Create`;

			if(this[functionName])
				this[functionName](data, options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when updating the Item ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/** @inheritDoc */
	_onDelete(options, userId)
	{
		super._onDelete(options, userId);

		try {
			const functionName = `_on${capitalize(this.type)}Delete`;

			if(this[functionName])
				this[functionName](options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when updating the Item ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/** @inheritDoc */
	_onUpdate(changed, options, userId)
	{
		super._onUpdate(changed, options, userId);

		try {
			const functionName = `_on${capitalize(this.type)}Update`;

			if(this[functionName])
				this[functionName](changed, options, userId);
		}
		catch(exception) {
			console.error(`Something went wrong when updating the Item ${this.name} of type ${this.type}: ${exception}`);
		}
	}

	/**
	 * Creates a new WFRP3eEffect for the WFRP3eActor.
	 * @param {Object} [data] An Object of optional data for the new WFRP3eEffect.
	 * @returns {Promise<void>}
	 */
	async createEffect(data = {})
	{
		await WFRP3eEffect.create({
			name: game.i18n.localize("DOCUMENT.ActiveEffect"),
			img: "icons/svg/dice-target.svg",
			...data
		}, {parent: this});
	}

	performCharacteristicCheck(characteristic)
	{
		CheckBuilder.prepareCharacteristicCheck(
			this,
			{name: characteristic, ...this.system.characteristics[characteristic]}
		);
	}

	/**
	 * Gets the name of Character's current stance.
	 * @returns {string}
	 */
	getCurrentStanceName()
	{
		if(this.system.stance.current < 0)
			return "conservative";
		else if(this.system.stance.current > 0)
			return "reckless";

		return this.system.defaultStance;
	}

	/**
	 * Adds or removes a specified amount of segments on either side on the stance meter.
	 */
	async adjustStanceMeter(stance, amount)
	{
		if(this.system.stance[stance] + amount < 0)
			ui.notifications.warn(game.i18n.localize("CHARACTER.WARNINGS.minimumSegment"));

		await this.update({system: {stance: {[`${stance}`]: this.system.stance[stance] + amount}}});
	}

	/**
	 * Builds up the list of Talent Sockets available for the Actor by Talent type.
	 */
	async buildSocketList()
	{
		const socketsByType = Object.fromEntries(
				  ["any", ...Object.keys(CONFIG.WFRP3e.talentTypes), "insanity"].map(key => [key, {}])
			  ),
			  currentCareer = this.system.currentCareer,
			  currentParty = this.system.currentParty

		if(currentCareer) {
			currentCareer.system.sockets.forEach((socket, index) => {
				// Find a potential Item that would be socketed in that socket.
				const item = this.items.search({
					filters: [{
						field: "system.socket",
						operator: "is_empty",
						negate: true
					}, {
						field: "system.socket",
						operator: "equals",
						negate: false,
						value: `${currentCareer.uuid}_${index}`
					}]
				})[0];

				socketsByType[socket.type][currentCareer.uuid + "_" + index] =
					currentCareer.name + " - " + (item
						? game.i18n.format("TALENT.SOCKET.taken", {
							type: game.i18n.localize(`TALENT.TYPES.${socket.type}`),
							talent: item.name
						})
						: game.i18n.format("TALENT.SOCKET.available", {
							type: game.i18n.localize(`TALENT.TYPES.${socket.type}`)
						}));
			});
		}

		if(currentParty) {
			for(const socketIndex in currentParty.system.sockets) {
				const socket = currentParty.system.sockets[socketIndex];
				let item = null;

				for(const member of currentParty.system.members) {
					// Find a potential Item that would be socketed in that socket.
					item = await fromUuid(member).then(actor => actor?.items.search({
						filters: [{
							field: "system.socket",
							operator: "is_empty",
							negate: true
						}, {
							field: "system.socket",
							operator: "equals",
							negate: false,
							value: `${currentParty.uuid}_${socketIndex}`
						}]
					})[0]);

					if(item)
						break;
				}

				socketsByType[socket.type][currentParty.uuid + "_" + socketIndex] =
					currentParty.name + " - " + (item
						? game.i18n.format("TALENT.SOCKET.taken", {
							type: game.i18n.localize(`TALENT.TYPES.${socket.type}`),
							talent: item.name
						})
						: game.i18n.format("TALENT.SOCKET.available", {
							type: game.i18n.localize(`TALENT.TYPES.${socket.type}`)
						}));
			}
		}

		for(const itemType of Object.keys(CONFIG.WFRP3e.talentTypes))
			Object.assign(socketsByType[itemType], socketsByType["any"]);

		return socketsByType;
	}

	/**
	 * Buys a new advance on a specific WFRP3eCareer for the WFRP3eCharacter.
	 * @param {WFRP3eItem} career The WFRP3eCareer containing the new advance.
	 * @param {String} type The type of the new advance.
	 */
	async buyAdvance(career, type)
	{
		if(this.system.experience.current <= 0)
			return ui.notifications.warn(game.i18n.localize("CHARACTER.WARNINGS.noExperienceLeft"));

		switch(type) {
			case "action":
				if(career.system.advances.action)
					throw new Error("Unable to buy the action advance: the career's action advance is unavailable.");

				ActionSelector.wait({
					items: await ActionSelector.buildAdvanceOptionsList(this)
				}).then(action => this.buyActionAdvance(action, career, type));
				break;

			case "talent":
				if(career.system.advances.talent)
					throw new Error("Unable to buy the talent advance: the career's talent advance is unavailable.");

				TalentSelector.wait({
					items: await TalentSelector.buildAdvanceOptionsList(this, career),
					types: career.system.sockets.map(socket => socket.type)
				}).then(talent => this.buyTalentAdvance(talent, career, type));
				break;

			case "skill":
				if(career.system.advances.skill)
					throw new Error("Unable to buy the skill upgrade advance: the career's skill advance is unavailable.");

				SkillUpgrader.wait({
					actor: this,
					advanceType: type,
					items: await SkillUpgrader.buildAdvanceOptionsList(this, career)
				}).then(upgrade => this.buySkillAdvance(upgrade, career, type));
				break;

			case "careerTransition":
				if(career.system.advances.careerTransition.newCareer)
					throw new Error("Unable to buy the advance: the career's transition advance is already used.");

				CareerSelector.wait({
					actor: this,
					items: await CareerSelector.buildAdvanceOptionsList(this, career)
				}).then(newCareer => this.changeCareer(newCareer, career, type));
				break;

			case "wound":
				await this.buyWoundAdvance(career, type);
				break;

			case "dedicationBonus":
				if(career.system.advances.dedicationBonus.length)
					throw new Error("Unable to buy the dedication bonus: it has already been bought for this career.");
				// Ensure a dedication bonus can only be bought if every advance of the WFRP3eCareer has been bought.
				else if(!career.system.advances.action || !career.system.advances.talent || !career.system.advances.skill
					|| !career.system.advances.wound || career.system.advances.open.filter(advance => !advance).length)
					return ui.notifications.warn(game.i18n.localize("CAREER.WARNINGS.dedicationBonusCareerNotCompleted"));

				await this.buyDedicationBonus(career, type);
				break;

			case "nonCareer":
				if(career.system.advances.nonCareer.findIndex(slot => !slot.type) == null)
					throw new Error("Unable to buy the advance: the career has no available non-career advance slot.");

				if(this.system.experience.current < 2)
					return ui.notifications.warn(game.i18n.localize("CHARACTER.WARNINGS.notEnoughExperienceForNonCareerAdvance"));

				await CareerAdvanceDialog.wait({
					window: {title: "CAREERADVANCEDIALOG.nonCareerAdvance.title"},
					content: `<p>${game.i18n.format("CAREERADVANCEDIALOG.nonCareerAdvance.content")}</p>`,
					buttons: [{
						action: "characteristic",
						label: game.i18n.localize("CAREERADVANCEDIALOG.BUTTONS.nonPrimaryCharacteristic")
					}, {
						action: "skill",
						label: game.i18n.localize("CAREERADVANCEDIALOG.BUTTONS.nonCareerSkill")
					}, {
						action: "talent",
						label: game.i18n.localize("CAREERADVANCEDIALOG.BUTTONS.talent")
					}],
					submit: result => CareerAdvanceDialog.careerAdvanceSelection(result, this, career, type)
				});
				break;

			default:
				if(career.system.advances.open.findIndex(slot => !slot) == null)
					throw new Error("Unable to buy the advance: the career has no available career advance slot.");

				await CareerAdvanceDialog.wait({
					window: {title: "CAREERADVANCEDIALOG.openAdvance.title"},
					content: `<p>${game.i18n.format("CAREERADVANCEDIALOG.openAdvance.content")}</p>`,
					buttons: [{
						action: "characteristic",
						label: game.i18n.localize("CAREERADVANCEDIALOG.BUTTONS.primaryCharacteristic")
					}, {
						action: "action",
						label: game.i18n.localize("CAREERADVANCEDIALOG.BUTTONS.action")
					}, {
						action: "skill",
						label: game.i18n.localize("CAREERADVANCEDIALOG.BUTTONS.skill")
					}, {
						action: "talent",
						label: game.i18n.localize("CAREERADVANCEDIALOG.BUTTONS.talent")
					}, {
						action: "wound",
						label: game.i18n.localize("CAREERADVANCEDIALOG.BUTTONS.wound")
					}, {
						action: "conservative",
						label: game.i18n.localize("CAREERADVANCEDIALOG.BUTTONS.conservative")
					}, {
						action: "reckless",
						label: game.i18n.localize("CAREERADVANCEDIALOG.BUTTONS.reckless")
					}],
					submit: result => CareerAdvanceDialog.careerAdvanceSelection(result, this, career, type)
				});
				break;
		}
	}

	/**
	 * Buys a new action advance on a specific WFRP3eCareer for the WFRP3eCharacter.
	 * @param {string} actionUuid The UUID of the WFRP3eAction that has been bought through the advance.
	 * @param {WFRP3eItem} career The WFRP3eCareer containing the new advance.
	 * @param {string} type The type of the bought advance.
	 */
	async buyActionAdvance(actionUuid, career, type)
	{
		const action = await fromUuid(actionUuid);

		if(type === "action") {
			if(career.system.advances.action)
				throw new Error("Unable to buy the action advance: the career's action advance is unavailable.");

			await career.update({"system.advances.action": action.name});
		}
		else {
			const advanceSlotIndex = career.system.advances.open.findIndex(slot => !slot);

			if(advanceSlotIndex == null)
				throw new Error("Unable to buy the advance: the career has no available career advance slot.");

			career.system.advances.open[advanceSlotIndex] = `${game.i18n.localize("CAREER.SHEET.action")} - ${action.name}`;

			await career.update({"system.advances.open": career.system.advances.open});
		}

		await Item.createDocuments([action], {parent: this});
	}

	/**
	 * Buys a new characteristic advance on a specific WFRP3eCareer for the WFRP3eCharacter.
	 * @param {Object} upgrade The characteristic upgrade infos.
	 * @param {WFRP3eItem} career The WFRP3eCareer containing the new advance.
	 * @param {string} type The type of the bought advance.
	 */
	async buyCharacteristicAdvance(upgrade, career, type)
	{
		const advancementName = game.i18n.format(`CHARACTERISTICUPGRADER.characteristic${capitalize(upgrade.type)}`, {
				  characteristic: game.i18n.localize(CONFIG.WFRP3e.characteristics[upgrade.characteristic].name)
			  }),
			  characteristic = this.system.characteristics[upgrade.characteristic];

		if(type === "nonCareer") {
			const nonCareerAdvances = career.system.advances.nonCareer;

			career.system.advances.nonCareer[nonCareerAdvances.findIndex(advance => !advance.type)] = {
				cost: characteristic.rating + 2,
				type: advancementName
			};

			await career.update({"system.advances.nonCareer": nonCareerAdvances});
		}
		else {
			const openCareerAdvances = career.system.advances.open.slice();

			if(upgrade.type === "rating") {
				let advanceCount = 0;

				for(let index in openCareerAdvances) {
					if(!openCareerAdvances[index]) {
						openCareerAdvances[index] = advancementName;
						advanceCount++;
					}

					if(advanceCount >= characteristic.rating + 1)
						break;
				}

				if(advanceCount < characteristic.rating + 1) {
					const error = game.i18n.localize("CHARACTERISTICUPGRADER.WARNINGS.notEnoughOpenAdvances");
					ui.notifications.error(error);
					throw error;
				}
			}
			else if(upgrade.type === "fortune")
				openCareerAdvances[openCareerAdvances.findIndex(advance => !advance)] = advancementName;

			await career.update({"system.advances.open": openCareerAdvances});
		}

		await this.update({[`system.characteristics.${upgrade.characteristic}.${upgrade.type}`]: upgrade.value});
	}

	/**
	 * Buys a new conservative advance on a specific WFRP3eCareer for the WFRP3eCharacter.
	 * @param {WFRP3eItem} career The WFRP3eCareer containing the new advance.
	 */
	async buyConservativeAdvance(career)
	{
		let advanceSlotIndex = career.system.advances.open.findIndex(slot => !slot);

		if(advanceSlotIndex == null)
			throw new Error("Unable to buy the advance: the career has no available career advance slot.");

		career.system.advances.open[advanceSlotIndex] = game.i18n.localize("STANCES.conservative");

		await career.update({"system.advances.open": career.system.advances.open});
		await this.update({"system.stance.conservative": this.system.stance.reckless + 1});
	}

	/**
	 * Buys the dedication bonus of a specific WFRP3eCareer for the WFRP3eCharacter.
	 * @param {WFRP3eItem} career The WFRP3eCareer which dedication bonus is bought.
	 * @param {string} type The type of the bought advance.
	 */
	async buyDedicationBonus(career, type)
	{
		if(career.system.advances.dedicationBonus.length)
			throw new Error("Unable to buy the dedication bonus: it has already been bought for this career.");

		// Fetch the skills that have been trained as a career advance.
		const regex = new RegExp(
				`([A-Za-zÀ-ÖØ-öø-ÿ ]+\\b).*(${game.i18n.localize("SKILL.FIELDS.trainingLevel.label")})`,
				"gui"
			),
			  trainedSkills = [
				  career.system.advances.skill,
				  ...career.system.advances.open.filter(advance => advance?.length)
			  ].map(advance => [...advance?.matchAll(regex)][0])
				  .filter(advance => advance?.length)
				  .map(advance => this.itemTypes.skill.find(skill => skill.name === advance[1]));

		// Let the user select one new specialisation for each skill that has been trained as a career advance.
		SkillUpgrader.wait({actor: this, items: trainedSkills, advanceType: type, size: trainedSkills.length})
			.then(async specialisations => {
				for(const specialisation of specialisations)
					fromUuid(specialisation.uuid).then(async skill => await skill.update({
						"system.specialisations": skill.system.specialisations
							? skill.system.specialisations + specialisation.value
							: specialisation.value
					}))
			});

		// Add the related career ability to the WFRP3eActor.
		await Item.createDocuments([
			await game.packs.get("wfrp3e.items").getDocuments({type: "ability"})
				.then(abilities => abilities.find(ability => ability.name === career.name))
		], {parent: this});

		// Mark the dedication bonus as acquired.
		await career.update({"system.advances.dedicationBonus": game.i18n.localize("CAREER.FIELDS.dedicationBonus.label")});
	}

	/**
	 * Buys a new reckless advance on a specific WFRP3eCareer for the WFRP3eCharacter.
	 * @param {WFRP3eItem} career The WFRP3eCareer containing the new advance.
	 */
	async buyRecklessAdvance(career)
	{
		let advanceSlotIndex = career.system.advances.open.findIndex(slot => !slot);

		if(advanceSlotIndex == null)
			throw new Error("Unable to buy the advance: the career has no available career advance slot.");

		career.system.advances.open[advanceSlotIndex] = game.i18n.localize("STANCES.reckless");

		await career.update({"system.advances.open": career.system.advances.open});
		await this.update({"system.stance.reckless": this.system.stance.reckless + 1});
	}

	/**
	 * Buys a new skill advance on a specific WFRP3eCareer for the WFRP3eCharacter.
	 * @param {Object} skillUpgrade The WFRP3eSkill upgrade infos.
	 * @param {WFRP3eItem} career The WFRP3eCareer containing the new advance.
	 * @param {string} type The type of the bought advance.
	 */
	async buySkillAdvance(skillUpgrade, career, type)
	{
		skillUpgrade = skillUpgrade[0];
		const skill = await fromUuid(skillUpgrade.uuid);
		let advanceSlotIndex = null;

		switch(type) {
			case "skill":
				if(career.system.advances.skill)
					throw new Error("Unable to buy the skill upgrade advance: the career's skill advance is unavailable.");

				await career.update({
					"system.advances.skill": game.i18n.format(
						`SKILLUPGRADER.${skillUpgrade.type}Upgrade`,
						{name: skill.name, value: skillUpgrade.value}
					)
				});
				break;
			case "nonCareer":
				advanceSlotIndex = career.system.advances.nonCareer.findIndex(slot => !slot.type);

				if(advanceSlotIndex == null)
					throw new Error("Unable to buy the advance: the career has no available non-career advance slot.");

				career.system.advances.nonCareer[advanceSlotIndex] = {
					cost: skill.system.advanced ? 4 : 2,
					type: game.i18n.format(
						`SKILLUPGRADER.${skillUpgrade.type}Upgrade`,
						{name: skill.name, value: skillUpgrade.value}
					)
				};

				await career.update({"system.advances.nonCareer": career.system.advances.nonCareer});
				break;
			default:
				advanceSlotIndex = career.system.advances.open.findIndex(slot => !slot);

				if(advanceSlotIndex == null)
					throw new Error("Unable to buy the advance: the career has no available advance slot.");

				career.system.advances.open[advanceSlotIndex] = game.i18n.format(
					`SKILLUPGRADER.${skillUpgrade.type}Upgrade`,
					{name: skill.name, value: skillUpgrade.value}
				);

				await career.update({"system.advances.open": career.system.advances.open});
				break;
		}

		switch(skillUpgrade.type) {
			case "acquisition":
				await Item.createDocuments([skill], {parent: this});
				break;
			case "trainingLevel":
				await skill.update({"system.trainingLevel": skillUpgrade.value});
				break;
			case "specialisation":
				let specialisations = skill.system.specialisations;
				
				if(specialisations.length)
					specialisations += `, ${skillUpgrade.value}`;

				await skill.update({"system.specialisations": specialisations});
				break;
		}
	}

	/**
	 * Buys a new talent advance on a specific WFRP3eCareer for the WFRP3eCharacter.
	 * @param {string} talentUuid The UUID of the WFRP3eTalent that has been bought through the advance.
	 * @param {WFRP3eItem} career The WFRP3eCareer containing the new advance.
	 * @param {string} type The type of the bought advance.
	 */
	async buyTalentAdvance(talentUuid, career, type)
	{
		const talent = await fromUuid(talentUuid);
		let advanceSlotIndex = null;

		switch(type) {
			case "talent":
				if(career.system.advances.talent)
					throw new Error("Unable to buy the talent advance: the career's talent advance is unavailable.");

				await career.update({"system.advances.talent": talent.name});
				break;
			case "nonCareer":
				advanceSlotIndex = career.system.advances.nonCareer.findIndex(slot => !slot.type);

				if(advanceSlotIndex == null)
					throw new Error("Unable to buy the advance: the career has no available non-career advance slot.");

				career.system.advances.nonCareer[advanceSlotIndex] = {
					cost: 2,
					type: talent.name
				};

				await career.update({"system.advances.nonCareer": career.system.advances.nonCareer});
				break;
			default:
				advanceSlotIndex = career.system.advances.open.findIndex(slot => !slot);

				if(advanceSlotIndex == null)
					throw new Error("Unable to buy the advance: the career has no available advance slot.");

				career.system.advances.open[advanceSlotIndex] = `${game.i18n.localize("CAREER.SHEET.talent")} - ${talent.name}`;

				await career.update({"system.advances.open": career.system.advances.open});
				break;
		}

		await Item.createDocuments([talent], {parent: this});
	}

	/**
	 * Buys a new wound advance on a specific WFRP3eCareer for the WFRP3eCharacter.
	 * @param {WFRP3eItem} career The WFRP3eCareer containing the new advance.
	 * @param {string} type The type of the bought advance.
	 */
	async buyWoundAdvance(career, type)
	{
		if(type === "wound") {
			if(career.system.advances.wound)
				throw new Error("Unable to buy the wound advance: the career's wound advance is unavailable.");

			await career.update({"system.advances.wound": game.i18n.localize("CHARACTER.woundThreshold")});
		}
		else {
			let advanceSlotIndex = career.system.advances.open.findIndex(slot => !slot);

			if(advanceSlotIndex == null)
				throw new Error("Unable to buy the advance: the career has no available advance slot.");

			career.system.advances.open[advanceSlotIndex] = game.i18n.localize("CHARACTER.woundThreshold");

			await career.update({"system.advances.open": career.system.advances.open});
		}

		await this.update({"system.wounds": {
			max: this.system.wounds.max + 1,
			value: this.system.wounds.value + 1
		}});
	}

	/**
	 * Buys a career transition advance on a specific WFRP3eCareer for the WFRP3eCharacter.
	 * @param {String} newCareerUuid The new WFRP3eCareer into which the transition is made.
	 * @param {WFRP3eItem} career The WFRP3eCareer containing the new advance.
	 */
	async changeCareer(newCareerUuid, career)
	{
		if(career.system.advances.careerTransition.newCareer)
			throw new Error("Unable to buy the advance: the career's transition advance is already used.");

		const newCareer = await fromUuid(newCareerUuid)
		let cost = career.calculateCareerTransitionCost(newCareer);
		await Item.createDocuments([newCareer], {parent: this}).then(career => career[0].update({"system.current": true}));
		//TODO: Add Execute onCareerTransition scripts here.

		await career.update({"system.advances.careerTransition": {
			cost,
			newCareer: newCareer.name
		}});
	}

	/**
	 * Removes a Career's advance, resetting its cost and type.
	 * @param {WFRP3eItem} career The Career owning the advance.
	 * @param {String} type The advance type.
	 * @param {Number} [index] The index of the non-career advance, if relevant.
	 * @returns {Promise<void>}
	 */
	async removeAdvance(career, type, index = null)
	{
		switch(type) {
			case "careerTransition":
				await career.update({"system.advances.careerTransition": {cost: 0, newCareer: null}});
				break;
			case "nonCareer":
				if(!index)
					throw new Error("Unable to remove non-career advance without the index of the advance.");

				foundry.utils.setProperty(career, `system.advances.nonCareer.${index}`, {cost: 0, type: null});

				await career.update({"system.advances.nonCareer": career.system.advances.nonCareer});
				break;
			default:
				await career.update({[`system.advances.${type}`]: null});
		}
	}

	/**
	 * Updates one of the Character impairment value.
	 * @param {String} impairment The impairment to update.
	 * @param {Number} value The value to add to the impairment.
	 */
	async adjustImpairment(impairment, value)
	{
		await this.update({[`system.impairments.${impairment}`]: this.system.impairments[impairment] + value});
	}

	/**
	 * Checks for Items sharing the same socket and removes all except the current one.
	 * @param {WFRP3eItem} item
	 */
	preventMultipleItemsOnSameSocket(item)
	{
		const actors = this.system.currentParty
				  ? this.system.currentParty.system.members.map(member => fromUuidSync(member))
				  : [this],
			  items = actors.reduce((items, actor) => {
				  items.push(...actor.items.search({
					  filters: [{
						  field: "system.socket",
						  operator: "is_empty",
						  negate: true
					  }, {
						  field: "uuid",
						  operator: "equals",
						  negate: true,
						  value: item.uuid
					  }, {
						  field: "system.socket",
						  operator: "equals",
						  negate: false,
						  value: item.system.socket
					  }]
				  }));
				  return items;
			  }, []);

		for(const item of items)
			item.update({"system.socket": ""});
	}

	/**
	 * Resets every matching socket available to the Actor.
	 * @param {string} uuid The UUID of the Document owning the sockets to reset.
	 */
	resetSockets(uuid)
	{
		const documents = this.items.search({
			filters: [{
				field: "system.socket",
				operator: "is_empty",
				negate: true
			}, {
				field: "system.socket",
				operator: "starts_with",
				negate: false,
				value: uuid
			}]
		});

		for(const document of documents) {
			document.update({"system.socket": null});
		}
	}

	/**
	 * Adds a new socket to the Actor's list of sockets.
	 */
	async addNewSocket()
	{
		await this.update({"system.sockets": [...this.system.sockets, {item: null, type: "any"}]});
	}

	/**
	 * Deletes a socket from the Actor's list of sockets.
	 * @param {Number} index The index of the socket to remove.
	 */
	async deleteSocket(index)
	{
		this.system.sockets.splice(index, 1);
		await this.update({"system.sockets": this.system.sockets});
	}

	/**
	 * Finds every Item owned by the Actor with an effect triggered.
	 * @param {string} triggerType The trigger type of the effect.
	 * @param {Object} options
	 * @param {Object[]} [options.parameters]
	 * @param {string[]} [options.parameterNames]
	 * @returns {WFRP3eItem[]} An Array of triggered items.
	 */
	findTriggeredItems(triggerType, {parameters = [], parameterNames = []} = {})
	{
		return [
			...this.items.search({
				filters: [{
					field: "type",
					operator: "equals",
					value: "talent"
				}, {
					field: "system.rechargeTokens",
					operator: "equals",
					value: 0
				}, {
					field: "system.socket",
					operator: "is_empty",
					negate: true
				}, {
					field: "effects",
					operator: "is_empty",
					negate: true
				}]
			}),
			...this.items.search({
				filters: [{
					field: "type",
					operator: "equals",
					value: "career"
				}, {
					field: "system.current",
					operator: "equals",
					value: true
				}, {
					field: "effects",
					operator: "is_empty",
					negate: true
				}]
			}),
			...this.items.search({
				filters: [{
					field: "type",
					operator: "contains",
					value: ["career", "talent"],
					negate: true
				}, {
					field: "effects",
					operator: "is_empty",
					negate: true
				}]
			})
		].filter(item => item.effects.filter(
			effect => {
				// Check if the WFRP3eEffect's trigger type matches, and if it has a condition script, that it returns true.
				return !(effect.system.type !== triggerType
					|| effect.system.conditionScript
						&& !effect.checkEffectConditionScript({parameters, parameterNames}));
			}).length > 0
		);
	}

	/**
	 * Finds every effect triggered by a specific script trigger.
	 * @param {string} triggerType The trigger type of the effect.
	 * @param {Object} options
	 * @param {Object[]} [options.parameters]
	 * @param {string[]} [options.parameterNames]
	 * @returns {WFRP3eEffect[]} An Array of triggered WFRP3eEffects.
	 */
	findTriggeredEffects(triggerType, {parameters = [], parameterNames = []} = {})
	{
		return this.findTriggeredItems(triggerType, {parameters, parameterNames}).map(item => {
			 return item.effects.find(effect => effect.system.type === triggerType)
		});
	}

	/**
	 * Inflicts a certain amount of fatigue to the Actor.
	 * @param {Number} amount The amount of fatigue to inflict.
	 */
	async inflictFatigue(amount)
	{
		if(this.system.impairments.fatigue !== undefined)
			await this.update({"system.impairments.fatigue": this.system.impairments.fatigue + amount});
	}

	/**
	 * Inflicts a certain amount of stress to the Actor.
	 * @param {Number} amount The amount of stress to inflict.
	 */
	async inflictStress(amount)
	{
		if(this.system.impairments.stress !== undefined)
			await this.update({"system.impairments.stress": this.system.impairments.stress + amount});
	}

	//#region Character methods
	
	/**
	 * Post-process a creation operation for a single WFRP3eCharacter instance. Post-operation events occur for all connected clients.
	 * @param {Object} data The initial data object provided to the document creation request
	 * @param {Object} options Additional options which modify the creation request
	 * @param {String} userId The id of the User requesting the document update
	 * @private
	 */
	_onCharacterCreate(data, options, userId)
	{
		if(this.system.party)
			this.update({"system.party": null});
	}

	//#endregion
	//#region Party methods

	/**
	 * Post-process a deletion operation for a single WFRP3eParty instance. Post-operation events occur for all connected clients.
	 * @param {any} options Additional options which modify the deletion request
	 * @param {string} userId The id of the User requesting the WFRP3eParty deletion
	 * @private
	 */
	_onPartyDelete(options, userId)
	{
		this.system.members.forEach((member) => fromUuidSync(member).resetSockets(this.uuid));
	}

	/**
	 * Post-process an update operation for a single WFRP3eParty instance. Post-operation events occur for all connected clients.
	 * @param {any} changed The differential data that was changed relative to the documents prior values
	 * @param {any} options Additional options which modify the update request
	 * @param {string} userId The id of the User requesting the document update
	 * @private
	 */
	_onPartyUpdate(changed, options, userId)
	{
		if(changed.system?.members)
			this.#onPartyMembersChange(changed.system.members);

		if(changed.system?.sockets)
			this.#onPartySocketsChange(changed.system.sockets);
	}

	/**
	 * Upon change to the WFRP3eParty member list, ensures that sockets that are owned by removed members and are associated
	 * to the Party are reset.
	 * @param {Array} newMemberList The new Party's member list.
	 * @private
	 */
	#onPartyMembersChange(newMemberList)
	{
		this.system.members.forEach((member) => {
			if(!newMemberList.includes(member))
				fromUuidSync(member).resetSockets(this.uuid);
		});
	}

	/**
	 * Upon change to any of the WFRP3eParty socket's type, ensures that the sockets of each of the members are reset.
	 * @param {Object} sockets The current WFRP3eParty sockets.
	 * @private
	 */
	#onPartySocketsChange(sockets)
	{
		const socketedItems = sockets.map(socket => fromUuidSync(socket.item));

		socketedItems.forEach((item, index) => {
			if(item.system.type !== sockets[index].type)
				this.system.members.forEach((member) => {fromUuidSync(member).resetSockets(this.uuid)});
		});
	}

	/**
	 * Adds a WFRP3eCharacter as a new member of the WFRP3eParty.
	 * @param {WFRP3eActor} actor
	 */
	async addNewPartyMember(actor)
	{
		const members = this.system.members;

		if(actor.type !== "character")
			ui.notifications.warn(game.i18n.format("PARTY.WARNINGS.notACharacter", {name: actor.name}));
		else if(members.includes(actor.uuid))
			ui.notifications.warn(game.i18n.format("PARTY.WARNINGS.alreadyMember", {name: actor.name}));
		else {
			members.push(actor.uuid);
			await this.update({"system.members": members});
			await actor.update({"system.party": this.uuid});
		}
	}

	/**
	 * Opens the Party Event Editor to edit a Party event.
	 * @param index {string} The index to the event to edit.
	 */
	async editPartyEvent(index)
	{
		await new PartyEventEditor({
			data: {
				event: this.system.tension.events[index],
				index,
				party: this
			}
		}).render(true);
	}

	/**
	 * Prompts a Dialog to confirm the removal of a WFRP3eActor from the member list of the Party.
	 * @param {WFRP3eActor|String} actor Either the WFRP3eActor to remove or the member's UUID.
	 */
	async removeMember(actor)
	{
		if(actor instanceof WFRP3eActor)
			await foundry.applications.api.DialogV2.confirm({
				window: {title: game.i18n.localize("APPLICATION.TITLE.MemberRemoval")},
				modal: true,
				content: `<p>${game.i18n.format("APPLICATION.DESCRIPTION.MemberRemoval", {actor: actor.name})}</p>`,
				submit: async (result) => {
					if(result) {
						const members = this.system.members,
							  quittingMemberUuid = members.find(memberUuid => memberUuid === actor.uuid);

						if(quittingMemberUuid) {
							members.splice(members.indexOf(quittingMemberUuid), 1);
							await this.update({"system.members": members});
						}
					}
				}
			});
		else {
			const members = this.system.members,
				  quittingMemberUuid = members.find(memberUuid => memberUuid === actor);

			if(quittingMemberUuid) {
				members.splice(members.indexOf(quittingMemberUuid), 1);
				await this.update({"system.members": members});
			}
		}
	}

	//#endregion
}