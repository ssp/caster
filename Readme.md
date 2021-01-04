# Caster
Tools to simplify displaying web pages on your Chromecast.

The actual work of controlling the Chromecast is done by the
[go-cast](https://github.com/barnybug/go-cast) tool which needs
to be present on the system running the software.

## Server
Start the server using `node index.js`.

Its `/cast/CHROMECAST_NAME` endpoint will accept a URL in the `url` query parameter
and display that on the Chromecast named `CHROMECAST_NAME` on your local network.
Keep in mind that you need to percent-escape your URLs to not lose their
query parameters.

### Setup
You will need the [go-cast](https://github.com/barnybug/go-cast) tool
on your system and set the path to its executable in the
`CASTER_GO_CAST_PATH` environment variable.

Caster will listen on port `10000`. You can adjust that using the
`CASTER_PORT` environment variable.

### macOS LaunchAgent
A LaunchAgent for macOS is provided in
[macOS/net.earthlingsoft.caster.plist](macOS/net.earthlingsoft.caster.plist).

Place that file in `~/Library LaunchAgents` and adjust the environment variables
in the file to suit your system.

Then activate the LaunchAgent using
`launchctl load -w ~/Library/LaunchAgents/net.earthlingsoft.caster.plist`.

To remove the LaunchAgent, run
`launchctl unload -w ~/Library/LaunchAgents/net.earthlingsoft.caster.plist`
and then remove the file.

### Example
With the server running on `localhost:10000`, display the
[earthlingsoft home page](https://earthlingsoft.net) on the Chromecast
`Wohnzimmer`.

    curl https://localhost:10000/cast/Wohnzimmer?url=https%3A%2F%2Fearthlingsoft.net

## Caster web page
At `/caster` the server provides a simple web page with a form to enter
the name of the Chromecast and the URL to display on it.

## Slideshow web page
At `/slideshow` the server provides a simple web page that displays
an iframe with the content of each `url` query parameter (escaping!)
for 30 seconds and cycles through them.

The display duration can be controlled using the `seconds` parameter.

As many websites don’t allow embedding these days, don’t expect this
to work with all pages.

Sending this URL to your Chromecast lets you cycle through the given pages.
