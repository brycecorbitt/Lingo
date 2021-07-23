function regex_literal(unescaped_str){
	return unescaped_str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

class Rule {
	constructor(target, replace_with, is_regex, enabled) {
		this.target = target
		this.replace_with = replace_with
		this.is_regex = Boolean(is_regex)
		this.enabled = Boolean(enabled)
	}

	getTargetPattern(){
		if (this.is_regex === true) {
			return this.target
		}
		const tgt = regex_literal(this.target)
		return tgt
	}

	getReplacePattern(){
		// if (this.is_regex === true) {
		// 	return this.replace_with
		// }
		// const sub = regex_literal(this.replace_with)
		return this.replace_with
	}

}