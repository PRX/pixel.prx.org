jest.mock('aws-sdk')

const sdk = require('aws-sdk')
const kinesis = require('./kinesis')


describe('kinesis', () => {

  beforeEach(() => process.env.KINESIS_STREAM = 'test-stream')

  it('puts data to kinesis', async () => {
    await kinesis.put({foo: 'bar'})
    expect(sdk.__kinesisPuts.length).toEqual(1)
    expect(sdk.__kinesisPuts[0].Data).toEqual('{"foo":"bar"}')
  })

  it('sets a unique partition key', async () => {
    await kinesis.put({foo: 'bar1'})
    await kinesis.put({foo: 'bar1'})
    await kinesis.put({foo: 'bar2'})
    await kinesis.put({foo: 'bar3'})
    expect(sdk.__kinesisPuts.length).toEqual(4)
    expect(sdk.__kinesisPuts[0].PartitionKey).toEqual(sdk.__kinesisPuts[1].PartitionKey)
    expect(sdk.__kinesisPuts[0].PartitionKey).not.toEqual(sdk.__kinesisPuts[2].PartitionKey)
    expect(sdk.__kinesisPuts[0].PartitionKey).not.toEqual(sdk.__kinesisPuts[3].PartitionKey)
  })

  it('sets a kinesis stream', async () => {
    process.env.KINESIS_STREAM = 'anything'
    await kinesis.put({foo: 'bar'})
    expect(sdk.__kinesisPuts.length).toEqual(1)
    expect(sdk.__kinesisPuts[0].StreamName).toEqual('anything')
  })

  it('ignores puts with no stream set', async () => {
    process.env.KINESIS_STREAM = ''
    await kinesis.put({foo: 'bar'})
    expect(sdk.__kinesisPuts.length).toEqual(0)
  })

  it('decodes kinesis stream arns', async () => {
    process.env.KINESIS_STREAM = 'arn:aws:kinesis:us-east-1:12345678:stream/anything'
    await kinesis.put({foo: 'bar'})
    expect(sdk.__kinesisPuts.length).toEqual(1)
    expect(sdk.__kinesisPuts[0].StreamName).toEqual('anything')
  })

  it('throws kinesis errors', async () => {
    try {
      await kinesis.put({throw: true})
      fail('should have gotten an error')
    } catch (err) {
      expect(err.message).toMatch(/FakeKinesis throws error/)
    }
  })

})
