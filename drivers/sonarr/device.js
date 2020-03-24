'use strict';

const Homey = require('homey');

class SonarrDevice extends Homey.Device {

  onInit() {
    new Homey.FlowCardTriggerDevice('grab_episode').register();
    new Homey.FlowCardTriggerDevice('download_episode').register()
  }

}

module.exports = SonarrDevice;
