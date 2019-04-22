const {handler} = require('./index')

describe('index', () => {

  it('returns 404s for unknown paths', async () => {
    expect(await handler({})).toMatchObject({statusCode: 404})
    expect(await handler({path: '/any/path'})).toMatchObject({statusCode: 404})
    expect(await handler({path: '/any/i.gif'})).toMatchObject({statusCode: 404})
    expect(await handler({path: '/i.png'})).toMatchObject({statusCode: 404})
  })

  it('returns a pixel', async () => {
    const resp = await handler({path: '/i.gif'})
    expect(resp.statusCode).toEqual(200)
    expect(resp.headers['content-type']).toEqual('image/gif')
    expect(resp.headers['content-length']).toEqual(35)
    expect(resp.isBase64Encoded).toEqual(true)
    expect(new Buffer(resp.body, 'base64').byteLength).toEqual(35)
  })

})
