"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');

class LidarrDriver extends Homey.Driver {

  onPair(socket) {
    socket.on('testConnection', function(data, callback ) {
      util.rootFolder(data, '/api/v1/rootfolder')
        .then(result => {
          callback(null, result);
        })
        .catch(error => {
          callback(error, null);
        })
    });
  }

}

module.exports = LidarrDriver;
