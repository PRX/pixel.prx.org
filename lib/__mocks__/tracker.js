const tracker = jest.genMockFromModule('../tracker')

beforeEach(() => tracker.__log = [])

tracker.log = async function(query, headers, identity) {
  tracker.__log.push({query, headers, identity})
}

module.exports = tracker
