console.log("LINGO!")
const lingo_rules = []

function load_rules() {
	const rule_str = localStorage['lingo-rules']
	let rule_list = JSON.parse(rule_str)
	for (rule_json of rule_list) {
		const rule = new Rule(rule_json.target, rule_json.sub, rule_json.regex, rule_json.enabled)
		lingo_rules.push(rule)
	}
}


function lingo_replace(target_node) {
	let node
	let walker = document.createTreeWalker(target_node,NodeFilter.SHOW_TEXT,null);
	while (node=walker.nextNode()) {
		// Skip script elements
		if (node.parentNode == "SCRIPT" || node.lingoed)
			continue

		// apply lingo rules here
		for(rule of lingo_rules) {
			if(!rule.enabled)
				continue
			let target = new RegExp(rule.getTargetPattern(), 'gi')
			let sub = rule.getReplacePattern()
			if (target.test(node.textContent)) {
				node.textContent = node.textContent.replaceAll(target, sub)
				node.lingoed = true // Mark node to prevent from cyclitic replacements
			}
		}
	}
}

// Callback function to execute when mutations are observed
const observer_callback = function(mutations_list, observer) {
    for(const mutation of mutations_list) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
						for (const target of mutation.addedNodes){
							lingo_replace(target)
						}
        }
    }
};

// Create an observer
const observer = new MutationObserver(observer_callback);
observer.observe(document.documentElement, { attributes: false, childList: true, subtree: true });

load_rules()

// Do pass through of entire page on load
lingo_replace(document.documentElement)