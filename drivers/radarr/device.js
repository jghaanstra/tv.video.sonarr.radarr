'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');

class RadarrDevice extends Homey.Device {

    onInit() {
        new Homey.FlowCardTriggerDevice('grab_movie').register();
        new Homey.FlowCardTriggerDevice('download_movie').register();
    }

}

module.exports = RadarrDevice;