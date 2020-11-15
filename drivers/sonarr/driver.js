'use strict';

const Homey = require('homey');
const Util = require('/lib/util.js');

class SonarrDriver extends Homey.Driver {

  onInit() {
    this.homey.flow.getDeviceTriggerCard('grab_episode');
    this.homey.flow.getDeviceTriggerCard('download_episode');
    
    if (!this.util) this.util = new Util({homey: this.homey});
  }

  onPair(session) {
    session.setHandler('testConnection', async (data) => {
      try {
        const result = await this.util.rootFolder(data, '/api/rootfolder');
        return Promise.resolve(result);
      } catch (error) {
        return Promise.resolve(error);
      }
    });
  }

}

module.exports = SonarrDriver;
