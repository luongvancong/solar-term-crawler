const solarTerms = require('./data.json');

const y = 1990;

const rs = solarTerms.filter(item => item.year === y);

console.log(rs);