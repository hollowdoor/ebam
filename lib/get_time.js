const months = require('months');
const days = require('days');

module.exports = function getTime(){
    let d = new Date();
    return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${d.getYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
};
