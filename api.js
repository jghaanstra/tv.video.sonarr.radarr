const Homey = require('homey');
const util = require('/lib/util.js');

module.exports = [
	{
		description: 'Notification',
		method   : 'POST',
		path     : '/:source',
		public   : true,
		fn: function(args, callback) {

      if (args.params.source == 'sonarr') {
        var sonarrs = Homey.ManagerDrivers.getDriver('sonarr').getDevices();

        Object.keys(sonarrs).forEach(function(key) {
          if (typeof args.body.series !== 'undefined' && typeof args.body.episodes !== 'undefined') {
            var serie = args.body.series.title;
            var episodes = args.body.episodes;
            var eventtype = args.body.eventType;

            episodes.forEach( function(episode) {
              var season = addLeadingZero(episode.seasonNumber);
              var episodenumber = addLeadingZero(episode.episodeNumber);
              var title = episode.title;

              if (eventtype == 'Grab') {
                Homey.ManagerFlow.getCard('trigger', 'grab_episode').trigger(sonarrs[key], {serie: serie, season: season, episode: episodenumber, title: title}, {});
                callback(null, true);
              } else if (eventtype == 'Download' || eventtype == 'Test') {
                Homey.ManagerFlow.getCard('trigger', 'download_episode').trigger(sonarrs[key], {serie: serie, season: season, episode: episodenumber, title: title}, {});
                callback(null, true);
              } else {
                callback('Eventtype not supported', false);
              }

            });
          } else {
            callback('Invalid response from Sonarr', false);
          }
      	});
      } else if (args.params.source == 'radarr') {
        var radarrs = Homey.ManagerDrivers.getDriver('radarr').getDevices();

        Object.keys(radarrs).forEach(function(key) {
          if (typeof args.body.Movie !== 'undefined' || typeof args.body.movie !== 'undefined') {
            if (typeof args.body.Movie !== 'undefined') {
              var title = args.body.Movie.Title;
            } else {
              var title = args.body.movie.title;
            }
            if (typeof args.body.EventType !== 'undefined') {
              var eventtype = args.body.EventType;
            } else {
              var eventtype = args.body.eventType;
            }

            if (eventtype == 'Grab') {
              Homey.ManagerFlow.getCard('trigger', 'grab_movie').trigger(radarrs[key], {title: title}, {});
              callback(null, true);
            } else if (eventtype == 'Download' || eventtype == 'Test') {
              Homey.ManagerFlow.getCard('trigger', 'download_movie').trigger(radarrs[key], {title: title}, {});
              callback(null, true);
            } else {
              callback('Eventtype not supported', false);
            }
          } else {
            callback('Invalid response from Radarr', false);
          }
        });
      } else if (args.params.source == 'lidarr') {
        var lidarrs = Homey.ManagerDrivers.getDriver('lidarr').getDevices();

        Object.keys(lidarrs).forEach(function(key) {
          if (typeof args.body.albums !== 'undefined' && typeof args.body.artist !== 'undefined') {
            var artist = args.body.artist.name;
            var eventtype = args.body.eventType;

            if (eventtype == 'Grab') {
              var albums = args.body.albums;
              albums.forEach( function(album) {
                var album_title = album.title;
                var album_quality = album.quality;
                Homey.ManagerFlow.getCard('trigger', 'grab_album').trigger(lidarrs[key], {artist: artist, album: album_title, quality: album_quality}, {});
                callback(null, true);
              });
            } else if (eventtype == 'Download') {
              var album_scenename = args.body.trackFiles[0].sceneName;
              Homey.ManagerFlow.getCard('trigger', 'download_album').trigger(lidarrs[key], {artist: artist, album_scenename: album_scenename}, {});
              callback(null, true);
            } else if (eventtype == 'Test') {
              var album_title = "Test Album";
              var album_quality = "FLAC";
              Homey.ManagerFlow.getCard('trigger', 'grab_album').trigger(lidarrs[key], {artist: artist, album: album_title, quality: album_quality}, {});
              callback(null, true);
            } else {
              callback('Eventtype not supported', false);
            }
          } else {
            callback('Invalid response from Lidarr', false);
          }
        });
      } else {
        callback('No valid source posted', false);
      }
		}
	}
]

function addLeadingZero(str) {
  var number = Number(str);
  if (number < 10) {
    return ("0" + number);
  } else {
    return number.toString();
  }
}
