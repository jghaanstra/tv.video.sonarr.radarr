'use strict';

const Util = require('/lib/util.js');

module.exports = {
  async eventTrigger({homey, body, params}) {
    try {
      const util = new Util({homey: homey});
      const result = await util.processNotification(params.event, body);
      return result;
    } catch(error) {
      console.log(error)
    }
  }
}
