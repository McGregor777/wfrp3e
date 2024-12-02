/** @inheritDoc */
export default class TalentSelector extends FormApplication
{
	constructor(object, career, nonCareer = false, options = {})
	{
		super(object, options);

		this.career = career;
		this.nonCareer = nonCareer;
	}

	/** @inheritDoc */
	get title()
	{
		return game.i18n.localize("TALENTSELECTOR.title");
	}

	/** @inheritDoc */
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			classes: ["wfrp3e", "selector", "talent-selector"],
			template: "systems/wfrp3e/templates/applications/talent-selector.hbs",
			tabs: [{group: "talents", navSelector: ".talent-tabs", contentSelector: ".talents", initial: "focus"}],
			width: 824,
			height: 720
		};
	}

	/** @inheritDoc */
	async getData()
	{
		await this._buildTalentLists();

		return {
			...super.getData(),
			talents: this.talents,
			talentTypes: CONFIG.WFRP3e.talentTypes
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".item-container input").change(this._onTalentChange.bind(this, html));
	}

	/** @inheritDoc */
	async _updateObject(event, formData)
	{
		const selectedTalent = this.allTalents.find(talent => talent._id === formData.talent);

		if(!selectedTalent)
			ui.notifications.warn(game.i18n.localize("TALENTSELECTOR.WARNINGS.noTalentSelected"));

		if(!this.nonCareer)
			this.career.update({"system.advances.talent": selectedTalent.name});
		else {
			const updates = {"system.advances.nonCareer": this.career.system.advances.nonCareer};
			updates["system.advances.nonCareer"][updates["system.advances.nonCareer"].findIndex(advance => advance.type == null)] = {
				cost: 2,
				type: selectedTalent.name
			};

			this.career.update(updates);
		}

		await Item.createDocuments([selectedTalent], {parent: this.object});
	}

	async _buildTalentLists()
	{
		let talents = [];

		for(const pack of [...game.packs.values()].filter(pack => pack.documentName === "Item")) {
			await pack.getDocuments({type: "talent"}).then(foundTalents => {
				if(foundTalents.length > 0)
					talents.push(...foundTalents);
			});
		}

		this.allTalents = talents.sort((a, b) => a.name.localeCompare(b.name));

		talents = Object.keys(CONFIG.WFRP3e.talentTypes).reduce((sortedTalents, talentType) => {
			if(["focus", "reputation", "tactic", "tricks"].includes(talentType)
				&& ((!this.nonCareer && this.career.system.talentSockets.includes(talentType))
					|| (this.nonCareer && !this.career.system.talentSockets.includes(talentType))))
				sortedTalents[talentType] = talents.filter(talent => {
					return !this.object.itemTypes.talent.find(ownedTalent => ownedTalent.name === talent.name)
						&& talent.system.type === talentType;
				});

			return sortedTalents;
		}, {});

		this.talents = talents;
	}

	async _onTalentChange(html, event)
	{
		html.find("label.active").removeClass("active");
		$(event.currentTarget).parents("label").addClass("active");

		html.find(".selection").text(this.allTalents.find(talent => talent._id === event.currentTarget.value).name);
	}
}