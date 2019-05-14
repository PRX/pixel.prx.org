exports.__kinesisPuts = []
beforeEach(() => exports.__kinesisPuts = [])

/**
 * Just log kinesis calls
 */
exports.Kinesis = class FakeKinesis {
  putRecord(data) {
    return {
      promise: async () => {
        if (data.Data && data.Data.match(/throw/)) {
          throw new Error('FakeKinesis throws error')
        } else {
          exports.__kinesisPuts.push(data)
          return null
        }
      }
    }
  }
}
