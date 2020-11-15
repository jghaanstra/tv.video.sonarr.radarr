'use strict';

const Homey = require('homey');
const Util = require('/lib/util.js');

class SonarrRadarrApp extends Homey.App {

  onInit() {
    this.log('Initializing SonarrRadarrLidarr app ...');

    if (!this.util) this.util = new Util({homey: this.homey });

    // RADARR FLOW CARDS
    this.homey.flow.getActionCard('radarr_add')
      .registerRunListener(async (args) => {
        try {
          const result = await this.util.addMedia(args, 'movie');
          return Promise.resolve(true);
        } catch (error) {
          return Promise.resolve(error);
        }
      })
      .getArgument('quality')
      .registerAutocompleteListener(async (query, args) => {
        return await this.util.qualityProfile(args.device.getSetting('ssl'), args.device.getSetting('address'), args.device.getSetting('port'), '/api/profile', args.device.getSetting('apikey'), 'radarr');
      })

    this.homey.flow.getActionCard('radarr_calendar')
      .registerRunListener(async (args) => {
        try {
          const result = await this.util.calendar(args);
          let movies = JSON.parse(result);
          if (movies.length > 0) {
            this.homey.speechOutput.say(this.homey.__("app.future_movies"));
            movies.forEach((movie) => {
              var title = movie.title;
              var cinemadate = movie.inCinemas;
              var cinemadateFiltered = cinemadate.substring(0,10);
              var releasedate = movie.physicalRelease;
              var releasedateFiltered = releasedate.substring(0,10);

              this.homey.speechOutput.say(this.homey.__("app.in_cinema_released", { "title": title, "cinema": cinemadateFiltered, "release": releasedateFiltered }));
            });
          } else {
            this.homey.speechOutput.say(this.homey.__("app.no_movies_found"));
          }
          return Promise.resolve(true);
        } catch (error) {
          return Promise.resolve(error);
        }
      })

    this.homey.flow.getActionCard('radarr_refresh')
      .registerRunListener(async (args) => {
        try {
          let command = '{"name": "RefreshMovie"}';
          const result = await this.util.sendCommand(args, command);
          return Promise.resolve(true);
        } catch (error) {
          return Promise.reject(error);
        }
      })

    this.homey.flow.getActionCard('radarr_history')
      .registerRunListener(async (args) => {
        try {
          const result = await this.util.history(args);
          if (result) {
            var data = JSON.parse(result);
            var items = data.records;
            if (items.length > 0) {
              this.homey.speechOutput.say(this.homey.__("app.recently_grabbed_movies"));
              items.forEach((item) => {
                var title = item.movie.title;
                var grabdate = item.date;
                var grabdateFiltered = grabdate.substring(0,10);
                this.homey.speechOutput.say(this.homey.__("app.downloaded_on", { "title": title, "grabdate": grabdateFiltered }));
              });
            } else {
              this.homey.speechOutput.say(this.homey.__("app.no_movies_found"));
            }
            return Promise.resolve(true);
          }
        } catch (error) {
          return Promise.reject(error);
        }
      })

    // SONARR FLOW CARDS
    this.homey.flow.getActionCard('sonarr_add')
      .registerRunListener(async (args) => {
        try {
          const result = await this.util.addMedia(args, 'series');
          return Promise.resolve(true);
        } catch (error) {
          return Promise.resolve(false);
        }
      })
      .getArgument('quality')
      .registerAutocompleteListener(async (query, args) => {
        return await this.util.qualityProfile(args.device.getSetting('ssl'), args.device.getSetting('address'), args.device.getSetting('port'), '/api/profile', args.device.getSetting('apikey'), 'sonarr');
      })

    this.homey.flow.getActionCard('sonarr_calendar')
      .registerRunListener(async (args) => {
        try {
          const result = await this.util.calendar(args);
          if (result) {
            var episodes = JSON.parse(result);
            if (episodes.length > 0) {
              this.homey.speechOutput.say(this.homey.__("app.future_episodes_are"));
              episodes.forEach((episode) => {
                var serie = episode.series.title;
                var season = episode.seasonNumber;
                var episodenumber = episode.episodeNumber;
                var title = episode.title;
                var airdate = episode.airDate;
                this.homey.speechOutput.say(this.homey.__("app.season_episode_titled", { "serie": serie, "season": season, "episode": episodenumber, "title": title, "airdate": airdate }));
              });
            } else {
              this.homey.speechOutput.say(this.homey.__("app.no_episodes_found"));
            }
            return Promise.resolve(true);
          }
        } catch (error) {
          return Promise.reject(error);
        }
      })

    this.homey.flow.getActionCard('sonarr_refresh')
      .registerRunListener(async (args) => {
        try {
          const command = '{"name": "RefreshSeries"}';
          const result = await this.util.sendCommand(args, command);
          return Promise.resolve(true);
        } catch (error) {
          return Promise.reject(error);
        }
      })

    this.homey.flow.getActionCard('sonarr_queue')
      .registerRunListener(async (args) => {
        try {
          const result = await this.util.queue(args);
          if (result) {
            var downloads = JSON.parse(result);
            if (downloads.length > 0) {
              this.homey.speechOutput.say(this.homey.__("app.current_downloads_are"));

              downloads.forEach((download) => {
                var serie = download.series.title;
                var season = download.episode.seasonNumber;
                var episodenumber = download.episode.episodeNumber;
                var title = download.episode.title;
                var airdate = download.episode.airDate;

                this.homey.speechOutput.say(this.homey.__("app.season_episode_titled", { "serie": serie, "season": season, "episode": episodenumber, "title": title, "airdate": airdate }));
              });
            } else {
              this.homey.speechOutput.say(this.homey.__("app.no_current_downloads"));
            }
            return Promise.resolve();
          }
        } catch (error) {
          return Promise.reject(error);
        }
      })

    this.homey.flow.getActionCard('sonarr_history')
      .registerRunListener(async (args) => {
        try {
          const result = await this.util.history(args);
          if (result) {
            var data = JSON.parse(result);
            var items = data.records;
            if (items.length > 0) {
              this.homey.speechOutput.say(this.homey.__("app.recently_grabbed_episodes_are"));
              items.forEach((item) => {
                var serie = item.series.title;
                var season = item.episode.seasonNumber;
                var episodenumber = item.episode.episodeNumber;
                var title = item.episode.title;
                var grabdate = item.date;
                var grabdateFiltered = grabdate.substring(0,10);
                this.homey.speechOutput.say(this.homey.__("app.season_episode_titled", { "serie": serie, "season": season, "episode": episodenumber, "title": title, "grabdate": grabdateFiltered }));
              });
            } else {
              this.homey.speechOutput.say(this.homey.__("app.no_episodes_found"));
            }
            return Promise.resolve();
          }
        } catch (error) {
          return Promise.reject(error);
        }
      })
  }

}

module.exports = SonarrRadarrApp;
