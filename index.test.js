jest.mock('lambda-log')
jest.mock('./lib/tracker')

const log = require('lambda-log')
const signer = require('./lib/signer')
const tracker = require('./lib/tracker')
const {handler} = require('./index')

describe('index', () => {

  const event = {
    httpMethod: 'GET',
    path: '/i.gif',
    headers: {
      'cookie': '_pxid=my-user-id',
      'user-agent': 'my-agent',
      'x-forwarded-for': '98.76.54.321',
      'referer': 'https://www.prx.org/',
    },
    queryStringParameters: {
      k: 'my-key-here',
      c: 'http://the.canonical/url',
      d: 'the-destination',
    },
    requestContext: {
      identity: {
        sourceIp: '123.456.78.9'
      },
    },
  }
  event.queryStringParameters = signer.signObject(event.queryStringParameters)

  const logged = {
    canonical: 'http://the.canonical/url',
    destination: 'the-destination',
    key: 'my-key-here',
    remoteAgent: 'my-agent',
    remoteIp: '98.76.54.321',
    remoteReferrer: 'https://www.prx.org/',
    userId: 'my-user-id',
  }

  it('returns a pixel', async () => {
    const resp = await handler(event)
    expect(resp.statusCode).toEqual(200)
    expect(resp.headers['content-type']).toEqual('image/gif')
    expect(resp.headers['content-length']).toEqual(35)
    expect(resp.isBase64Encoded).toEqual(true)
    expect(Buffer.from(resp.body, 'base64').byteLength).toEqual(35)
    expect(tracker.__skips.length).toEqual(0)
    expect(tracker.__tracks.length).toEqual(1)
    expect(tracker.__tracks[0]).toEqual(logged)
  })

  it('returns a pixel and skips', async () => {
    const resp = await handler({...event, queryStringParameters: {}})
    expect(resp.statusCode).toEqual(200)
    expect(resp.headers['content-type']).toEqual('image/gif')
    expect(tracker.__tracks.length).toEqual(0)
    expect(tracker.__skips.length).toEqual(1)
    expect(tracker.__skips[0]).toEqual({...logged, canonical: undefined, key: undefined, destination: undefined})
    expect(tracker.__reasons[0]).toEqual('invalid')
  })

  it('returns a redirect pixel', async () => {
    const resp = await handler({...event, path: '/r.gif'})
    expect(resp.statusCode).toEqual(200)
    expect(resp.headers['content-type']).toEqual('image/gif')
    expect(tracker.__skips.length).toEqual(0)
    expect(tracker.__tracks.length).toEqual(1)
    expect(tracker.__tracks[0]).toEqual(logged)
  })

  it('returns a redirect pixel without a cookie', async () => {
    const resp = await handler({...event, headers: {...event.headers, cookie: ''}, path: '/r.gif'})
    expect(resp.statusCode).toEqual(200)
    expect(resp.headers['content-type']).toEqual('image/gif')
    expect(tracker.__skips.length).toEqual(0)
    expect(tracker.__tracks.length).toEqual(1)
    expect(tracker.__tracks[0]).toEqual({...logged, userId: undefined})
  })

  it('redirects to a pixel with a cookie', async () => {
    const resp = await handler({...event, headers: {host: 'my.host.name'}})
    const sign = event.queryStringParameters.s
    const loc = `/r.gif?k=my-key-here&c=http%3A%2F%2Fthe.canonical%2Furl&d=the-destination&s=${sign}`
    expect(resp.statusCode).toEqual(302)
    expect(resp.headers['content-type']).toEqual('text/plain')
    expect(resp.headers['location']).toEqual(loc)
    expect(tracker.__skips.length).toEqual(0)
    expect(tracker.__tracks.length).toEqual(0)

    const cookie = resp.headers['set-cookie'] || ''
    expect(cookie).toMatch(/_pxid=[^;]+;/)
    expect(cookie).toMatch(/Expires=[^;]+/)
    expect(cookie).toMatch(/Domain=my\.host\.name/)
  })

  it('returns the homepage', async () => {
    const resp = await handler({...event, path: '/'})
    expect(resp.statusCode).toEqual(200)
    expect(resp.headers['content-type']).toEqual('text/html')
    expect(resp.body).toMatch('<html>')
  })

  it('lowercases header values', async () => {
    const headers = {'CoOkie': '_pxid=my-user-id', 'User-Agent': 'agent2', 'x-FORwarDED-for': 'ip2', 'Referer': 'ref2'}
    expect(await handler({...event, headers})).toMatchObject({statusCode: 200})
    expect(tracker.__skips.length).toEqual(0)
    expect(tracker.__tracks.length).toEqual(1)
    expect(tracker.__tracks[0]).toEqual({
      ...logged,
      remoteAgent: 'agent2',
      remoteIp: 'ip2',
      remoteReferrer: 'ref2',
    })
  })

  it('responds to HEAD requests', async () => {
    expect(await handler({...event, httpMethod: 'HEAD'})).toMatchObject({statusCode: 200})
  })

  it('returns 405 for bad methods', async () => {
    expect(await handler({...event, httpMethod: 'PUT'})).toMatchObject({statusCode: 405})
    expect(await handler({...event, httpMethod: 'PATCH'})).toMatchObject({statusCode: 405})
    expect(await handler({...event, httpMethod: 'POST'})).toMatchObject({statusCode: 405})
    expect(await handler({...event, httpMethod: 'DELETE'})).toMatchObject({statusCode: 405})
    expect(await handler({...event, httpMethod: 'OPTIONS'})).toMatchObject({statusCode: 405})
  })

  it('returns 404s for unknown paths', async () => {
    expect(await handler({...event, path: '/any/path'})).toMatchObject({statusCode: 404})
    expect(await handler({...event, path: '/any/i.gif'})).toMatchObject({statusCode: 404})
    expect(await handler({...event, path: '/i.png'})).toMatchObject({statusCode: 404})
  })

  it('falls back to the source ip', async () => {
    const headers = {...event.headers, 'x-forwarded-for': undefined}
    expect(await handler({...event, headers})).toMatchObject({statusCode: 200})
    expect(tracker.__tracks.length).toEqual(1)
    expect(tracker.__tracks[0].remoteIp).toEqual('123.456.78.9')
  })

  it('catches and logs errors', async () => {
    const err = new Error('something went horribly wrong')
    jest.spyOn(tracker, 'log').mockImplementation(async () => { throw err })
    expect(await handler(event)).toMatchObject({statusCode: 500})
    expect(log.__error.length).toEqual(1)
    expect(log.__error[0].msg).toEqual(err)
  })

})
