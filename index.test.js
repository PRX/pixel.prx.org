jest.mock('lambda-log')
jest.mock('./lib/tracker')

const log = require('lambda-log')
const tracker = require('./lib/tracker')
const {handler} = require('./index')

describe('index', () => {

  const event = {
    httpMethod: 'GET',
    path: '/i.gif',
    headers: {
      'user-agent': 'my-agent',
      'x-forwarded-for': '98.76.54.321',
      'referer': 'https://www.prx.org/',
    },
    queryStringParameters: {
      k: 'my-key-here',
      c: 'http://the.canonical/url',
    },
    requestContext: {
      identity: {
        sourceIp: '123.456.78.9'
      },
    },
  }

  it('returns a pixel', async () => {
    const resp = await handler(event)
    expect(resp.statusCode).toEqual(200)
    expect(resp.headers['content-type']).toEqual('image/gif')
    expect(resp.headers['content-length']).toEqual(35)
    expect(resp.isBase64Encoded).toEqual(true)
    expect(Buffer.from(resp.body, 'base64').byteLength).toEqual(35)
  })

  it('returns the homepage', async () => {
    const resp = await handler({...event, path: '/'})
    expect(resp.statusCode).toEqual(200)
    expect(resp.headers['content-type']).toEqual('text/html')
    expect(resp.body).toMatch('<html>')
  })

  it('tracks impressions', async () => {
    expect(await handler(event)).toMatchObject({statusCode: 200})
    expect(tracker.__log.length).toEqual(1)
    expect(tracker.__log[0].query).toEqual({k: 'my-key-here', c: 'http://the.canonical/url'})
    expect(tracker.__log[0].headers).toEqual({
      'user-agent': 'my-agent',
      'x-forwarded-for': '98.76.54.321',
      'referer': 'https://www.prx.org/',
    })
  })

  it('lowercases header values', async () => {
    const headers = {'User-Agent': 'agent2', 'x-FORwarDED-for': 'ip2', 'Referer': 'ref2'}
    expect(await handler({...event, headers})).toMatchObject({statusCode: 200})
    expect(tracker.__log.length).toEqual(1)
    expect(tracker.__log[0].headers).toEqual({
      'user-agent': 'agent2',
      'x-forwarded-for': 'ip2',
      'referer': 'ref2',
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
    expect(tracker.__log.length).toEqual(1)
    expect(tracker.__log[0].identity).toEqual({sourceIp: '123.456.78.9'})
  })

  it('catches and logs errors', async () => {
    const err = new Error('something went horribly wrong')
    jest.spyOn(tracker, 'log').mockImplementation(async () => { throw err })
    expect(await handler(event)).toMatchObject({statusCode: 500})
    expect(log.__error.length).toEqual(1)
    expect(log.__error[0].msg).toEqual(err)
  })

})
