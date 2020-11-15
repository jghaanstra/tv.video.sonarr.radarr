'use strict';

const Util = require('/lib/util.js');

module.exports = {
  async eventTrigger({homey, body, params}) {
    const util = new Util({homey: homey});
    const result = await this.util.processNotification(params.event, body);
    return result;
  }
}
