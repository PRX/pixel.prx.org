jest.mock('lambda-log')

const log = require('lambda-log')
const tracker = require('./tracker')

describe('tracker', () => {

  const myData = {agent: 'my-agent', canonical: 'my-url', ip: 'my-ip', key: 'my-key', referrer: 'my-ref'}

  it('tracks pixel impressions', async () => {
    await tracker.log('my-key', 'my-url', 'my-agent', 'my-ip', 'my-ref')
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('track')
    expect(log.__info[0].data).toEqual(myData)
  })

  it('skips lack of key', async () => {
    await tracker.log(null, 'my-url', 'my-agent', 'my-ip', 'my-ref')
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, key: null, reason: 'no-data'})
  })

  it('skips lack of canonical url', async () => {
    await tracker.log('my-key', null, 'my-agent', 'my-ip', 'my-ref')
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, canonical: null, reason: 'no-data'})
  })

  it('skips lack of user agent', async () => {
    await tracker.log('my-key', 'my-url', null, 'my-ip', 'my-ref')
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, agent: null, reason: 'no-agent'})
  })

  it('skips lack of ip address', async () => {
    await tracker.log('my-key', 'my-url', 'my-agent', null, 'my-ref')
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, ip: null, reason: 'no-ip'})
  })

  it('allows lack of referrer', async () => {
    await tracker.log('my-key', 'my-url', 'my-agent', 'my-ip')
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('track')
    expect(log.__info[0].data).toEqual({...myData, referrer: undefined})
  })

  it('skips bots', async () => {
    await tracker.log('my-key', 'my-url', 'GoogleBot', 'my-ip', 'my-ref')
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, agent: 'GoogleBot', reason: 'bot'})
  })

})
