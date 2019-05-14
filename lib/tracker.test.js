jest.mock('lambda-log')

const log = require('lambda-log')
const tracker = require('./tracker')
const signer = require('./signer')

describe('tracker', () => {

  const query = signer.signObject({k: 'my-key', c: 'my-url', d: 'my-dest'})
  const headers = {'user-agent': 'my-agent', 'x-forwarded-for': 'my-ip', 'referer': 'my-ref'}
  const identity = {sourceIp: 'source-ip'}
  const myData = {
    canonical: 'my-url',
    destination: 'my-dest',
    key: 'my-key',
    remoteAgent: 'my-agent',
    remoteIp: 'my-ip',
    remoteReferrer: 'my-ref',
  }

  it('tracks pixel impressions', async () => {
    await tracker.log(query, headers)
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('track')
    expect(log.__info[0].data).toEqual(myData)
  })

  it('skips invalid signatures', async () => {
    await tracker.log({...query, s: 'whatever'}, headers)
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, reason: 'invalid'})
  })

  it('skips lack of key', async () => {
    await tracker.log(signer.signObject({...query, k: null}), headers)
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, key: null, reason: 'no-data'})
  })

  it('skips lack of canonical url', async () => {
    await tracker.log(signer.signObject({...query, c: null}), headers)
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, canonical: null, reason: 'no-data'})
  })

  it('skips lack of destination table', async () => {
    await tracker.log(signer.signObject({...query, d: null}), headers)
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, destination: null, reason: 'no-data'})
  })

  it('skips lack of user agent', async () => {
    await tracker.log(query, {...headers, 'user-agent': null})
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, remoteAgent: null, reason: 'no-agent'})
  })

  it('falls back to the identity source ip', async () => {
    await tracker.log(query, {...headers, 'x-forwarded-for': null}, identity)
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('track')
    expect(log.__info[0].data).toEqual({...myData, remoteIp: 'source-ip'})
  })

  it('skips lack of ip address', async () => {
    await tracker.log(query, {...headers, 'x-forwarded-for': null}, {sourceIp: null})
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, remoteIp: null, reason: 'no-ip'})
  })

  it('allows lack of referrer', async () => {
    await tracker.log(query, {...headers, 'referer': undefined})
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('track')
    expect(log.__info[0].data).toEqual({...myData, remoteReferrer: undefined})
  })

  it('skips bots', async () => {
    await tracker.log(query, {...headers, 'user-agent': 'GoogleBot'})
    expect(log.__info.length).toEqual(1)
    expect(log.__info[0].msg).toEqual('skip')
    expect(log.__info[0].data).toEqual({...myData, remoteAgent: 'GoogleBot', reason: 'bot'})
  })

})
