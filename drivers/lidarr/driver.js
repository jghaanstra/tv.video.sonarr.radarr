'use strict';

const Homey = require('homey');
const Util = require('/lib/util.js');

class LidarrDriver extends Homey.Driver {

  onInit() {
    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('grab_album');
    this.homey.flow.getDeviceTriggerCard('download_album');
  }

  onPair(session) {
    session.setHandler('testConnection', async (data) => {
      try {
        const result = await this.util.rootFolder(data, '/api/v1/rootfolder');
        return Promise.resolve(result);
      } catch (error) {
        return Promise.resolve(error);
      }
    });
  }

}

module.exports = LidarrDriver;
