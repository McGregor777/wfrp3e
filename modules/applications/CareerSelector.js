/** @inheritDoc */
export default class CareerSelector extends FormApplication
{
	constructor(object, career, options = {})
	{
		super(object, options);

		this.career = career;
	}

	/** @inheritDoc */
	get title()
	{
		return game.i18n.localize("CAREERSELECTOR.Title");
	}

	/** @inheritDoc */
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "selector", "career-selector"],
			template: "systems/wfrp3e/templates/applications/career-selector.hbs",
			tabs: [{group: "careers", navSelector: ".career-tabs", contentSelector: ".careers", initial: "basic"}],
			width: 920,
			height: 835
		};
	}

	/** @inheritDoc */
	async getData()
	{
		await this._buildCareerLists();

		return {
			...super.getData(),
			careers: this.careers,
			characteristics: CONFIG.WFRP3e.characteristics
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".career-sheet .flip-link").click(this._onFlipClick.bind(this));
		html.find(".item-container input").change(this._onCareerChange.bind(this, html));
	}

	/** @inheritDoc */
	async _updateObject(event, formData)
	{
		const selectedCareer = this.allCareers.find(career => career._id === formData.career);

		if(!selectedCareer)
			ui.notifications.warn(game.i18n.localize("CAREERSELECTOR.NoCareerSelectedWarning"));
		else if(this._calculateExperiencePointCost(this.object.system.currentCareer, selectedCareer))
			ui.notifications.warn(game.i18n.localize("CAREERSELECTOR.NotEnoughExperiencePoint"));

		this.career.update({
			system: {
				advances: {careerTransition: selectedCareer.name},
				current: false
			}
		});

		await Item.createDocuments([selectedCareer], {parent: this.object}).then(career => {
			career.update({"system.current": true});
		});
	}

	async _buildCareerLists()
	{
		let careers = [];

		for(const pack of [...game.packs.values()].filter(pack => pack.documentName === "Item")) {
			await pack.getDocuments({type: "career"}).then(foundCareers => {
				if(foundCareers.length > 0)
					careers.push(...foundCareers);
			});
		}

		this.allCareers = careers.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

		careers = careers.reduce((sortedCareers, career) => {
			if(career.system.raceRestrictions.includes(this.object.system.race)
				|| career.system.raceRestrictions.includes("any"))
				career.system.advanced ? sortedCareers.advanced.push(career) : sortedCareers.basic.push(career);

			return sortedCareers;
		}, {basic: [], advanced: []});

		this.careers = careers;
	}

	async _onCareerChange(html, event)
	{
		html.find("label.active").removeClass("active");
		$(event.currentTarget).parents("label").addClass("active");

		const selectedCareer = this.allCareers.find(career => career._id === event.currentTarget.value);

		html.find(".selection").text(`${selectedCareer.name} (${game.i18n.format("CAREERSELECTOR.ExperienceCost", {
			cost: this._calculateExperiencePointCost(this.object.system.currentCareer, selectedCareer)
		})})`);
	}

	/**
	 * Performs follow-up operations after clicks on a sheet's flip button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onFlipClick(event)
	{
		event.preventDefault();

		const parent = $(event.currentTarget).parents(".career-sheet");
		const activeFace = parent.find(".face.active");
		const inactiveFace = parent.find(".face:not(.active)");

		activeFace.removeClass("active");
		inactiveFace.addClass("active");
	}

	/**
	 * Calculates the Experience cost of a new Career depending on the current Career.
	 * @param {WFRP3eItem} currentCareer The current Career.
	 * @param {WFRP3eItem} otherCareer The new Career.
	 * @returns {number}
	 * @private
	 */
	_calculateExperiencePointCost(currentCareer, otherCareer)
	{
		let experienceCost = 4;

		if(currentCareer.system.advances.dedicationBonus)
			experienceCost--;

		for(const trait of currentCareer.system.traits.toLowerCase().replaceAll(" ", "").split(",")) {
			if(trait !== "specialist" && otherCareer.system.traits.toLowerCase().includes(trait))
				experienceCost--;

			if(experienceCost <= 1)
				break;
		}

		if(this.object.itemTypes.ability.find(ability => ability.name === "Adaptable"))
			experienceCost--;

		return experienceCost;
	}
}