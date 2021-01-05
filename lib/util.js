'use strict';

const fetch = require('node-fetch');

class Util {

  constructor(opts) {
    this.homey = opts.homey;
  }

  rootFolder(data, path) {
    return new Promise((resolve, reject) => {
      fetch(data.ssl + data.address +':'+ data.port + path, {
          method: 'GET',
          headers: {'X-Api-Key': data.apikey},
          timeout: 5000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          return resolve(body);
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  sendCommand(args, commands) {
    return new Promise((resolve, reject) => {
      var ssl = args.device.getSetting('ssl') || 'http://';
      var address = args.device.getSetting('address');
      var port  = args.device.getSetting('port');
      var apikey  = args.device.getSetting('apikey');

      fetch(ssl + address +':'+ port +'/api/command', {
          method: 'POST',
          body: commands,
          headers: {'X-Api-Key': apikey},
          timeout: 5000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          return resolve('command executed');
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  qualityProfile(ssl = 'http://', address, port, path, apikey, type) {
    return new Promise((resolve, reject) => {
      fetch(ssl + address +':'+ port + path, {
          method: 'GET',
          headers: {'X-Api-Key': apikey},
          timeout: 5000
        })
        .then(this.checkStatus)
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
        .catch(error => {
          return reject(error);
        });
    })
  }

  calendar(args) {
    return new Promise((resolve, reject) => {
      var ssl = args.device.getSetting('ssl') || 'http://';
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

      fetch(ssl + address +':'+ port +'/api/calendar?start='+ currentdate +'&end='+ untildate +'', {
          method: 'GET',
          headers: {'X-Api-Key': apikey},
          timeout: 5000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          return resolve(body);
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  history(args) {
    return new Promise((resolve, reject) => {
      var ssl = args.device.getSetting('ssl') || 'http://';
      var address = args.device.getSetting('address');
      var port  = args.device.getSetting('port');
      var apikey  = args.device.getSetting('apikey');

      fetch(ssl + address +':'+ port +'/api/history?pageSize='+ args.items +'', {
          method: 'GET',
          headers: {'X-Api-Key': apikey},
          timeout: 8000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          return resolve(body);
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  queue(args) {
    return new Promise((resolve, reject) => {
      var ssl = args.device.getSetting('ssl') || 'http://';
      var address = args.device.getSetting('address');
      var port  = args.device.getSetting('port');
      var apikey  = args.device.getSetting('apikey');

      fetch(ssl + address +':'+ port +'/api/queue', {
          method: 'GET',
          headers: {'X-Api-Key': apikey},
          timeout: 5000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          return resolve(body);
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  addMedia(args, type) {
    return new Promise(async (resolve, reject) => {
      try {
        switch(type) {
          case 'series':
            var question = this.homey.__('util.what_series');
            var notfound = this.homey.__('util.series_not_found');
            var added = this.homey.__('util.series_added');
            break;
          case 'movie':
            var question = this.homey.__('util.what_movie');
            var notfound = this.homey.__('util.movie_not_found');
            var added = this.homey.__('util.movie_added');
            break;
        }

        this.homey.speechInput.ask(question, {}, async (error, result) => {
          if (error) {
            this.homey.speechOutput.say(this.homey.__('util.something_wrong') + ' ' + error);
            return reject(error);
          } else if (result == '') {
            this.homey.speechOutput.say(notfound);
            return resolve(notfound)
          } else {
            const dataSearch = await this.searchMedia(args, type, result);
            if (dataSearch) {
              if(dataSearch.length > 1) {
                this.homey.speechOutput.say(this.homey.__('util.more_results'));
                Object.keys(dataSearch).forEach((key) => {
                  this.homey.speechOutput.say(dataSearch[key].title);
                });
                return resolve(true);
              } else {
                const dataAdded = await this.addingMedia(args, type, dataSearch);
                if(dataAdded) {
                  this.homey.speechOutput.say(added + ' ' + dataAdded);
                  return resolve(true);
                } else {
                  return reject(this.homey.__('util.something_wrong'));
                }
              }
            }
          }
        })
      } catch (error) {
        if (error == 'no results') {
          this.homey.speechOutput.say(notfound);
          return resolve(notfound)
        } else {
          this.homey.speechOutput.say(this.homey.__('util.something_wrong'));
          return reject(error);
        }
      }
    })
  }

  searchMedia(args, type, searchquery) {
    return new Promise((resolve, reject) => {
      var filteredMedia = encodeURIComponent(searchquery.trim())
      var ssl = args.device.getSetting('ssl') || 'http://';
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

      fetch(ssl + address +':'+ port +'/api/'+ endpoint +'/lookup?term='+ filteredMedia +'', {
          method: 'GET',
          headers: {'X-Api-Key': apikey},
          timeout: 5000
        })
        .then(this.checkStatus)
        .then(res => res.json())
        .then(json => {
          if (this.isEmpty(json)) {
            return reject('no results');
          } else {
            return resolve(json);
          }
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  addingMedia(args, type, body) {
    return new Promise((resolve, reject) => {
      var ssl = args.device.getSetting('ssl') || 'http://';
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

      fetch(ssl + address +':'+ port +'/api/'+ type +'', {
          method: 'POST',
          body: JSON.stringify(commands),
          headers: {'X-Api-Key': apikey},
          timeout: 5000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          return resolve(title);
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  processNotification(eventSource, body) {
    return new Promise(async (resolve, reject) => {
      try {
        switch (eventSource) {
          case 'sonarr':
            let sonarrs = await this.homey.drivers.getDriver('sonarr').getDevices();
            Object.keys(sonarrs).forEach((key) => {
              if (typeof body.series !== 'undefined' && typeof body.episodes !== 'undefined') {
                var serie = body.series.title;
                var episodes = body.episodes;
                var eventtype = body.eventType;

                episodes.forEach((episode) => {
                  var season = this.addLeadingZero(episode.seasonNumber);
                  var episodenumber = this.addLeadingZero(episode.episodeNumber);
                  var title = episode.title;

                  if (eventtype == 'Grab') {
                    this.homey.flow.getDeviceTriggerCard('grab_episode').trigger(sonarrs[key], {serie: serie, season: season, episode: episodenumber, title: title}, {});
                    return resolve(true);
                  } else if (eventtype == 'Download' || eventtype == 'Test') {
                    this.homey.flow.getDeviceTriggerCard('download_episode').trigger(sonarrs[key], {serie: serie, season: season, episode: episodenumber, title: title}, {});
                    return resolve(true);
                  } else {
                    return reject('Eventtype not supported');
                  }

                });
              } else {
                return reject('Invalid response from Sonarr');
              }
          	});
            return reject('No valid device found');
            break;
          case 'radarr':
            let radarrs = this.homey.drivers.getDriver('radarr').getDevices();
            Object.keys(radarrs).forEach((key) => {
              if (typeof body.Movie !== 'undefined' || typeof body.movie !== 'undefined') {
                if (typeof body.Movie !== 'undefined') {
                  var title = body.Movie.Title;
                } else {
                  var title = body.movie.title;
                }
                if (typeof body.EventType !== 'undefined') {
                  var eventtype = body.EventType;
                } else {
                  var eventtype = body.eventType;
                }

                if (eventtype == 'Grab') {
                  this.homey.flow.getDeviceTriggerCard('grab_movie').trigger(radarrs[key], {title: title}, {});
                  return resolve(true);
                } else if (eventtype == 'Download' || eventtype == 'Test') {
                  this.homey.flow.getDeviceTriggerCard('download_movie').trigger(radarrs[key], {title: title}, {});
                  return resolve(true);
                } else {
                  return reject('Eventtype not supported');
                }
              } else {
                return reject('Invalid response from Radarr');
              }
            });
            return reject('No valid device found');
            break;
          case 'lidarr':
            let lidarrs = this.homey.drivers.getDriver('lidarr').getDevices();
            Object.keys(lidarrs).forEach((key) => {
              if (typeof body.albums !== 'undefined' && typeof body.artist !== 'undefined') {
                var artist = body.artist.name;
                var eventtype = body.eventType;

                if (eventtype == 'Grab') {
                  var albums = body.albums;
                  albums.forEach((album) => {
                    var album_title = album.title;
                    var album_quality = album.quality;
                    this.homey.flow.getDeviceTriggerCard('grab_album').trigger(lidarrs[key], {artist: artist, album: album_title, quality: album_quality}, {});
                    return resolve(true);
                  });
                } else if (eventtype == 'Download') {
                  var album_scenename = body.trackFiles[0].sceneName;
                  this.homey.flow.getDeviceTriggerCard('download_album').trigger(lidarrs[key], {artist: artist, album_scenename: album_scenename}, {});
                  return resolve(true);
                } else if (eventtype == 'Test') {
                  var album_title = "Test Album";
                  var album_quality = "FLAC";
                  this.homey.flow.getDeviceTriggerCard('grab_album').trigger(lidarrs[key], {artist: artist, album: album_title, quality: album_quality}, {});
                  return resolve(true);
                } else {
                  return reject('Eventtype not supported');
                }
              } else {
                return reject('Invalid response from Lidarr');
              }
            });
            return reject('No valid device found');
            break;
          default:
            return reject('Notification URL does not contain a valid source.');
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  isEmpty(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
        return false;
    }
    return true;
  }

  addLeadingZero(str) {
    var number = Number(str);
    if (number < 10) {
      return ("0" + number);
    } else {
      return number.toString();
    }
  }

  checkStatus = (res) => {
    if (res.ok) {
      return res;
    } else {
      if (res.status == 401) {
        throw new Error(this.homey.__('util.unauthorized'));
      } else if (res.status == 502 || res.status == 504) {
        throw new Error(this.homey.__('util.timeout'));
      } else if (res.status == 500) {
        throw new Error(this.homey.__('util.servererror'));
      } else {
        throw new Error(res.status);
      }
    }
  }

}

module.exports = Util;
