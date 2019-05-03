const tracker = require.requireActual('../tracker')

beforeEach(() => {
  tracker.__reasons = []
  tracker.__skips = []
  tracker.__tracks = []
})

jest.spyOn(tracker, 'logReason').mockImplementation(async (reason, data) => {
  if (reason) {
    tracker.__reasons.push(reason)
    tracker.__skips.push(data)
  } else {
    tracker.__tracks.push(data)
  }
})

module.exports = tracker
