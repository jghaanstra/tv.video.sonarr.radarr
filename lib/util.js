const Homey = require('homey');
const fetch = require('node-fetch');

exports.rootFolder = function (data) {
  return new Promise(function (resolve, reject) {
    fetch('http://'+ data.address +':'+ data.port +'/api/rootfolder', {
        method: 'GET',
        headers: {'X-Api-Key': data.apikey},
        timeout: 5000
      })
      .then(checkStatus)
      .then(res => res.text())
      .then(body => {
        return resolve(body);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

exports.qualityProfile = function (address, port, apikey, type) {
  return new Promise(function (resolve, reject) {
    fetch('http://'+ address +':'+ port +'/api/profile', {
        method: 'GET',
        headers: {'X-Api-Key': apikey},
        timeout: 5000
      })
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        var list = [];
        if (json.length > 0) {
          json.forEach(function(profile) {
            list.push({
              icon: '/app/tv.video.sonarr.radarr/drivers/'+ type +'/assets/download.svg',
              name: profile.name,
              id: profile.cutoff.id
            })
          });
        }
        return resolve(list);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

exports.calendar = function (args) {
  return new Promise(function (resolve, reject) {
    var address = args.device.getSetting('address');
    var port  = args.device.getSetting('port');
    var apikey  = args.device.getSetting('apikey');
    var range   = args.range * 7;

    var current = new Date();
    var currentday = current.getDate();
    var currentmonth = current.getMonth() + 1;
    var currentyear = current.getFullYear();
    var currentdate = currentyear + '-' + (currentmonth<=9 ? '0' + currentmonth : currentmonth) + '-' + (currentday <= 9 ? '0' + currentday : currentday);

    var until = new Date();
    until.setDate(until.getDate() + range);
    var untilday = until.getDate();
    var untilmonth = until.getMonth() + 1;
    var untilyear = until.getFullYear();
    var untilyear = until.getFullYear();
    var untildate = untilyear + '-' + (untilmonth<=9 ? '0' + untilmonth : untilmonth) + '-' + (untilday <= 9 ? '0' + untilday : untilday);

    fetch('http://'+ address +':'+ port +'/api/calendar?start='+ currentdate +'&end='+ untildate +'', {
        method: 'GET',
        headers: {'X-Api-Key': apikey},
        timeout: 5000
      })
      .then(checkStatus)
      .then(res => res.text())
      .then(body => {
        return resolve(body);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

exports.history = function (args) {
  return new Promise(function (resolve, reject) {
    var address = args.device.getSetting('address');
    var port  = args.device.getSetting('port');
    var apikey  = args.device.getSetting('apikey');

    fetch('http://'+ address +':'+ port +'/api/history?pageSize='+ args.items +'', {
        method: 'GET',
        headers: {'X-Api-Key': apikey},
        timeout: 8000
      })
      .then(checkStatus)
      .then(res => res.text())
      .then(body => {
        return resolve(body);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

exports.queue = function (args) {
  return new Promise(function (resolve, reject) {
    var address = args.device.getSetting('address');
    var port  = args.device.getSetting('port');
    var apikey  = args.device.getSetting('apikey');

    fetch('http://'+ address +':'+ port +'/api/queue', {
        method: 'GET',
        headers: {'X-Api-Key': apikey},
        timeout: 5000
      })
      .then(checkStatus)
      .then(res => res.text())
      .then(body => {
        return resolve(body);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

exports.command = function (args, commands) {
  return new Promise(function (resolve, reject) {
    var address = args.device.getSetting('address');
    var port  = args.device.getSetting('port');
    var apikey  = args.device.getSetting('apikey');

    fetch('http://'+ address +':'+ port +'/api/command', {
        method: 'POST',
        body: commands,
        headers: {'X-Api-Key': apikey},
        timeout: 5000
      })
      .then(checkStatus)
      .then(res => res.text())
      .then(body => {
        return resolve('command executed');
      })
      .catch(err => {
        return reject(err);
      });
  })
}

exports.addMedia = function (args, type) {
  return new Promise(function (resolve, reject) {
    switch(type) {
      case 'series':
        var question = Homey.__('What series do you want to add?');
        var notfound = Homey.__('Series not found, please try again');
        var added = Homey.__('The following series has been added');
        break;
      case 'movie':
        var question = Homey.__('What movie do you want to add?');
        var notfound = Homey.__('Movie not found, please try again');
        var added = Homey.__('The following movie has been added');
        break;
    }

    Homey.ManagerSpeechInput.ask(question, {}, function(error, result) {
      if (error) {
        Homey.ManagerSpeechOutput.say(Homey.__('Something went wrong') + ' ' + error);
        return reject(error);
      } else if (result == '') {
        Homey.ManagerSpeechOutput.say(notfound);
        return resolve(notfound)
      } else {
        const searchAndAdd = async () => {
          try {
            const dataSearch = await searchMedia(args, type, result);
            if (dataSearch) {
              if(dataSearch.length > 1) {
                Homey.ManagerSpeechOutput.say(Homey.__('More than one result'));
                Object.keys(dataSearch).forEach(function(key) {
                  Homey.ManagerSpeechOutput.say(dataSearch[key].title);
                });
                return resolve(true);
              } else {
                const dataAdded = await addingMedia(args, type, dataSearch);
                if(dataAdded) {
                  Homey.ManagerSpeechOutput.say(added + ' ' + dataAdded);
                  return resolve(true);
                } else {
                  return reject(Homey.__('Something went wrong'));
                }
              }
            }
          } catch (error) {
            if(error == 'no results') {
              Homey.ManagerSpeechOutput.say(notfound);
              return resolve(notfound)
            } else {
              Homey.ManagerSpeechOutput.say(Homey.__('Something went wrong'));
              return reject(error);
            }
          }
        }
        searchAndAdd();
      }
    })
  })
}

function searchMedia(args, type, searchquery) {
  return new Promise(function (resolve, reject) {
    var filteredMedia = encodeURIComponent(searchquery.trim())
    var address = args.device.getSetting('address');
    var port  = args.device.getSetting('port');
    var apikey  = args.device.getSetting('apikey');

    switch(type) {
      case 'series':
        var endpoint = type;
        break;
      case 'movie':
        var endpoint = 'movies';
        break;
    }

    fetch('http://'+ address +':'+ port +'/api/'+ endpoint +'/lookup?term='+ filteredMedia +'', {
        method: 'GET',
        headers: {'X-Api-Key': apikey},
        timeout: 5000
      })
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        if (isEmpty(json)) {
          return reject('no results');
        } else {
          return resolve(json);
        }
      })
      .catch(err => {
        return reject(err);
      });
  })
}

function addingMedia(args, type, body) {
  return new Promise(function (resolve, reject) {
    var address   = args.device.getSetting('address');
    var port    = args.device.getSetting('port');
    var apikey    = args.device.getSetting('apikey');
    var rootfolder  = args.device.getSetting('rootfolder');
    var title     = body[0].title;
    var path    = ""+ rootfolder +"/"+ title +"/"

    switch(type) {
      case 'series':
        var commands = {
          "tvdbId": body[0].tvdbId,
          "title": body[0].title,
          "qualityProfileId": args.quality.id,
          "titleSlug": body[0].titleSlug,
          "images": body[0].images,
          "seasons": body[0].seasons,
          "path": path
        }
        break;
      case 'movie':
        var commands = {
          "title": body[0].title,
          "qualityProfileId": args.quality.id,
          "titleSlug": body[0].titleSlug,
          "images": body[0].images,
          "tmdbId": body[0].tmdbId,
          "path": path
        }
        break;
    }

    fetch('http://'+ address +':'+ port +'/api/'+ type +'', {
        method: 'POST',
        body: JSON.stringify(commands),
        headers: {'X-Api-Key': apikey},
        timeout: 5000
      })
      .then(checkStatus)
      .then(res => res.text())
      .then(body => {
        return resolve(title);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

function checkStatus(res) {
  if (res.ok) {
    return res;
  } else {
    throw new Error(res.status);
  }
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
  }
  return true;
}
