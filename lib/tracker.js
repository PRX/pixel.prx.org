const log = require('lambda-log')
const kinesis = require('./kinesis')
const signer = require('./signer')
const util = require('./util')

/**
 * Log a pixel tracking impression
 */
exports.log = (query, headers, identity, userId) => {
  query = query || {}
  headers = headers || {}
  identity = identity || {}

  const remoteAgent = headers['user-agent']
  const remoteIp = headers['x-forwarded-for'] || identity['sourceIp']
  const remoteReferrer = headers['referer']

  // kinesis record MUST match analytics-ingest-lambda PixelTrackers input
  const data = {
    key: query['k'],
    canonical: query['c'],
    destination: query['d'],
    remoteAgent,
    remoteIp,
    remoteReferrer,
    userId,
  }

  const reason = skipReason(query, remoteAgent, remoteIp)
  return exports.logReason(reason, data)
}

/**
 * Actual logging
 */
exports.logReason = async (reason, data) => {
  if (reason) {
    log.info('skip', {reason, ...data})
    return false
  } else {
    log.info('track', data)
    await kinesis.put({type: 'pixel', timestamp: Date.now(), ...data})
    return true
  }
}

const skipReason = (query, agent, ip) => {
  if (!signer.isValidObject(query)) return 'invalid'
  if (!query['k'] || !query['c'] || !query['d']) return 'no-data'
  if (!agent) return 'no-agent'
  if (!ip) return 'no-ip'
  if (util.isBot(agent)) return 'bot'
}
