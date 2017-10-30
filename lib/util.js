const Homey = require('homey');
const rp = require('request-promise-native');

exports.rootFolder = function (data) {
    return new Promise(function (resolve, reject) {
        var address = data.address;
        var port    = data.port;
        var apikey  = data.apikey;

        var options = {
            url: "http://"+ address +":"+ port +"/api/rootfolder",
            headers: {
                'X-Api-Key': apikey
            },
            timeout: 5000
        };

        rp(options)
            .then(function (response) {
                return resolve(response);
            })
            .catch(function (error) {
                return reject(error);
            });
    })
}

exports.qualityProfile = function (address, port, apikey, type) {
    return new Promise(function (resolve, reject) {
        var options = {
            url: "http://"+ address +":"+ port +"/api/profile",
            headers: {
                'X-Api-Key': apikey
            },
            timeout: 5000
        };

        rp(options)
            .then(function (response) {
                var list = [];
                var profiles = JSON.parse(response);
                if (profiles.length > 0) {
                    profiles.forEach(function(profile) {
                        list.push({
                            icon: '/app/tv.video.sonarr.radarr/drivers/'+ type +'/assets/download.svg',
                            name: profile.name,
                            id: profile.cutoff.id
                        })
                    });
                }
                return resolve(list);
            })
            .catch(function (error) {
                return reject(error);
            });
    })
}

exports.calendar = function (args) {
    return new Promise(function (resolve, reject) {
        var address = args.device.getSetting('address');
        var port    = args.device.getSetting('port');
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

        var options = {
            url: "http://"+ address +":"+ port +"/api/calendar?start="+ currentdate +"&end="+ untildate +"",
            headers: {
                'X-Api-Key': apikey
            },
            timeout: 5000
        };

        rp(options)
            .then(function (response) {
                return resolve(response);
            })
            .catch(function (error) {
                return reject(error);
            });
    })
}

exports.queue = function (args) {
    return new Promise(function (resolve, reject) {
        var address = args.device.getSetting('address');
        var port    = args.device.getSetting('port');
        var apikey  = args.device.getSetting('apikey');

        var options = {
            url: "http://"+ address +":"+ port +"/api/queue",
            headers: {
                'X-Api-Key': apikey
            },
            timeout: 5000
        };

        rp(options)
            .then(function (response) {
                if (response.statusCode == 200) {
                    return resolve(response.body);
                } else {
                    return reject('there was an issue with the connection');
                }
            })
            .catch(function (error) {
                return reject(error);
            });
    })
}

exports.command = function (args, commands) {
    return new Promise(function (resolve, reject) {
        var address = args.device.getSetting('address');
        var port    = args.device.getSetting('port');
        var apikey  = args.device.getSetting('apikey');

        var options = {
            url: "http://"+ address +":"+ port +"/api/command",
            method: 'POST',
            body: commands,
            headers: {
                'X-Api-Key': apikey
            },
            timeout: 5000
        };

        rp(options)
            .then(function (response) {
                return resolve('command executed');
            })
            .catch(function (error) {
                return reject(error);
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

        Homey.ManagerSpeechInput.ask(question, function(error, result) {
            if (error) {
                Homey.ManagerSpeechOutput.say(Homey.__('Something went wrong') + ' ' + error);
                return reject(error);
            } else if (result == '') {
                Homey.ManagerSpeechOutput.say(notfound);
                return resolve(notfound);
            } else {

                const searchAndAdd = async () => {
                    try {
                        const dataSearch = await searchMedia(args, type, result);
                        if (dataSearch) {
                            const dataAdded = await addingMedia(args, type, dataSearch);
                            Homey.ManagerSpeechOutput.say(added + ' ' + dataAdded)
                            return resolve(dataAdded);
                        }
                    } catch (error) {
                        if(error == 'no results') {
                            Homey.ManagerSpeechOutput.say(notfound);
                            return resolve(notfound);
                        } else {
                            Homey.ManagerSpeechOutput.say(error)
                            return reject(error);
                        }
                    }
                }
            }
        })
    })
}

function searchMedia(args, type, searchquery) {
    return new Promise(function (resolve, reject) {
        var filteredMedia = encodeURIComponent(searchquery.trim())
        var address = args.device.getSetting('address');
        var port    = args.device.getSetting('port');
        var apikey  = args.device.getSetting('apikey');

        switch(type) {
            case 'series':
                var endpoint = type;
                break;
            case 'movie':
                var endpoint = 'movies';
                break;
        }

        var options = {
            url: "http://"+ address +":"+ port +"/api/"+ endpoint +"/lookup?term="+ filteredMedia +"",
            headers: {
                'X-Api-Key': apikey
            },
            timeout: 5000
        };

        rp(options)
            .then(function (response) {
                var result = JSON.parse(response.body);
                if (isEmpty(result)) {
                    return reject('no results');
                } else {
                    return resolve(result);
                }
            })
            .catch(function (error) {
                return reject(error);
            });
    })
}

function addingMedia(args, type, body) {
    return new Promise(function (resolve, reject) {
        var address     = args.device.getSetting('address');
        var port        = args.device.getSetting('port');
        var apikey      = args.device.getSetting('apikey');
        var rootfolder  = args.device.getSetting('rootfolder');
        var title       = body[0].title;
        var path        = ""+ rootfolder +"/"+ title +"/"

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

        var options = {
            url: "http://"+ address +":"+ port +"/api/"+ type +"",
            method: 'POST',
            body: JSON.stringify(commands),
            headers: {
                'X-Api-Key': apikey
            },
            timeout: 5000
        };

        rp(options)
            .then(function (response) {
                return resolve(title);
            })
            .catch(function (error) {
                return reject(error);
            });
    })
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
