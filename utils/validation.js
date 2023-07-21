// Regex validation that checks if a value has up to four decimal places
exports.checkUptoFourDecimals = (value) => /^-?\d+(\.\d{1,4})?$/.test(value);
