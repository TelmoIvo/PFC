var cfg = require("./cfginit.js");
var async = require("async")



function start()
{
    cfg.checkDb()
    setTimeout(start, 60000);
}

start();

//cfg.checkDb()