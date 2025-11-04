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
