"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');

class SonarrRadarrApp extends Homey.App {

    onInit() {

        this.log('Initializing SonarrRadarr app ...');

        // RADARR ACTION CARDS
        new Homey.FlowCardAction('radarr_add')
            .register()
            .registerRunListener((args, state) => {
                util.addMedia(args, 'movie')
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })
            .getArgument('quality')
            .registerAutocompleteListener((query, args) => {
                util.qualityProfile(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('apikey'), 'radarr')
                    .then(result => {
                        return result;
                    })

            })

        new Homey.FlowCardAction('radarr_calendar')
            .register()
            .registerRunListener((args, state) => {
                util.calendar(args)
                    .then(result => {
                        var movies = JSON.parse(result);
                        if (movies.length > 0) {
                            Homey.ManagerSpeechOutput.say(Homey.__("Future movies are"));

                            movies.forEach( function(movie) {
                                var title = movie.title;
                                var cinemadate = movie.inCinemas;
                                var cinemadateFiltered = cinemadate.substring(0,10);
                                var releasedate = movie.physicalRelease;
                                var releasedateFiltered = releasedate.substring(0,10);

                                Homey.ManagerSpeechOutput.say(Homey.__(", in cinemas on and released on", { "title": title, "cinema": cinemadateFiltered, "release": releasedateFiltered }));
                            });
                        } else {
                            Homey.ManagerSpeechOutput.say(Homey.__("No movies found"));
                        }
                        return Promise.resolve();
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('radarr_refresh')
            .register()
            .registerRunListener((args, state) => {
                var command = '{"name": "RefreshMovie"}';
                util.command(args, command)
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })


        // SONARR AUTOCOMPLETE
        new Homey.FlowCardAction('sonarr_add')
            .register()
            .registerRunListener((args, state) => {
                util.addMedia(args, 'series')
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })
            .getArgument('quality')
            .registerAutocompleteListener((query, args) => {
                util.qualityProfile(args.device.getSetting('address'), args.device.getSetting('port'), args.device.getSetting('apikey'), 'sonarr')
                    .then(result => {
                        return result;
                    })
            })

        new Homey.FlowCardAction('sonarr_calendar')
            .register()
            .registerRunListener((args, state) => {
                util.calendar(args)
                    .then(result => {
                        var episodes = JSON.parse(result);
                        if (episodes.length > 0) {
                            Homey.ManagerSpeechOutput.say(Homey.__("Future episode are"));

                            episodes.forEach( function(episode) {
                                var serie = episode.series.title;
                                var season = episode.seasonNumber;
                                var episodenumber = episode.episodeNumber;
                                var title = episode.title;
                                var airdate = episode.airDate;

                                Homey.ManagerSpeechOutput.say(Homey.__(", season episode titled with airdate", { "serie": serie, "season": season, "episode": episodenumber, "title": title, "airdate": airdate }));
                            });
                        } else {
                            Homey.ManagerSpeechOutput.say(Homey.__("No episodes found"));
                        }
                        return Promise.resolve();
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('sonarr_refresh')
            .register()
            .registerRunListener((args, state) => {
                var command = '{"name": "RefreshSeries"}';
                util.command(args, command)
                    .then(result => {
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })

        new Homey.FlowCardAction('sonarr_queue')
            .register()
            .registerRunListener((args, state) => {
                util.queue(args)
                    .then(result => {
                        var downloads = JSON.parse(result);
                        if (downloads.length > 0) {
                            Homey.ManagerSpeechOutput.say(Homey.__("Current downloads are"));

                            downloads.forEach( function(download) {
                                var serie = download.series.title;
                                var season = download.episode.seasonNumber;
                                var episodenumber = download.episode.episodeNumber;
                                var title = download.episode.title;
                                var airdate = download.episode.airDate;

                                Homey.ManagerSpeechOutput.say(Homey.__(", season episode titled with airdate", { "serie": serie, "season": season, "episode": episodenumber, "title": title, "airdate": airdate }));
                            });
                        } else {
                            Homey.ManagerSpeechOutput.say(Homey.__("No current downloads"));
                        }
                        return Promise.resolve();
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })
    }
}

module.exports = SonarrRadarrApp;
