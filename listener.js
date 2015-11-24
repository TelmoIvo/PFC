var cfg = require("./cfginit.js");
/**
 * User: Paulo Fournier
 * Date: 06-10-2015
 */

var net = require('net'),
    _ = require('underscore'),
	config: {
		queue: {
			timeout: 10000,
			top: 2000,
			host: '10.0.0.140',
			port: 8501,
			wait: 30000
		}
	};

var p = {

    /***
     * Will start listening to the queue
     * @params mongo The mongo connection handler
     * @params redis The redis connection handler
     * @params mobiles The list of mobiles from Rangel
     * @params lastrmx The last used rmx
     * */
    start: function (redis, mobiles, lastrmx) {

        this.redis = redis;
        this.mobiles = mobiles;
        this.lastrmx = lastrmx;

        //start reading from queue
        this.readFromQueue();

    },

    /***
     * The setTimeout object
	 * @see setTimeout
     */
    timer: null,

    /***
     * Will retrive data from queue based on the last rmx
     */
    readFromQueue: function () {

        (function (scope, lastRmx) {

            var rcv = '';

            var client = net.connect(config.queue.port, config.queue.host, function () {

                client.write(new Buffer('{"timestamp":' + lastRmx + ',"limit":' + config.queue.top + '}'));

            });
            rcv = '';
            client.on('data', function (data) {
                rcv += new Buffer(data).toString();
            });

            client.on('end', function () {

                try {

                    var received = JSON.parse(rcv),
                        records = [];

                    if (received.length) {

						//last rmx must be used on next call
                        var maxRmx = _.max(received, function (received) {
                            return received.rmx;
                        });

                        //LOGIC HERE
                        cfg.checkDb(received)
                       

                    }
					
					scope.setLastRmx(maxRmx.rmx);
					//set recall
					scope.waitAndCall();

                } catch (e) {
                    //set recall
                    scope.waitAndCall();
                }
            });

        })(this, this.lastrmx);

    },

    /***
     * Will save information from last rmx
     * @param lastrmx The new rmx
     */
    setLastRmx: function (lastrmx) {
        this.redis.client.set('rngl-last-rmx', lastrmx);
        this.lastrmx = lastrmx;
    },

    /***
     * will call queue after a few seconds
     */
    waitAndCall: function () {

        //call this function after reading queue data
        this.timer = setTimeout((function () {
            this.readFromQueue();
        }).bind(this), config.queue.wait);

    }

}

exports.p = p;
