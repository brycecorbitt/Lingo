console.log("UI!")
const rules_div = document.getElementById("rules")

let max_rid = 1

function remove_form(id){
	const el = document.getElementById(id + '-input')
	el.remove()
}

function add_rule(){
	let rid = max_rid
	let form = document.createElement('div')
	form.setAttribute('id', `${rid}-input`)
	form.setAttribute('style', 'display: inline;white-space:nowrap;')
	form.innerHTML = `Replace <input type="text" id="${rid}-target"> with <input type="text" id="${rid}-sub">
	<p>Regex: <input type="checkbox" id="${rid}-regex"> Enabled: <input type="checkbox" id="${rid}-enabled" checked>  <button class="remove-btn" id="${rid}-remove">Remove</button></p`
	rules_div.appendChild(form)
	let remove_button = document.getElementById(rid + '-remove')
	remove_button.addEventListener('click', () => {remove_form(rid)})
	max_rid++
}

function load_rules(entries) {
	// Remove old rules
	const old_rules = Array.from(document.querySelector("#rules > div") || [])
	old_rules.map((x) => {x.remove}, old_rules)
	max_rid = 1
	
	if (entries.length == 0)
		add_rule()
	for(let i = 0; i < entries.length; i++){
		let rid = i+1
		while (max_rid <= rid)
			add_rule()
		let fields = ['target', 'sub']
		for(let j = 0; j < fields.length; j++) {
			let fid = `${rid}-${fields[j]}`
			let el = document.getElementById(fid)
			el.value = entries[i][fields[j]]
		}
		fields = ['enabled', 'regex']
		for(let j = 0; j < fields.length; j++) {
			let fid = `${rid}-${fields[j]}`
			let el = document.getElementById(fid)
			el.checked = entries[i][fields[j]]
		}
	}
}

function get_rules() {
	const entries = []
	Array.from(rules_div.children).forEach((form) => {
		const entry = {}
		const rid = parseInt(form.getAttribute('id').split('-')[0])
		let fields = ['target', 'sub']
		for(let i = 0; i < fields.length; i++){
			let fid = `${rid}-${fields[i]}`
			let el = document.getElementById(fid)
			entry[fields[i]] = el.value
		}
		fields = ['regex', 'enabled']
		for(let i = 0; i < fields.length; i++){
			let fid = `${rid}-${fields[i]}`
			let el = document.getElementById(fid)
			entry[fields[i]] = el.checked
		}
		entries.push(entry)
	})
	return entries
}

function persist_rules(callback) {
	const entries = get_rules()
	chrome.storage.sync.set({'lingo-rules': entries}, function(result){
		if(callback)
			callback(result)
	})
}

function persist_enabled(enabled, callback) {
	chrome.storage.sync.set({'lingo-enabled': enabled}, function(result) {
		if(callback)
		callback(result)
	})
}

function refresh_active_tab(){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.reload(tabs[0].id);
	});
}

// Add button event listeners
const add_btn = document.getElementById("add-btn")
add_btn.addEventListener('click', add_rule)

const save_btn = document.getElementById("save-btn")
save_btn.addEventListener('click', () => {
	persist_rules(refresh_active_tab)
})

const export_btn = document.getElementById("export-btn")
export_btn.addEventListener('click', () => {
	const entries = get_rules();
	// Create JSON download link
	const blob = new Blob([JSON.stringify(entries)], { type: 'text/json' })
	const url = document.createElement('a')
	url.download = 'lingo_rules.json'
	url.href = window.URL.createObjectURL(blob);
	url.dataset.downloadurl = ["text/json", url.download, url.href].join(":");
	
	// Simulate click
	const evt = new MouseEvent("click", {
		view: window,
		bubbles: true,
		cancelable: true,
	});
	url.dispatchEvent(evt);
	url.remove()
})

const import_input = document.getElementById("import-rules")
const import_btn = document.getElementById("import-btn")
import_btn.addEventListener('click', () => {
	let rules = import_input.value
	rules = JSON.parse(rules)
	load_rules(rules)
	persist_rules(refresh_active_tab)
})

const enable_switch = document.getElementById('enable-switch')
const enable_text = document.getElementById('enable-text')


// Load rules and enabled state on launch
chrome.storage.sync.get(['lingo-rules', 'lingo-enabled'], (result) => {
	load_rules(result['lingo-rules'])
	// Set lingo-enabled to true on first launch
	if(result['lingo-enabled'] === undefined || result['lingo-enabled'] === null) {
		result['lingo-enabled'] = true
		persist_enabled(true)
	}
	enable_switch.checked = result['lingo-enabled']
	if (result['lingo-enabled'] == true)
		enable_text.textContent = 'On'
	else
		enable_text.textContent = 'Off'
})

enable_switch.addEventListener('change', () => {
	if(enable_switch.checked == true)
		enable_text.textContent = 'On'
	else
		enable_text.textContent = 'Off'

	// Update value in storage, reloading page afterwards
	persist_enabled(enable_switch.checked, refresh_active_tab)
})
