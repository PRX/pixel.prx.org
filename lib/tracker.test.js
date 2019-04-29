jest.mock('lambda-log')

const log = require('lambda-log')
const tracker = require('./tracker')

describe('tracker', () => {

  const query = {k: 'my-key', c: 'my-url'}
  const headers = {'user-agent': 'my-agent', 'x-forwarded-for': 'my-ip', 'referer': 'my-ref'}
  const identity = {sourceIp: 'source-ip'}
  const myData = {agent: 'my-agent', canonical: 'my-url', ip: 'my-ip', key: 'my-key', referrer: 'my-ref'}

  it('tracks pixel impressions', async () => {
    await tracker.log(query, headers)
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('track')
    expect(log.__info[0].data).toEqual(myData)
  })

  it('skips lack of key', async () => {
    await tracker.log({...query, k: null}, headers)
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, key: null, reason: 'no-data'})
  })

  it('skips lack of canonical url', async () => {
    await tracker.log({...query, c: null}, headers)
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, canonical: null, reason: 'no-data'})
  })

  it('skips lack of user agent', async () => {
    await tracker.log(query, {...headers, 'user-agent': null})
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, agent: null, reason: 'no-agent'})
  })

  it('falls back to the identity source ip', async () => {
    await tracker.log(query, {...headers, 'x-forwarded-for': null}, identity)
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('track')
    expect(log.__info[0].data).toEqual({...myData, ip: 'source-ip'})
  })

  it('skips lack of ip address', async () => {
    await tracker.log(query, {...headers, 'x-forwarded-for': null}, {sourceIp: null})
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, ip: null, reason: 'no-ip'})
  })

  it('allows lack of referrer', async () => {
    await tracker.log(query, {...headers, 'referer': undefined})
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('track')
    expect(log.__info[0].data).toEqual({...myData, referrer: undefined})
  })

  it('skips bots', async () => {
    await tracker.log(query, {...headers, 'user-agent': 'GoogleBot'})
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, agent: 'GoogleBot', reason: 'bot'})
  })

})
