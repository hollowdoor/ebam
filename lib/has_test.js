module.exports = function hasTest(config){
    if(typeof config.test !== 'object'){ return false; }
    if(typeof config.test.src !== 'string'){ return false; }
    if(typeof config.test.dest !== 'string'){ return false; }
    return true;
};
