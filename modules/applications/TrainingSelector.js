/** @inheritDoc */
export default class TrainingSelector extends FormApplication
{
	constructor(object, career, nonCareer = false, options = {})
	{
		super(object, options);

		this.career = career;
		this.nonCareer = nonCareer;
		this.training = null;
	}

	/** @inheritDoc */
	get title()
	{
		return game.i18n.localize("TRAININGSELECTOR.Title");
	}

	/** @inheritDoc */
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "selector", "training-selector"],
			template: "systems/wfrp3e/templates/applications/training-selector.hbs",
			width: 800
		};
	}

	/** @inheritDoc */
	async getData()
	{
		await this._buildSkillLists();

		return {
			...super.getData(),
			careerSkills: this.careerSkills,
			characteristics: CONFIG.WFRP3e.characteristics
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find("input").change(this._onTrainingChange.bind(this, html));
	}

	/** @inheritDoc */
	async _updateObject(event, formData)
	{
		if(!this.training)
			ui.notifications.warn(game.i18n.localize("TRAININGSELECTOR.NoTrainingSelectedWarning"));

		if(!this.nonCareer)
			this.career.update({"system.advances.skill": this.training.advancementName});
		else {
			const updates = {"system.advances.nonCareer": this.career.system.advances.nonCareer};
			updates["system.advances.nonCareer"][updates["system.advances.nonCareer"].findIndex(advance => advance.type == null)] = {
				cost: this.training.skill.system.advanced ? 4 : 2,
				type: this.training.advancementName
			};
			
			this.career.update(updates);
		}

		if(this.training.skill.parent) {
			const updates = {};

			this.training.path.split('.').reduce((object, property, index, array) => {
				object[property] = index === array.length - 1 ? this.training.value : object[property] || {};
				return object[property];
			}, updates);

			this.training.skill.update(updates);
		}
		else
			await Item.createDocuments([this.training.skill], {parent: this.object});
	}

	async _buildSkillLists()
	{
		// Get every Career Skills from the Game System compendium.
		const careerSkills = await game.packs.get("wfrp3e.items").getDocuments({type: "skill"}).then(skills => {
			return skills
				.filter(skill => this.nonCareer
					? !this.career.system.careerSkills.includes(skill.name)
					: this.career.system.careerSkills.includes(skill.name))
				.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
		});

		for(let i = 0; i < careerSkills.length; i++)
			careerSkills[i] = this.object.itemTypes.skill.find(skill => skill.name === careerSkills[i].name) ?? careerSkills[i];

		this.careerSkills = careerSkills;
	}

	async _onTrainingChange(html, event)
	{
		if(event.currentTarget.checked) {
			this.training = {
				path: event.currentTarget.name,
				value: event.currentTarget.value,
				skill: this.careerSkills.find(skill => skill._id === $(event.currentTarget).parents("tr").data("skillId"))
			};

			let advancementName = this.training.skill.name;

			if(this.training.path.includes("trainingLevel"))
				advancementName += " - " + game.i18n.format("TRAININGSELECTOR.NewTrainingLevel", {level: this.training.value});
			else if(this.training.path.includes("specialisations"))
				advancementName += " - " + game.i18n.format("TRAININGSELECTOR.NewSpecialisation", {specialisation: this.training.value});

			html.find(".selection").text(advancementName);

			this.training.advancementName = advancementName;
		}
		else {
			this.training = null;

			html.find(".selection").text(game.i18n.localize("TRAININGSELECTOR.NoTrainingSelected"));
		}
	}
}