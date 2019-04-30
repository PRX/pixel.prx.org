const log = require('lambda-log')
const signer = require('./signer')
const util = require('./util')

/**
 * Log a pixel tracking impression
 */
exports.log = async (query, headers, identity) => {
  query = query || {}
  headers = headers || {}
  identity = identity || {}

  const agent = headers['user-agent']
  const ip = headers['x-forwarded-for'] || identity['sourceIp']
  const referrer = headers['referer']
  const data = {
    key: query['k'],
    canonical: query['c'],
    destination: query['d'],
    agent,
    ip,
    referrer,
  }

  const reason = skipReason(query, agent, ip)
  if (reason) {
    log.info('skip', {reason, ...data})
  } else {
    log.info('track', data)
  }
}

const skipReason = (query, agent, ip) => {
  if (!signer.isValidObject(query)) return 'invalid'
  if (!query['k'] || !query['c'] || !query['d']) return 'no-data'
  if (!agent) return 'no-agent'
  if (!ip) return 'no-ip'
  if (util.isBot(agent)) return 'bot'
}
