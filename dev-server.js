require('dotenv').config()
const express = require('express')
const handler = require('./index')
const app = express()
const port = process.env.PORT || 3000

// pretend to be an api-gateway
app.use(async (req, res) => {
  const event = {
    resource: (req.path === '/') ? '/' : '/{proxy+}',
    path: req.path,
    httpMethod: req.method,
    headers: req.headers || {},
    queryStringParameters: req.query || null,
    pathParameters: (req.path === '/') ? null : {proxy: req.path},
    stageVariables: null,
    requestContext: {identity: {sourceIp: req.connection.remoteAddress}},
    isBase64Encoded: false,
  }
  try {
    const data = await handler.handler(event)
    if (data.statusCode) {
      res.status(data.statusCode)
      res.set(data.headers || {})
      if (data.body && data.isBase64Encoded) {
        const buff = Buffer.from(data.body, 'base64')
        res.send(buff)
      } else if (data.body) {
        res.send(data.body)
      } else {
        res.end()
      }
    } else {
      res.status(500).send(`Lambda returned no statusCode: ${JSON.stringify(data)}`)
    }
  } catch (err) {
    res.status(500).send(`Lambda Error: ${err}`)
  }
})

// listener
app.listen(port)
console.log(`Express listening on port ${port}...`)
