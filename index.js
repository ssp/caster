const express = require('express')
const { spawnSync } = require('child_process')
const url = require('url');

const castPath = '/Users/ssp/bin/cast'
const chromecastName = 'Wohnzimmer'

const app = express()
const port = 10000

app.get('/cast', (req, res) => {
    const URLStringToCast = req.query['url']
    const URLError = validateURL(URLStringToCast)
    if (URLError) {
        return res.status(400).send(URLError)
    }

    if (!runCastCommand(['quit'])) {
        res.status(500).send(`Could not quit current application on »${chromecastName}«`)
        return
    }

    if (!runCastCommand(['url', 'load', URLStringToCast])) {
        res.status(500).send(`Could not show »${URLStringToCast}« on »${chromecastName}«`)
        return
    }

    res.send(`showing URL »${URLStringToCast}« on »${chromecastName}«`)
})

app.listen(port, () => {
    console.log(`Caster app listening at http://localhost:${port}`)
})

function validateURL(URLStringToCast) {
    if (!URLStringToCast) {
        return '»url« parameter must be non-empty'
    }

    try {
        new url.URL(URLStringToCast)
        return ''
    } catch (e) {
        return `value »${URLStringToCast}« in parameter »url« is not a valid URL`
    }
}

function runCastCommand(commandParts) {
    const baseArguments = ['--name', chromecastName]
    const arguments = baseArguments.concat(commandParts)
    const result = spawnSync(castPath, arguments)
    return result.status === 0
}
