function formatTitle(title) {
	return title.split("_").map(w => {
		let letters = w.split("");
		let splicedArray = letters.splice(0,1);

		let firstLetterToUpper = splicedArray[0]?.toUpperCase();
		let restOfWord = letters.join("");

		return restOfWord.length > 0 ? firstLetterToUpper.concat(restOfWord) : firstLetterToUpper;
	}).join(" ")
}

export { formatTitle }