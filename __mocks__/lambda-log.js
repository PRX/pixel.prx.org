const log = jest.genMockFromModule('lambda-log')

beforeEach(() => {
  log.__debug = []
  log.__info = []
  log.__warn = []
  log.__error = []
})

log.debug = (msg, data = {}) => log.__debug.push({msg, data})
log.info = (msg, data = {}) => log.__info.push({msg, data})
log.warn = (msg, data = {}) => log.__warn.push({msg, data})
log.error = (msg, data = {}) => log.__error.push({msg, data})

module.exports = log
