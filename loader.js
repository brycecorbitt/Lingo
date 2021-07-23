
const scripts = ['lingo_rule.js', 'lingo.js']
chrome.storage.sync.get(['lingo-rules', 'lingo-enabled'], (result) => {	
	// Don't inject anything if Lingo is disabled
	if(result['lingo-enabled'] !== true)
		return

	// Put rules in localStorage to browser to access
	let rules = result['lingo-rules'] || []
	localStorage['lingo-rules'] = JSON.stringify(rules)

	// Inject scripts to be run in browser
	scripts.forEach((script) => {
		var s = document.createElement('script');
		s.src = chrome.runtime.getURL(script);
		s.onload = function() {
				this.remove();
		};
		(document.head || document.documentElement).appendChild(s);
	})
	
})


