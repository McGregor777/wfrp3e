import WFRP3eActor from "../documents/WFRP3eActor.js";

/** @inheritDoc */
export default class CharacterGenerator extends FormApplication
{
	/**
	 * @param {WFRP3eActor} [object]
	 */
	constructor(object = {})
	{
		super(object);

		this.object = this.object instanceof WFRP3eActor ? object : new WFRP3eActor({
			name: "New Character",
			type: "character",
			prototypeToken: {name: "New Character"}
		});
	}

	/** @inheritDoc */
	get title()
	{
		return game.i18n.localize("CHARACTERGENERATOR.Title");
	}

	/** @inheritDoc */
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions, {
			classes: ["wfrp3e", "character-generator"],
			template: "systems/wfrp3e/templates/applications/character-generator.hbs",
			width: 920,
			height: 860,
			tabs: [{group: "talents", navSelector: ".talent-tabs", contentSelector: ".talents", initial: "focus"}]
		});
	}

	/** @inheritDoc */
	async getData()
	{
		const abilities = await game.packs.get("wfrp3e.items").getDocuments({type: "ability"});
		const data = mergeObject(super.getData(), Object.entries(CONFIG.WFRP3e.availableRaces).reduce((object, race) => {
			Object.entries(race[1].origins).forEach(origin => {
				object.origins[origin[0]] = mergeObject(origin[1], {
					creationPoints: race[1].creationPoints,
					defaultRatings: race[1].defaultRatings
				});

				origin[1].abilities.forEach(originAbilityName => {
					if(!object.originAbilities[originAbilityName])
						object.originAbilities[originAbilityName] = abilities.find(ability => ability.name === originAbilityName);
				});
			});

			return object;
		}, {origins: {}, originAbilities: {}}));

		await this._buildItemLists();

		this.origins = data.origins;
		this.originAbilities = data.originAbilities;
		this.selectedOrigin = data.origins.reiklander;
		this.selectedOriginName = "reiklander";

		return data;
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find("button.next").click(this._onNextButtonClick.bind(this, html));
		html.find("button.previous").click(this._onPreviousButtonClick.bind(this, html));

		html.find(".origins input").change(this._onOriginChange.bind(this, html));
		html.find('.step[data-step="origin-selection"] button.next').click(this._onOriginSelectionConfirmation.bind(this, html));
		html.find('.step[data-step="career-selection"] button.next').click(this._onCareerSelectionConfirmation.bind(this, html));
		html.find('.step[data-step="creation-point-investment"] button.next').click(this._onCreationPointsInvestmentConfirmation.bind(this, html));
		html.find('.step[data-step="skill-training"] button.next').click(this._onSkillTrainingConfirmation.bind(this, html));
		html.find('.step[data-step="talent-selection"] button.next').click(this._onTalentSelectionConfirmation.bind(this, html));
		html.find('.step[data-step="action-selection"] button.next').click(this._onActionSelectionConfirmation.bind(this, html));
	}

	/** @inheritDoc */
	async _updateObject(event, formData)
	{
		const newCharacter = await Actor.create({
			name: game.i18n.localize("CHARACTERGENERATOR.NewCharacter"),
			type: "character",
			system: {
				characteristics: Object.keys(CONFIG.WFRP3e.characteristics).reduce((object, characteristic) => {
					if(characteristic !== "varies")
						object[characteristic] = {rating: this.characteristicRatings[characteristic]};

					return object;
				}, {}),
				corruption: {max: this.characteristicRatings.toughness + this.selectedOrigin.corruption},
				origin: this.selectedOriginName,
				wounds: {
					max: this.characteristicRatings.toughness + this.selectedOrigin.wound,
					value: this.characteristicRatings.toughness + this.selectedOrigin.wound
				}
			}
		});

		// Get all the Basic Skills and the Advanced Skills that have been acquired then add them all to the New Character.
		const skills = await game.packs.get("wfrp3e.items").getDocuments({type: "skill", system: {advanced: false}});

		for(const sk of Object.entries(this.chosenTrainingsAndSpecialisations))
			if(!skills.find(skill => skill?._id === sk[0]) && sk[1].acquired)
				skills.push(await game.packs.get("wfrp3e.items").getDocument(sk[0]));

		await Item.createDocuments(skills.reduce((skills, skill) => {
			skills.push({
				name: skill.name,
				type: "skill",
				img: skill.img,
				system: {
					advanced: skill.system.advanced,
					characteristic: skill.system.characteristic,
					description: skill.system.description,
					specialisations: this.chosenTrainingsAndSpecialisations[skill._id]?.specialisations ?? "",
					trainingLevel: this.chosenTrainingsAndSpecialisations[skill._id]?.trainingLevel ?? 0
				}
			});
			return skills;
		}, []), {parent: newCharacter});

		await Item.createDocuments([this.selectedCareer], {parent: newCharacter})
			.then(careerCopy => careerCopy[0].update({system: {current: true}}));

		await Item.createDocuments([...this.selectedTalents.values(), ...this.finalActions], {parent: newCharacter});
	}

	async _buildItemLists()
	{
		this.talents = [];
		this.insanities = [];
		this.actions = [];

		for(const pack of [...game.packs.values()].filter(pack => pack.documentName === "Item")) {
			pack.getDocuments({type: "talent"}).then(foundTalents => {
				if(foundTalents.length > 0)
					this.talents.push(...foundTalents);
			});

			pack.getDocuments({type: "insanity"}).then(foundInsanities => {
				if(foundInsanities.length > 0)
					this.insanities.push(...foundInsanities);
			});

			pack.getDocuments({type: "action"}).then(foundActions => {
				if(foundActions.length > 0)
					this.actions.push(...foundActions);
			});
		}

		this.talents = this.talents.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
		this.insanities = this.insanities.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
		this.actions = this.actions.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
	}

	_onNextButtonClick(html, event)
	{
		event.preventDefault();
		event.stopPropagation();
	}

	_onPreviousButtonClick(html, event)
	{
		event.preventDefault();
		event.stopPropagation();

		const $currentStep = $(event.currentTarget).parents(".step");
		const $previousStep = $currentStep.prev(".step");

		$currentStep.removeClass("active");
		$previousStep.addClass("active");

		html.find(".step-names .active").removeClass("active");
		html.find(".step-names ." + $previousStep.data("step")).addClass("active");

		this._updateGauge($previousStep.data("step"), html.find(".step-gauge .step-gauge-fill")[0]);
	}

	_updateGauge(stepName, gauge)
	{
		const widthRate = 100 / 6;
		let width = "0%";

		switch(stepName) {
			case "career-selection":
				width = widthRate + "%";
				break;
			case "creation-point-investment":
				width = widthRate * 2 + "%";
				break;
			case "skill-training":
				width = widthRate * 3 + "%";
				break;
			case "talent-selection":
				width = widthRate * 4 + "%";
				break;
			case "action-selection":
				width = widthRate * 5 + "%";
				break;
			case "finish":
				width = "100%";
				break;
		}

		gauge.style.width = width;
	}

	_proceedToNextStep(html, event)
	{
		const $currentStep = html.find(".step.active");
		const $nextStep = $currentStep.next(".step");

		$currentStep.removeClass("active");
		$nextStep.addClass("active");

		html.find(".step-names .active").removeClass("active");
		html.find(".step-names ." + $nextStep.data("step")).addClass("active");

		this._updateGauge($nextStep.data("step"), html.find(".step-gauge .step-gauge-fill")[0]);
	}

	async _onOriginChange(html, event)
	{
		const rootElement = html.find('.step[data-step="origin-selection"]');

		this.selectedOriginName = event.currentTarget.value;
		this.selectedOrigin = this.origins[this.selectedOriginName];

		rootElement.find(".origins label.active").removeClass("active");
		$(event.currentTarget).parents("label").addClass("active");

		rootElement.find(".selected-origin").html(game.i18n.localize(this.selectedOrigin.name));
		rootElement.find(".origin-description").html(
			await renderTemplate("systems/wfrp3e/templates/partials/character-generator-origin-description.hbs", {
				origin: this.selectedOrigin,
				originAbilities: this.originAbilities
			})
		);
	}

	async _onOriginSelectionConfirmation(html, event)
	{
		this.freeTrainedSkill = null;

		if(this.selectedOrigin.abilities.includes("Children of Grungni"))
			await new Dialog({
				title: "Children of Grungni",
				content: "<p>Before investing any creation points, an Azgaraz dwarf may train one of the following skills – Discipline, Resilience or Weapon Skill.</p>",
				buttons: await this._prepareFreeSkillTrainingButtons(["0BSYtxTPqR72Tfuq", "LjSfvJxmSzqkU7NV", "xIkIYMUHDtUrqjY8"], html, event)
			}).render(true);
		else if(this.selectedOrigin.abilities.includes("Isha's Chosen"))
			await new Dialog({
				title: "Isha's Chosen",
				content: "<p>Before investing any creation points, a high elf may train one of the following skills – Discipline, Intuition or Observation.</p>",
				buttons: await this._prepareFreeSkillTrainingButtons(["0BSYtxTPqR72Tfuq", "QKcgRzxydB0cE22I", "PVY38LVHfi4ZxsI6"], html, event)
			}).render(true);
		else if(this.selectedOrigin.abilities.includes("Orion's Favoured"))
			await new Dialog({
				title: "Orion's Favoured",
				content: "<p>Before investing any creation points, a wood elf may train one of the following skills – Ballistic Skill, Nature Lore, Observation or Stealth.</p>",
				buttons: await this._prepareFreeSkillTrainingButtons(["ytY395HObq47bOhq", "wjAWNmMw9CMwEuZm", "PVY38LVHfi4ZxsI6", "J7ySozk1SB3VwGxl"], html, event)
			}).render(true);
		else
			await this._startCareerSelectionStep(html, event);
	}

	async _prepareFreeSkillTrainingButtons(skillIds, html, event)
	{
		const buttons = {};

		for(const skillId of skillIds) {
			const skill = await game.packs.get("wfrp3e.items").getDocument(skillId);

			buttons[skill.name] = {
				label: skill.name,
				callback: async dlg => {
					this.freeTrainedSkill = skill;
					await this._startCareerSelectionStep(html, event);
				}
			};
		}

		return buttons;
	}

	async _startCareerSelectionStep(html, event)
	{
		this._proceedToNextStep(html, event);

		const startingCareerRollTable = await game.packs.get("wfrp3e.roll-tables").getDocument(this.selectedOrigin.startingCareerRollTableId);
		const drawnCareers = new Map();

		do {
			await startingCareerRollTable.draw({displayChat: false}).then(async tableResult => {
				if(tableResult.results[0].type === 2 && !drawnCareers.has(tableResult.results[0].documentId))
					drawnCareers.set(
						tableResult.results[0].documentId,
						await game.packs.get("wfrp3e.items").getDocument(tableResult.results[0].documentId)
					);
			});
		} while(drawnCareers.size < 3);

		this.drawnCareers = [...drawnCareers.values()].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

		this.selectedCareer = this.drawnCareers[0];

		html.find(".careers").html(
			await renderTemplate("systems/wfrp3e/templates/partials/character-generator-career-selection.hbs", {
				drawnCareers: this.drawnCareers,
				characteristics: CONFIG.WFRP3e.characteristics
			})
		);
		html.find(".selected-career").html(this.selectedCareer.name);

		html.find(".careers .flip-link").click(this._onFlipClick.bind(this));
		html.find(".careers input").change(this._onCareerChange.bind(this, html));
	}

	/**
	 * Performs follow-up operations after clicks on a sheet's flip button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onFlipClick(event)
	{
		event.preventDefault();

		const parent = $(event.currentTarget).parents(".career-sheet");
		const activeFace = parent.find(".face.active");
		const inactiveFace = parent.find(".face:not(.active)");

		activeFace.removeClass("active");
		inactiveFace.addClass("active");
	}

	_onCareerChange(html, event)
	{
		this.selectedCareer = this.drawnCareers.find(career => career._id === event.currentTarget.value);

		html.find(".careers label.active").removeClass("active");
		$(event.currentTarget).parents("label").addClass("active");

		html.find(".selected-career").html(this.drawnCareers.find(career => career._id === event.currentTarget.value).name);
	}

	async _onCareerSelectionConfirmation(html, event)
	{
		this._proceedToNextStep(html, event);

		this.selectedCareer.system.current = true;

		this.priest = this.selectedCareer.system.talentSockets.includes("faith");
		this.wizard = this.selectedCareer.system.talentSockets.includes("order");
		this.zealot = this.selectedCareer.system.talentSockets.includes("insanity");

		const rootElement = html.find('.step[data-step="creation-point-investment"] .creation-point-investment');

		rootElement.html(
			await renderTemplate("systems/wfrp3e/templates/partials/character-generator-creation-point-investment.hbs", {
				characteristics: CONFIG.WFRP3e.characteristics,
				defaultRatings: this.selectedOrigin.defaultRatings
			})
		);

		this.characteristicRatings = Object.keys(CONFIG.WFRP3e.characteristics).reduce((object, characteristic) => {
			if(characteristic !== "varies")
				object[characteristic] = this.selectedOrigin.defaultRatings[characteristic];

			return object;
		}, {});
		this.wealthInvestment = 0;
		this.skillsInvestment = 0;
		this.talentsInvestment = 0;
		this.actionsInvestment = 0;

		this._updateRemainingCreationPointCount(html);

		rootElement.find(".characteristics .decrement-characteristic").click(this._onCharacteristicButtonClick.bind(this, html, -1));
		rootElement.find(".characteristics .increment-characteristic").click(this._onCharacteristicButtonClick.bind(this, html, 1));
		rootElement.find(".characteristics input").change(this._onCharacteristicChange.bind(this, html));
		rootElement.find('.wealth input').click(this._onInvestmentChange.bind(this, html, "wealth"));
		rootElement.find('.skills input').click(this._onInvestmentChange.bind(this, html, "skills"));
		rootElement.find('.talents input').click(this._onInvestmentChange.bind(this, html, "talents"));
		rootElement.find('.actions input').click(this._onInvestmentChange.bind(this, html, "actions"));
	}

	_onCharacteristicButtonClick(html, value, event)
	{
		event.preventDefault();
		event.stopPropagation();

		const characteristicInput = $(event.currentTarget).siblings("input")[0];
		const newCharacteristicValue = parseInt(characteristicInput.value) + value;
		let currentInvestment = 0;

		for(let i = this.selectedOrigin.defaultRatings[characteristicInput.name] + 1; i <= parseInt(characteristicInput.value); i++) {
			currentInvestment += i;
		}

		if(newCharacteristicValue < this.selectedOrigin.defaultRatings[characteristicInput.name])
			ui.notifications.warn(game.i18n.format("CHARACTERGENERATOR.WARNING.MinimumRatingReached"));
		else if(newCharacteristicValue > 5)
			ui.notifications.warn(game.i18n.format("CHARACTERGENERATOR.WARNING.MaximumRatingReached"));
		else if(this.remainingCreationPoints + currentInvestment < newCharacteristicValue)
			ui.notifications.warn(game.i18n.format("CHARACTERGENERATOR.WARNING.NotEnoughCreationPoints"));
		else {
			characteristicInput.value = newCharacteristicValue;

			this.characteristicRatings[characteristicInput.name] = newCharacteristicValue;

			this._updateRemainingCreationPointCount(html);
		}
	}

	_onCharacteristicChange(html, event)
	{
		event.currentTarget.value = Math.min(Math.max(event.currentTarget.value, this.selectedOrigin.defaultRatings[event.currentTarget.name]), 5);

		this.characteristicRatings[event.currentTarget.name] = event.currentTarget.value;

		this._updateRemainingCreationPointCount(html);
	}

	_onInvestmentChange(html, type, event)
	{
		const newValue = parseInt(event.currentTarget.value);

		if(this.remainingCreationPoints + this[type + "Investment"] < newValue) {
			event.preventDefault();
			event.stopPropagation();

			ui.notifications.warn(game.i18n.format("CHARACTERGENERATOR.WARNING.NotEnoughCreationPoints"));
		}
		else {
			this[type + "Investment"] = newValue;

			html.find('.step[data-step="creation-point-investment"] .creation-point-investment .' + type + ' label.active').removeClass("active");
			$(event.currentTarget).parents("label").addClass("active");

			this._updateRemainingCreationPointCount(html);
		}
	}

	_updateRemainingCreationPointCount(html)
	{
		const rootElement = html.find('.step[data-step="creation-point-investment"]');
		const characteristicInvestment = Object.entries(this.selectedOrigin.defaultRatings).reduce((investment, defaultRating) => {
			for(let i = defaultRating[1] + 1;
				i <= parseInt(rootElement.find('.creation-point-investment .characteristics input[name="' + defaultRating[0] + '"]')[0].value);
				i++) {
				investment += i;
			}

			return investment;
		}, 0);

		this.remainingCreationPoints = this.selectedOrigin.creationPoints
			- characteristicInvestment
			- this.wealthInvestment
			- this.skillsInvestment
			- this.talentsInvestment
			- this.actionsInvestment;

		rootElement.find(".remaining-creation-points").html(this.remainingCreationPoints);
	}

	async _onCreationPointsInvestmentConfirmation(html, event)
	{
		this._proceedToNextStep(html, event);

		this.careerSkills = this.selectedCareer.system.careerSkills;

		// Get every Career Skills from the Game System compendium.
		this.careerSkills = await game.packs.get("wfrp3e.items").getDocuments({type: "skill"}).then(skills => {
			return skills
				.filter(skill => this.careerSkills.includes(skill.name))
				.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
		});

		// If a skill has been trained for free, add it to the list of Career Skills.
		if(this.freeTrainedSkill && !this.careerSkills.find(skill => skill._id === this.freeTrainedSkill._id))
			this.careerSkills.push(this.freeTrainedSkill);

		this.chosenTrainingsAndSpecialisations = this.careerSkills.reduce((object, skill) => {
			object[skill._id] = {
				acquired: !skill.system.advanced,
				specialisations: "",
				trainingLevel: 0
			};
			return object;
		}, {});

		// If a Skill has been trained for free (thanks to a racial ability such as Children of Grungni),
		// make sure that it is shown and treated as such.
		if(this.freeTrainedSkill)
			this.chosenTrainingsAndSpecialisations.hasOwnProperty(this.freeTrainedSkill._id) ?
				this.chosenTrainingsAndSpecialisations[this.freeTrainedSkill._id].trainingLevel = 1 :
				this.chosenTrainingsAndSpecialisations[this.freeTrainedSkill._id] = {
					acquired: true,
					specialisations: "",
					trainingLevel: 1
				};

		// If an advanced Skill has already been acquired for free (thanks to a racial ability such as Erudite),
		// make sure that it is shown and treated as such.
		if(this.selectedOrigin.abilities.includes("Erudite"))
			this.chosenTrainingsAndSpecialisations.hasOwnProperty("zkAmp7J3kXPnrGDE") ?
				this.chosenTrainingsAndSpecialisations["zkAmp7J3kXPnrGDE"].acquired = true :
				this.chosenTrainingsAndSpecialisations["zkAmp7J3kXPnrGDE"] = {
					acquired: true,
					specialisations: "",
					trainingLevel: 0
				};

		// If the new character is a Wizard, Channelling and Spellcraft advanced skills are acquired for free.
		if(this.wizard) {
			this.chosenTrainingsAndSpecialisations["6hyilRndUzF1D6EF"].acquired = true;
			this.chosenTrainingsAndSpecialisations["ky9SLMgQU6Sfjg46"].acquired = true;
		}

		const rootElement = html.find('.step[data-step="skill-training"] .skill-training');

		rootElement.html(
			await renderTemplate("systems/wfrp3e/templates/partials/character-generator-skill-training.hbs", {
				careerSkills: this.careerSkills,
				skills: this.chosenTrainingsAndSpecialisations,
				characteristics: CONFIG.WFRP3e.characteristics
			})
		);

		rootElement.find("tbody .skill-acquired input").change(this._onSkillAcquirementChange.bind(this, html));
		rootElement.find("tbody .skill-training-level input").change(this._onSkillTrainingLevelChange.bind(this, html));
		rootElement.find("tbody .skill-specialisations input").change(this._onSpecialisationsChange.bind(this, html));

		this.remainingSkillTrainings = this.skillsInvestment + 1;

		this._updateRemainingSkillTrainingsAndSpecialisations(html);
	}

	_onSkillAcquirementChange(html, event)
	{
		if(!event.currentTarget.checked) {
			const row = $(event.currentTarget).parents('tr');
			const specialisationInput = row.find(".skill-specialisations input")[0];

			this.remainingSkillTrainings++;

			row.find(".skill-training-level input:checked").each((index, element) => {
				element.checked = false;
				this.remainingSkillTrainings++;
			});

			specialisationInput.value = null;
			specialisationInput.disabled = true;
		}
		else if(this.remainingSkillTrainings >= 1)
			this.remainingSkillTrainings--;
		else {
			event.preventDefault();
			event.stopPropagation();

			event.currentTarget.checked = false;

			ui.notifications.warn(game.i18n.format("CHARACTERGENERATOR.WARNING.NotEnoughSkillTrainings"));
		}

		this._updateRemainingSkillTrainingsAndSpecialisations(html);
	}

	_onSkillTrainingLevelChange(html, event)
	{
		const row = $(event.currentTarget).parents('tr');
		const acquisitionInput = row.find(".skill-acquired input")[0];
		const specialisationInput = row.find(".skill-specialisations input")[0];

		if(!event.currentTarget.checked) {
			this.remainingSkillTrainings++;

			specialisationInput.value = null;
			specialisationInput.disabled = true;
		}
		else if(!acquisitionInput.checked && this.remainingSkillTrainings >= 2) {
			this.remainingSkillTrainings -= 2;

			acquisitionInput.checked = true;
			specialisationInput.disabled = false;
		}
		else if(acquisitionInput.checked && this.remainingSkillTrainings >= 1) {
			this.remainingSkillTrainings--;

			specialisationInput.disabled = false;
		}
		else {
			event.preventDefault();
			event.stopPropagation();

			event.currentTarget.checked = false;

			ui.notifications.warn(game.i18n.format("CHARACTERGENERATOR.WARNING.NotEnoughSkillTrainings"));
		}

		this._updateRemainingSkillTrainingsAndSpecialisations(html);
	}

	_onSpecialisationsChange(html, event)
	{
		const skillId = $(event.currentTarget).parents("tr").data("skillId");
		const regex = new RegExp("\s*([A-Za-zÀ-ÖØ-öø-ÿ ]+),?", "gu");
		const matches = [...event.currentTarget.value.trim().matchAll(regex)];

		if(matches.length >= 1) {
			const originalValue = this.chosenTrainingsAndSpecialisations[skillId].specialisations;

			if(this.remainingSpecialisations + [...originalValue.matchAll(regex)].length >= matches.length) {
				let newValue = "";

				matches.forEach(match => newValue === ""
					? newValue = match[1].trim()
					: newValue += ", " + match[1].trim()
				);

				event.currentTarget.value = newValue;
				this.chosenTrainingsAndSpecialisations[skillId].specialisations = newValue;
			}
			else if(this.remainingSpecialisations < matches.length) {
				event.preventDefault();
				event.stopPropagation();

				event.currentTarget.value = originalValue;

				ui.notifications.warn(game.i18n.format("CHARACTERGENERATOR.WARNING.NotEnoughSpecialisations"));
			}
		}
		else
			this.chosenTrainingsAndSpecialisations[skillId].specialisations = "";


		this._updateRemainingSkillTrainingsAndSpecialisations(html);
	}

	_updateRemainingSkillTrainingsAndSpecialisations(html)
	{
		const rootElement = html.find('.step[data-step="skill-training"]');

		rootElement.find("tbody > tr").each((index, element) => {
			const skillId = element.dataset.skillId;

			this.chosenTrainingsAndSpecialisations[skillId].acquired = $(element).find('input[name="' + skillId + '_acquisition"]:checked').length > 0;
			this.chosenTrainingsAndSpecialisations[skillId].trainingLevel = $(element).find('input[name="' + skillId + '_trainingLevel"]:checked').length;
		});

		const specialisationCount = [...rootElement.find("tbody .skill-specialisations input:not(:disabled)")
			.filter((index, input) => input.value !== "")]
			.reduce((count, input) => {
				count += [...input.value.trim().matchAll(new RegExp("\s*([A-Za-zÀ-ÖØ-öø-ÿ ]+),?", "gu"))].length;
				return count;
			}, 0);

		this.remainingSpecialisations = Math.max(this.skillsInvestment - 1 - specialisationCount, 0);

		rootElement.find('.remaining-skill-trainings').html(this.remainingSkillTrainings);
		rootElement.find('.remaining-specialisations').html(this.remainingSpecialisations);
	}

	_onTabClick(html, event)
	{
		const tabGroupName = event.currentTarget.parentElement.dataset.group;
		const tabName = event.currentTarget.dataset.tab;
		const tabLinks = html.find('.tabs[data-group="' + tabGroupName + '"] .tab-link');
		const tabs = html.find('.tab[data-group="' + tabGroupName + '"]');

		tabLinks.removeClass("active");
		tabLinks.filter('[data-tab="' + tabName + '"]').addClass("active");

		tabs.removeClass("active");
		tabs.filter('[data-tab="' + tabName + '"]').addClass("active");
	}

	async _onSkillTrainingConfirmation(html, event)
	{
		this._proceedToNextStep(html, event);

		this.selectedTalents = new Map();

		if(this.talentsInvestment >= 1 || this.selectedOrigin.abilities.includes("Erudite") || this.priest || this.wizard || this.zealot) {
			const talents = Object.keys(CONFIG.WFRP3e.talentTypes).reduce((everyTalents, talentType) => {
				everyTalents[talentType] = this.talents.filter(talent => talent.system.type === talentType);
				return everyTalents;
			}, {});

			const rootElement = html.find('.step[data-step="talent-selection"] .talent-selection');

			rootElement.html(
				await renderTemplate("systems/wfrp3e/templates/partials/character-generator-talent-selection.hbs", {
					talents: talents,
					insanities: this.insanities,
					talentsInvestment: this.talentsInvestment >= 1,
					erudite: this.selectedOrigin.abilities.includes("Erudite"),
					priest: this.priest,
					wizard: this.wizard,
					zealot: this.zealot
				})
			);

			rootElement.find(".talent-tabs .tab-link").click(this._onTabClick.bind(this, html));
			rootElement.find("input").change(this._onTalentChange.bind(this, html));

			this._updateRemainingTalents(html);
		}
		else
			this._onTalentSelectionConfirmation(html, event);
	}

	_onTalentChange(html, event)
	{
		if(!event.currentTarget.checked) {
			this.selectedTalents.delete(event.currentTarget.value);
			$(event.currentTarget.parentElement).removeClass("active");
		}
		// Handle free Focus Talent selection for High Elves.
		else if($(event.currentTarget).parents('.tab[data-tab="focus"]').length > 0) {
			if(this.remainingFreeFocusTalents < 1 && this.remainingTalents < 1)
				this._sendTalentError(event, game.i18n.format("CHARACTERGENERATOR.WARNING.NotEnoughTalents"));
			else
				this._selectTalent(event);
		}
		// Handle free Faith Talent for Priest characters.
		else if($(event.currentTarget).parents('.tab[data-tab="faith"]').length > 0) {
			if(this.remainingFreeFaithTalents < 1)
				this._sendTalentError(event, game.i18n.format("CHARACTERGENERATOR.WARNING.FaithTalentAlreadySelected"));
			else
				this._selectTalent(event);
		}
		// Handle free Order Talent for Wizard characters.
		else if($(event.currentTarget).parents('.tab[data-tab="order"]').length > 0) {
			if(this.remainingFreeOrderTalents < 1)
				this._sendTalentError(event, game.i18n.format("CHARACTERGENERATOR.WARNING.OrderTalentAlreadySelected"));
			else
				this._selectTalent(event);
		}
		// Handle free Insanity for Zealot characters.
		else if($(event.currentTarget).parents('.tab[data-tab="insanity"]').length > 0) {
			if(this.remainingFreeInsanities < 1)
				this._sendTalentError(event, game.i18n.format("CHARACTERGENERATOR.WARNING.InsanityAlreadySelected"));
			else
				this._selectTalent(event);
		}
		// Handle regular case.
		else if(this.remainingTalents >= 1)
			this._selectTalent(event);
		else
			this._sendTalentError(event, game.i18n.format("CHARACTERGENERATOR.WARNING.NotEnoughTalents"));

		this._updateRemainingTalents(html);
	}

	_selectTalent(event)
	{
		const selectedTalent = this.talents.find(talent => talent._id === event.currentTarget.value);

		this.selectedTalents.set(selectedTalent._id, selectedTalent);

		$(event.currentTarget.parentElement).addClass("active");
	}

	_sendTalentError(event, errorNotification)
	{
		event.preventDefault();
		event.stopPropagation();

		event.currentTarget.checked = false;

		ui.notifications.warn(errorNotification);
	}

	_updateRemainingTalents(html)
	{
		const rootElement = html.find('.step[data-step="talent-selection"]');
		const remainingTalentsCounter = rootElement.find('.remaining-talents');
		const remainingFocusTalentsCounter = rootElement.find('.remaining-focus-talents');
		const remainingFaithTalentsCounter = rootElement.find('.remaining-faith-talents');
		const remainingOrderTalentsCounter = rootElement.find('.remaining-order-talents');
		const remainingInsanityTalentsCounter = rootElement.find('.remaining-insanities');

		const selectedTalentCounts = Object.keys(CONFIG.WFRP3e.talentTypes).reduce((types, talentType) => {
			types[talentType] = rootElement.find('.tab[data-tab="' + talentType + '"] input:checked').length;
			return types;
		}, {});

		// Handle free Focus Talent selection for characters owning the Composure ability.
		if(this.selectedOrigin.abilities.includes("Composure")) {
			this.remainingFreeFocusTalents = Math.max(1 - selectedTalentCounts.focus, 0);
			selectedTalentCounts.focus = Math.max(selectedTalentCounts.focus - 1, 0);

			remainingFocusTalentsCounter.parent().css({display: "block"});
		}
		else {
			this.remainingFreeFocusTalents = 0;
			remainingFocusTalentsCounter.parent().css({display: "none"});
		}
		remainingFocusTalentsCounter.html(this.remainingFreeFocusTalents);

		// Handle free Faith Talent for Priest characters.
		if(this.priest) {
			this.remainingFreeFaithTalents = Math.max(1 - selectedTalentCounts.faith, 0);
			selectedTalentCounts.faith = Math.max(selectedTalentCounts.faith - 1, 0);

			remainingFaithTalentsCounter.parent().css({display: "block"});
		}
		else {
			this.remainingFreeFaithTalents = 0;
			remainingFaithTalentsCounter.parent().css({display: "none"});
		}
		remainingFaithTalentsCounter.html(this.remainingFreeFaithTalents);

		// Handle free Order Talent for Wizard characters.
		if(this.wizard) {
			this.remainingFreeOrderTalents = Math.max(1 - selectedTalentCounts.order, 0);
			selectedTalentCounts.order = Math.max(selectedTalentCounts.order - 1, 0);

			remainingOrderTalentsCounter.parent().css({display: "block"});
		}
		else {
			this.remainingFreeOrderTalents = 0;
			remainingOrderTalentsCounter.parent().css({display: "none"});
		}
		remainingOrderTalentsCounter.html(this.remainingFreeOrderTalents);

		// Handle free Insanity for Zealot characters.
		if(this.zealot) {
			this.remainingFreeInsanities = Math.max(1 - selectedTalentCounts.insanity, 0);
			selectedTalentCounts.insanity = Math.max(selectedTalentCounts.insanity - 1, 0);

			remainingInsanityTalentsCounter.parent().css({display: "block"});
		}
		else {
			this.remainingFreeInsanities = 0;
			remainingInsanityTalentsCounter.parent().css({display: "none"});
		}
		remainingInsanityTalentsCounter.html(this.remainingFreeInsanities);

		if(this.talentsInvestment > 0) {
			this.remainingTalents = Math.max(this.talentsInvestment - Object.values(selectedTalentCounts).reduce((totalCount, talentCount) => {
				return totalCount + talentCount;
			}, 0), 0);

			remainingTalentsCounter.parent().css({display: "block"});
		}
		else {
			this.remainingTalents = 0;
			remainingTalentsCounter.parent().css({display: "none"});
		}
		remainingTalentsCounter.html(this.remainingTalents);
	}

	async _onTalentSelectionConfirmation(html, event)
	{
		this._proceedToNextStep(html, event);

		const actions = Object.keys(CONFIG.WFRP3e.actionTypes).reduce((everyActions, actionType) => {
			everyActions[actionType] = this.actions.filter(action => {
				return action.system.type === actionType && !action.system.conservative.traits.includes("Basic")
			});

			return everyActions;
		}, {});

		actions.basic = this.actions.filter(action => action.system.conservative.traits.includes("Basic"));

		this.selectedActions = new Map();

		const rootElement = html.find('.step[data-step="action-selection"] .action-selection');

		if(this.priest) {
			let faithName = null;
			const talent = this.talents.find(
				talent => talent._id === html.find('.step[data-step="talent-selection"] .talent-selection .tab[data-tab="faith"] input:checked').val()
			);
			const match = talent.name.match(new RegExp(/([\w\s]+),?/));

			if(match)
				faithName = match[1];

			actions.blessing = actions.blessing.filter(action => action.system.reckless.traits.includes(faithName));
		}
		else if(this.wizard) {
			let orderName = null;
			const talent = this.talents.find(
				talent => talent._id === html.find('.step[data-step="talent-selection"] .talent-selection .tab[data-tab="order"] input:checked').val()
			);
			const match = talent.name.match(new RegExp(/([\w\s]+), ?[\w\s]+, ?([\w\s]+)/));

			if(match)
				orderName = match[2] ?? match[1];

			actions.spell = actions.spell.filter(action => action.system.reckless.traits.includes(orderName));
		}

		rootElement.html(
			await renderTemplate("systems/wfrp3e/templates/partials/character-generator-action-selection.hbs", {
				actions: actions,
				stances: CONFIG.WFRP3e.stances,
				symbols: CONFIG.WFRP3e.symbols,
				priest: this.priest,
				wizard: this.wizard
			})
		);

		rootElement.find(".action-tabs .tab-link").click(this._onTabClick.bind(this, html));
		rootElement.find("input").change(this._onActionChange.bind(this, html));

		this._updateRemainingActions(html);
	}

	_onActionChange(html, event)
	{
		// Handle Spells and Blessings with higher Ranks.

		if(!event.currentTarget.checked) {
			this.selectedActions.delete(event.currentTarget.value);

			$(event.currentTarget.parentElement).removeClass("active");
		}
		else if(this.remainingActions >= 1) {
			const selectedAction = this.actions.find(action => action._id === event.currentTarget.value);

			this.selectedActions.set(selectedAction._id, selectedAction);

			$(event.currentTarget.parentElement).addClass("active");
		}
		else {
			event.preventDefault();
			event.stopPropagation();

			event.currentTarget.checked = false;

			ui.notifications.warn(game.i18n.format("CHARACTERGENERATOR.WARNING.NotEnoughActions"));
		}

		this._updateRemainingActions(html);
	}

	_updateRemainingActions(html)
	{
		const rootElement = html.find('.step[data-step="action-selection"]');
		const remainingActionsCounter = rootElement.find('.remaining-actions');

		const selectedActionCounts = Object.keys(CONFIG.WFRP3e.actionTypes).reduce((types, actionType) => {
			types[actionType] = rootElement.find('.tab[data-tab="' + actionType + '"] input:checked').length;
			return types;
		}, {});

		this.remainingActions = Math.max(this.actionsInvestment + 1 - Object.values(selectedActionCounts).reduce((totalCount, actionCount) => {
			return totalCount + actionCount;
		}, 0), 0);
		remainingActionsCounter.html(this.remainingActions);
	}

	async _onActionSelectionConfirmation(html, event)
	{
		this._proceedToNextStep(html, event);

		// Add Melee Strike and Ranged Shot.
		this.finalActions = [
			this.actions.find(action => action._id === "p2xGIjTGnNjpaHU5"),
			this.actions.find(action => action._id === "mMAwCsFBJlBmpWrH")
		];

		// Add every Basic Support Actions, except Block, Dodge and Parry if their requirements are not met.
		this.actions
			.filter(action => action.system.type === "support" && action.system.conservative.traits.includes("Basic"))
			.forEach(action => {
				if((action._id === "gevnvkwHS62NBrpf" && this.characteristicRatings.toughness >= 3)
					|| (action._id === "eXHXyTK445ZEARTB" && this.characteristicRatings.agility >= 3)
					|| (action._id === "mc4fvpsRYGZ3K7Nj" && this.characteristicRatings.strength >= 3)
					|| !["gevnvkwHS62NBrpf", "eXHXyTK445ZEARTB", "mc4fvpsRYGZ3K7Nj"].includes(action._id))
					this.finalActions.push(action);
			});

		if(this.priest) {
			// Add Curry Favour to Priests who have acquired Piety.
			if(this.chosenTrainingsAndSpecialisations["ud3VIku7SIKfHljT"].acquired)
				this.finalActions.push(this.actions.find(action => action._id === "b1Zbbl8fybXf8gkI"));

			// Add Minor Blessing, Minor Ward, and Blessing of Health to Priests who have acquired Invocation.
			if(this.chosenTrainingsAndSpecialisations["ekPGMSRCHYlLWWZS"].acquired)
				this.finalActions.push(...this.actions.filter(action => action.system.type === "blessing"
					&& action.system.reckless.traits.includes("Basic")
					&& action._id !== "b1Zbbl8fybXf8gkI"));
		}

		// Add Channel Power, Magic Dart, Cantrip, Counterspell and Quickcasting to Wizards.
		if(this.wizard)
			this.finalActions.push(...this.actions.filter(action => action.system.type === "spell"));

		this.finalActions.push(...this.selectedActions.values());

		const rootElement = html.find('.step[data-step="finish"] .finish');

		rootElement.html(
			await renderTemplate("systems/wfrp3e/templates/partials/character-generator-finish.hbs", {
				actions: this.finalActions,
				origin: this.selectedOrigin,
				originAbilities: this.originAbilities,
				career: this.selectedCareer,
				careerSkills: this.careerSkills,
				characteristics: CONFIG.WFRP3e.characteristics,
				characteristicRatings: this.characteristicRatings,
				skills: this.chosenTrainingsAndSpecialisations,
				talents: this.selectedTalents ? [...this.selectedTalents.values()] : false,
				stances: CONFIG.WFRP3e.stances,
				symbols: CONFIG.WFRP3e.symbols
			})
		);
	}
}