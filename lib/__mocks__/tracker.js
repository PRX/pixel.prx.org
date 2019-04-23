const tracker = jest.genMockFromModule('../tracker')

beforeEach(() => tracker.__log = [])

tracker.log = async function() {
  tracker.__log.push(Array.from(arguments))
}

module.exports = tracker
