const express = require('express')
const { spawnSync } = require('child_process')
const url = require('url');

const castPath = '/Users/ssp/bin/cast'

const app = express()
const port = 10000

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

app.use(express.static('static'))

app.listen(port, () => {
    console.log(`Caster app listening at http://localhost:${port}`)
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
    const result = spawnSync(castPath, arguments)
    return result.status === 0
}
