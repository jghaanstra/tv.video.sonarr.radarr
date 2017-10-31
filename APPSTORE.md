# Connect Sonarr and Radarr with Homey
Connect [Sonarr](https://github.com/Sonarr/Sonarr) and/or [Radarr](https://github.com/Radarr/Radarr) with Homey and receive updates about grabbed and finished downloads and upcoming episodes and movies.

## Instructions
For Homey to be able to receive updates from Sonarr and Radarr these applications need to send notifications to Homey on events like finished downloads. This is achieved by registering a webhook in Sonarr and/or Radarr. Below is a short instruction on how to register this webhook.
* First add your Sonarr and/or Radarr installations as devices in Homey. You will need to fill in the IP address and API key.
* Then log into your Sonarr / Radarr installation and go to "Settings > Connect".
* Click on the plus button and click on the Webhook notification in the Add Notification popup
* Enter the details as followed:
    * Name: Homey (or something similar)
    * On Grab: Yes
    * On Download: Yes
    * On Upgrade: No
    * On Rename: No
    * Filter Series Tags: Empty
    * URL for Sonarr: http(s)://yourip-or-homey-url/api/app/tv.video.sonarr.radarr/sonarr/ where you add the local IP of Homey (if on the same network as Sonarr) or the external cloud URL of Homey
    * URL for Radarr: http(s)://yourip-or-homey-url/api/app/tv.video.sonarr.radarr/radarr/ where you add the local IP of Homey (if on the same network as Radarr) or the external cloud URL of Homey
    * Method: POST

## Support topic
For support please use the official support topic on the forum [here](https://forum.athom.com/discussion/3333/).

## Supported Cards
### Sonarr
* [TRIGGER] Episode grabbed (tokens for serie, season, episode and title)
* [TRIGGER] Episode downloaded (tokens for serie, season, episode and title)
* [ACTION] Add series to the Sonarr library through voice and with a selected quality profile.
* [ACTION] Let Homey speak upcoming episodes from the Sonarr calendar within the selected weeks
* [ACTION] Let Homey speak recently grabbed episodes
* [ACTION] Let Homey speak currently downloading episodes
* [ACTION] Refresh series information from trakt and rescan disks.

### Radarr
* [TRIGGER] Episode grabbed (tokens for serie, season, episode and title)
* [TRIGGER] Episode downloaded (tokens for serie, season, episode and title)
* [ACTION] Add movies to the Radarr library through voice and with a selected quality profile.
* [ACTION] Let Homey speak upcoming movies from the Radarr calendar within the selected weeks
* [ACTION] Let Homey speak recently grabbed movies
* [ACTION] Refresh movies information from TMDb and rescan disks.

## Changelog
### 2017-10-31 -- v2.0.0
* NEW: rewrite for SDK2
* NEW: when adding series/movies by voice the app will now not pick the first result when there are more but will ask you to be more specific
* NEW: added action card for speaking the latest 1 to 15 grabbed episodes (Sonarr) or movies (Radarr)

### 2017-08-02 -- v1.1.4
* FIX: fix for issue with the Radarr webhook (credits to rvmourik)

### 2017-07-17 -- v1.1.3
* IMPROVEMENT: add even better error handling for the webhooks of Sonarr and Radarr
* FIX: fix a small issue with the Radarr webhook

### 2017-07-06 -- v1.1.2
* IMPROVEMENT: add better error handling when adding webhooks in Radarr and Sonarr
* FIX: updated api.js since Sonarr changed it webhook interface with Sonarr release 2.0.0.4855

### 2017-06-22 -- v1.1.1
* IMPROVEMENT: added leading zero to season and episode number tokens for Sonarr trigger cards
* FIX: fixed an error which causes the app to crash in the speech handling part of the add cards for Sonarr and Radarr

### 2017-06-18 -- v1.1.0
IMPORTANT: this release requires you to re-pair your Sonarr and Radarr installation.
* NEW: Added action cards for adding series and movies to Sonarr and Radarr through voice commands
* IMPROVEMENT: Added check in API if incoming IP matches IP of Sonarr or Radarr device
* FIX: fixed a type-o in the hint of the Sonarr calendar card

### 2017-06-08 -- v1.0.0
* Initial version
