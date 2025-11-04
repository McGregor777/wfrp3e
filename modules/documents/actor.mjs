import {capitalize} from "../helpers.mjs";

/**
 * The client-side Actor document which extends the common Actor model.
 * @event hookEvents.applyCompendiumArt
 * @event hookEvents.modifyTokenAttribute
 * @mixes ClientDocumentMixin
 * @see Actors The world-level collection of Actor documents.
 * @see ActorSheet The actor configuration application.
 */
export default class Actor extends foundry.documents.Actor
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
	 * Creates a new active effect for the actor.
	 * @param {Object} [data] An Object of optional data for the new active effect.
	 * @returns {Promise<void>}
	 */
	async createEffect(data = {})
	{
		await wfrp3e.documents.ActiveEffect.create({
			name: game.i18n.localize("DOCUMENT.ActiveEffect"),
			img: "icons/svg/dice-target.svg",
			...data
		}, {parent: this});
	}

	/**
	 * Prepares a characteristic check and shows a Check Builder to edit it. Rolls the check once edition is finished.
	 * @param {string} characteristic The name of the checked characteristic.
	 * @returns {Promise<void>}
	 */
	async performCharacteristicCheck(characteristic)
	{
		const diePool = await wfrp3e.applications.dice.CheckBuilder.wait({
			diePool: await wfrp3e.dice.DiePool.createFromCharacteristic(
				this,
				{name: characteristic, ...this.system.characteristics[characteristic]}
			)
		});
		await diePool.roll();
	}

	//#TODO Move this method in ActorDataModel.
	/**
	 * Gets the name of character's current stance.
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
	 * Adds or removes a specified number of segments on either side on the stance meter.
	 * @param {string} stance The name of the stance meter part that is getting adjusted.
	 * @param {number} amount The amount of segments added or removed.
	 * @returns {Promise<void>}
	 */
	async adjustStanceMeter(stance, amount)
	{
		if(this.system.stance[stance] + amount < 0)
			ui.notifications.warn(game.i18n.localize("CHARACTER.WARNINGS.minimumSegment"));

		await this.update({system: {stance: {[`${stance}`]: this.system.stance[stance] + amount}}});
	}

	/**
	 * Builds up the list of talent sockets available for the actor by talent type.
	 * @returns {Promise<void>}
	 */
	async buildSocketList()
	{
		const talentTypes = wfrp3e.data.items.Talent.TYPES,
			  socketsByType = Object.fromEntries(
				  ["any", ...Object.keys(talentTypes), "insanity"].map(key => [key, {}])
			  ),
			  currentCareer = this.system.currentCareer,
			  currentParty = this.system.currentParty;

		if(currentCareer) {
			const socketedItems = this.items.search({
				filters: [{
					field: "system.socket",
					operator: "is_empty",
					negate: true
				}]
			});

			for(const index in currentCareer.system.sockets) {
				const socket = currentCareer.system.sockets[index],
					  // Find a potential Item that would be socketed in that socket.
					  item   = socketedItems.find(item => item.system.socket === `${currentCareer.uuid}_${index}`);

				socketsByType[socket.type][currentCareer.uuid + "_" + index] = `${currentCareer.name} - ${item
					? game.i18n.format("TALENT.SOCKET.taken", {
						type: game.i18n.localize(`TALENT.TYPES.${socket.type}`),
						talent: item.name
					})
					: game.i18n.format("TALENT.SOCKET.available", {
						type: game.i18n.localize(`TALENT.TYPES.${socket.type}`)
					})}`;
			}
		}

		if(currentParty)
			for(const socketIndex in currentParty.system.sockets) {
				const socket = currentParty.system.sockets[socketIndex];
				let item = null;

				for(const member of currentParty.system.members) {
					// Find a potential Item that would be socketed in that socket.
					const actor = await fromUuid(member);

					item = actor?.items.search({
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
					})[0];

					if(item)
						break;
				}

				socketsByType[socket.type][currentParty.uuid + "_" + socketIndex] = `${currentParty.name} - ${item
						? game.i18n.format("TALENT.SOCKET.taken", {
							type: game.i18n.localize(`TALENT.TYPES.${socket.type}`),
							talent: item.name
						})
						: game.i18n.format("TALENT.SOCKET.available", {
							type: game.i18n.localize(`TALENT.TYPES.${socket.type}`)
						})}`;
			}

		for(const itemType of Object.keys(talentTypes))
			Object.assign(socketsByType[itemType], socketsByType["any"]);

		return socketsByType;
	}

	/**
	 * Buys a new advance on a specific career for the character.
	 * @param {Item} career The career containing the new advance.
	 * @param {string} type The type of the new advance.
	 * @returns {Promise<void>}
	 */
	async buyAdvance(career, type)
	{
		const {CareerAdvanceDialog} = wfrp3e.applications.apps;

		if(this.system.experience.current <= 0)
			return ui.notifications.warn(game.i18n.localize("CHARACTER.WARNINGS.noExperienceLeft"));

		switch(type) {
			case "action":
				const {ActionSelector} = wfrp3e.applications.apps.selectors;
				const actions = await ActionSelector.wait({
					items: await ActionSelector.buildOptionsList(this)
				});

				if(career.system.advances.action)
					throw new Error("Unable to buy the action advance: the career's action advance is unavailable.");

				await this.buyActionAdvance(actions[0], career, type);
				break;

			case "talent":
				const {TalentSelector} = wfrp3e.applications.apps.selectors;
				const talents = await TalentSelector.wait({
					items: await TalentSelector.buildAdvanceOptionsList(this, career)
				});

				if(career.system.advances.talent)
					throw new Error("Unable to buy the talent advance: the career's talent advance is unavailable.");

				await this.buyTalentAdvance(talents[0], career, type);
				break;

			case "skill":
				const {SkillUpgrader} = wfrp3e.applications.apps.selectors;

				if(career.system.advances.skill)
					throw new Error("Unable to buy the skill upgrade advance: the career's skill advance is unavailable.");

				const upgrades = await SkillUpgrader.wait({
					actor: this,
					advanceType: type,
					items: await SkillUpgrader.buildAdvanceOptionsList(this, career)
				});
				await this.buySkillAdvance(upgrades[0], career, type);
				break;

			case "careerTransition":
				const {CareerSelector} = wfrp3e.applications.apps.selectors;

				if(career.system.advances.careerTransition.newCareer)
					throw new Error("Unable to buy the advance: the career's transition advance is already used.");

				const careers = await CareerSelector.wait({
					actor: this,
					items: await CareerSelector.buildAdvanceOptionsList(this)
				});
				await this.changeCareer(careers[0], career);
				break;

			case "wound":
				await this.buyWoundAdvance(career, type);
				break;

			case "dedicationBonus":
				if(career.system.advances.dedicationBonus.length)
					throw new Error("Unable to buy the dedication bonus: it has already been bought for this career.");
				// Ensure a dedication bonus can only be bought if every advance of the career has been bought.
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
	 * Buys a new action advance on a specific career for the character.
	 * @param {string} actionUuid The uuid of the action that has been bought through the advance.
	 * @param {Item} career The career containing the new advance.
	 * @param {string} type The type of the bought advance.
	 * @returns {Promise<void>}
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

		await wfrp3e.documents.Item.createDocuments([action], {parent: this});
	}

	/**
	 * Buys a new characteristic advance on a specific career for the character.
	 * @param {Object} upgrade The characteristic upgrade infos.
	 * @param {Item} career The career containing the new advance.
	 * @param {string} type The type of the bought advance.
	 * @returns {Promise<void>}
	 */
	async buyCharacteristicAdvance(upgrade, career, type)
	{
		const advancementName = game.i18n.format(`CHARACTERISTICUPGRADER.characteristic${capitalize(upgrade.type)}`, {
				  characteristic: game.i18n.localize(wfrp3e.data.actors.Actor.CHARACTERISTICS[upgrade.characteristic].name)
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
	 * Buys a new conservative advance on a specific career for the character.
	 * @param {Item} career The career containing the new advance.
	 * @returns {Promise<void>}
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
	 * Buys the dedication bonus of a specific career for the character.
	 * @param {Item} career The career which dedication bonus is bought.
	 * @param {string} type The type of the bought advance.
	 * @returns {Promise<void>}
	 */
	async buyDedicationBonus(career, type)
	{
		if(career.system.advances.dedicationBonus.length)
			throw new Error("Unable to buy the dedication bonus: it has already been bought for this career.");

		// Fetch the skills that have been trained as a career advance.
		const regex = new RegExp(
				  `([A-Za-zÀ-ÖØ-öø-ÿ ]+\\b).* (${game.i18n.localize("SKILL.FIELDS.trainingLevel.label")})`,
				  "ui"
			  ),
			  skillAdvances = [
				  career.system.advances.skill,
				  ...career.system.advances.open.filter(advance => advance)
			  ],
			  trainedSkills = [];

		for(const advance of skillAdvances) {
			const matches = advance?.match(regex);
			if(matches)
				trainedSkills.push(this.itemTypes.skill.find(skill => skill.name === matches[1]));
		}

		// Let the user select one new specialisation for each skill that has been trained as a career advance.
		const upgrades = await wfrp3e.applications.apps.selectors.SkillUpgrader.wait({
			actor: this,
			items: trainedSkills,
			advanceType: type,
			size: trainedSkills.length
		});

		for(const upgrade of upgrades) {
			const skill = await fromUuid(upgrade.uuid);
			await skill.update({
				"system.specialisations": skill.system.specialisations
					? skill.system.specialisations + specialisation.value
					: specialisation.value
			});
		}

		// Mark the dedication bonus as acquired.
		await career.update({
			"system.advances.dedicationBonus": game.i18n.localize("CAREER.FIELDS.dedicationBonus.label")
		});
	}

	/**
	 * Buys a new reckless advance on a specific career for the character.
	 * @param {Item} career The career containing the new advance.
	 * @returns {Promise<void>}
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
	 * Buys a new skill advance on a specific career for the character.
	 * @param {Object} skillUpgrade The skill upgrade infos.
	 * @param {Item} career The career containing the new advance.
	 * @param {string} type The type of the bought advance.
	 * @returns {Promise<void>}
	 */
	async buySkillAdvance(skillUpgrade, career, type)
	{
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
				await wfrp3e.documents.Item.createDocuments([skill], {parent: this});
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
	 * Buys a new talent advance on a specific career for the character.
	 * @param {string} talentUuid The uuid of the talent that has been bought through the advance.
	 * @param {Item} career The career containing the new advance.
	 * @param {string} type The type of the bought advance.
	 * @returns {Promise<void>}
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

		await wfrp3e.documents.Item.createDocuments([talent], {parent: this});
	}

	/**
	 * Buys a new wound advance on a specific career for the character.
	 * @param {Item} career The career containing the new advance.
	 * @param {string} type The type of the bought advance.
	 * @returns {Promise<void>}
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
	 * Buys a career transition advance on a specific career for the character.
	 * @param {string} newCareerUuid The new career into which the transition is made.
	 * @param {Item} career The career containing the new advance.
	 * @returns {Promise<void>}
	 */
	async changeCareer(newCareerUuid, career)
	{
		if(career.system.advances.careerTransition.newCareer)
			throw new Error("Unable to buy the advance: the career's transition advance is already used.");

		let newCareer = await fromUuid(newCareerUuid),
			cost = career.calculateCareerTransitionCost(newCareer);

		newCareer = await wfrp3e.documents.Item.createDocuments([newCareer], {parent: this});
		await newCareer.update({"system.current": true});
		//TODO: Add Execute onCareerTransition scripts here.

		await career.update({
			"system.advances.careerTransition": {
				cost,
				newCareer: newCareer.name
			}
		});
	}

	/**
	 * Removes a Career's advance, resetting its cost and type.
	 * @param {Item} career The Career owning the advance.
	 * @param {string} type The advance type.
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
	 * Updates one of the character impairment values.
	 * @param {string} impairment The impairment to update.
	 * @param {Number} value The value to add to the impairment.
	 * @returns {Promise<void>}
	 */
	async adjustImpairment(impairment, value)
	{
		await this.update({[`system.impairments.${impairment}`]: this.system.impairments[impairment] + value});
	}

	/**
	 * Searches for items sharing the same socket as the one passed as parameter. If any found, removes its socket value.
	 * @param {Item} item The item which socket  must be matched.
	 */
	preventMultipleItemsOnSameSocket(item)
	{
		const actors = this.system.currentParty
				  ? this.system.currentParty.system.members.map(member => fromUuidSync(member))
				  : [this];

		for(const actor of actors) {
			const foundItems = actor.items.search({
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
			});

			for(const foundItem of foundItems)
				foundItem.update({"system.socket": null});
		}
	}

	/**
	 * Resets every matching socket available to the actor.
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
	 * Adds a new socket to the actor's list of sockets.
	 * @returns {Promise<void>}
	 */
	async addNewSocket()
	{
		await this.update({"system.sockets": [...this.system.sockets, {item: null, type: "any"}]});
	}

	/**
	 * Deletes a socket from the actor's list of sockets.
	 * @param {Number} index The index of the socket to remove.
	 * @returns {Promise<void>}
	 */
	async deleteSocket(index)
	{
		this.system.sockets.splice(index, 1);
		await this.update({"system.sockets": this.system.sockets});
	}

	/**
	 * Finds every Item owned by the actor with an effect triggered.
	 * @param {string} triggerType The trigger type of the effect.
	 * @param {Object} [parameters] The parameters passed to the condition script.
	 * @returns {Item[]} An Array of triggered items.
	 */
	findTriggeredItems(triggerType, parameters = {})
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
			this.system.currentCareer,
			...this.items.search({
				filters: [{
					field: "type",
					operator: "equals",
					value: "career"
				}, {
					field: "system.dedicationBonus",
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
					operator: "contains",
					value: ["career", "talent"],
					negate: true
				}, {
					field: "effects",
					operator: "is_empty",
					negate: true
				}]
			})
		].filter(item => item.effects.find(
			effect => {
				// Check for a match with the active effects trigger type, and if the condition script (if any) is passed.
				return effect.system.type === triggerType && effect.checkConditionScript(parameters);
			}
		));
	}

	/**
	 * Finds every effect triggered by a specific script trigger.
	 * @param {string} triggerType The trigger type of the effect.
	 * @param {Object} [parameters] The parameters passed to the condition script.
	 * @returns {ActiveEffect[]} An array of triggered active effects.
	 */
	findTriggeredEffects(triggerType, parameters = {})
	{
		return this.findTriggeredItems(triggerType, parameters).map(item => {
			return item.effects.find(effect => effect.system.type === triggerType)
		});
	}

	/**
	 * Inflicts a certain amount of fatigue to the actor.
	 * @param {Number} amount The amount of fatigue to inflict.
	 * @returns {Promise<void>}
	 */
	async inflictFatigue(amount)
	{
		if(this.system.impairments.fatigue !== undefined)
			await this.update({"system.impairments.fatigue": this.system.impairments.fatigue + amount});
	}

	/**
	 * Inflicts a certain amount of stress on the actor.
	 * @param {Number} amount The amount of stress to inflict.
	 * @returns {Promise<void>}
	 */
	async inflictStress(amount)
	{
		if(this.system.impairments.stress !== undefined)
			await this.update({"system.impairments.stress": this.system.impairments.stress + amount});
	}

	//#region Character methods
	
	/**
	 * Post-process a creation operation for a single character instance. Post-operation events occur for all connected clients.
	 * @param {Object} data The initial data object provided to the document creation request
	 * @param {Object} options Additional options which modify the creation request
	 * @param {string} userId The id of the user requesting the document update
	 * @protected
	 */
	_onCharacterCreate(data, options, userId)
	{
		if(this.system.party)
			this.update({"system.party": null});
	}

	//#endregion
	//#region Party methods

	/**
	 * Post-process a deletion operation for a single party instance. Post-operation events occur for all connected clients.
	 * @param {any} options Additional options which modify the deletion request.
	 * @param {string} userId The id of the user requesting the party deletion.
	 * @protected
	 */
	_onPartyDelete(options, userId)
	{
		for(const member of this.system.members)
			fromUuidSync(member).resetSockets(this.uuid);
	}

	/**
	 * Post-process an update operation for a single party instance. Post-operation events occur for all connected clients.
	 * @param {any} changed The differential data that was changed relative to the documents prior values.
	 * @param {any} options Additional options which modify the update request.
	 * @param {string} userId The id of the user requesting the party update.
	 * @protected
	 */
	_onPartyUpdate(changed, options, userId)
	{
		if(changed.system?.members)
			this.#onPartyMembersChange(changed.system.members);

		if(changed.system?.sockets)
			this.#onPartySocketsChange(changed.system.sockets);
	}

	/**
	 * Upon change to the party member list, ensures that sockets that are owned by removed members.
	 * and are associated with the party are reset.
	 * @param {string[]} newMemberList The list of every party member uuid.
	 * @private
	 */
	#onPartyMembersChange(newMemberList)
	{
		for(const member of this.system.members)
			if(!newMemberList.includes(member))
				fromUuidSync(member).resetSockets(this.uuid);
	}

	/**
	 * Upon change to any of the party socket's type, ensures that the sockets of every member are reset.
	 * @param {Object} sockets The current party sockets.
	 * @private
	 */
	#onPartySocketsChange(sockets)
	{
		for(const index in sockets) {
			const socket = sockets[index];

			if(fromUuidSync(socket.item)?.system.type !== socket.type)
				for(const member of this.system.members)
					fromUuidSync(member).resetSockets(this.uuid);
		}
	}

	/**
	 * Adds a character as a new member of the party.
	 * @param {Actor} actor
	 * @returns {Promise<void>}
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
	 * Opens the Party Event Editor to edit a party event.
	 * @param index {string} The index to the event to edit.
	 * @returns {Promise<void>}
	 */
	async editPartyEvent(index)
	{
		await new wfrp3e.applications.apps.PartyEventEditor({
			data: {
				event: this.system.tension.events[index],
				index,
				party: this
			}
		}).render(true);
	}

	/**
	 * Prompts a dialog to confirm the removal of an actor from the member list of the party.
	 * @param {Actor|string} actor Either the actor to remove or the member's uuid.
	 * @returns {Promise<void>}
	 */
	async removeMember(actor)
	{
		if(actor instanceof Actor)
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
