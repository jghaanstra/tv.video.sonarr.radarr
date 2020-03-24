'use strict';

const Homey = require('homey');

class LidarrDevice extends Homey.Device {

  onInit() {
    new Homey.FlowCardTriggerDevice('grab_album').register();
    new Homey.FlowCardTriggerDevice('download_album').register()
  }

}

module.exports = LidarrDevice;
