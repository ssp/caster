const express = require('express')
const { spawnSync } = require('child_process')
const url = require('url');
const fs = require('fs');
const { exit, env } = require('process');

const goCastPath = env.CASTER_GO_CAST_PATH
if(!fs.existsSync(goCastPath)) {
    console.error(`go-cast binary not found. Find the binary at https://github.com/barnybug/go-cast/releases/ and set the path to it in CASTER_GO_CAST_PATH.`)
    exit(1)
}

const port = env.CASTER_PORT || 10000

const app = express()

app.get('/cast/:chromecastName', (request, res) => {
    const URLStringToCast = request.query['url']
    const URLError = validateURL(URLStringToCast)
    if (URLError) {
        return res.status(400).send(URLError)
    }

    const chromecastName = request.params.chromecastName
    if (!chromecastName) {
        return res.status(400).send(`path »${request.path}« needs to contain non-empty Chromecast name after /cast/.`)
    }

    if (!runCastCommand(chromecastName, ['quit'])) {
        res.status(500).send(`Could not quit current application on »${chromecastName}«.`)
        return
    }

    if (!runCastCommand(chromecastName, ['url', 'load', URLStringToCast])) {
        res.status(500).send(`No successful answer from Chromecast within timeout for showing »${URLStringToCast}« on »${chromecastName}«. It may have worked nonetheless.`)
        return
    }

    res.send(`showing URL »${URLStringToCast}« on »${chromecastName}«`)
})

app.use(express.static(`${__dirname}/static`))

app.listen(port, () => {
    console.log(`Caster app listening at http://localhost:${port}. Set the port using the CASTER_PORT environment variable.`)
})

function validateURL(URLStringToCast) {
    if (!URLStringToCast) {
        return '»url« parameter must be non-empty.'
    }

    try {
        new url.URL(URLStringToCast)
        return ''
    } catch (e) {
        return `value »${URLStringToCast}« in parameter »url« is not a valid URL.`
    }
}

function runCastCommand(chromecastName, commandParts) {
    const baseArguments = ['--name', chromecastName]
    const arguments = baseArguments.concat(commandParts)
    const result = spawnSync(goCastPath, arguments)
    return result.status === 0
}
