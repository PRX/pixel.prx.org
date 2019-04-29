const util = require('./util')

describe('util', () => {

  it('recognizes bots', () => {
    expect(util.isBot()).toEqual(true)
    expect(util.isBot('')).toEqual(true)
    expect(util.isBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toEqual(true)
    expect(util.isBot('Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)')).toEqual(true)
  })

  it('lowercases keys', () => {
    expect(util.keysToLowerCase()).toEqual({})
    expect(util.keysToLowerCase({})).toEqual({})
    expect(util.keysToLowerCase({HELLO: '1'}).hello).toEqual('1')
    expect(util.keysToLowerCase({hello: '1'}).hello).toEqual('1')
    expect(util.keysToLowerCase({heLlo: '1'}).hello).toEqual('1')
  })

  it('returns api gateway text', () => {
    expect(util.text(123, 'anything')).toEqual({
      statusCode: 123,
      body: 'anything',
      headers: {'content-type': 'text/plain'}
    })
  })

  it('returns api gateway html', () => {
    expect(util.html('<h1>anything</h1>')).toEqual({
      statusCode: 200,
      body: '<h1>anything</h1>',
      headers: {'content-type': 'text/html'}
    })
  })

  it('returns api gateway pixel', () => {
    const resp = util.pixel()
    expect(resp.statusCode).toEqual(200)
    expect(resp.headers).toEqual({'content-type': 'image/gif', 'content-length': 35})
    expect(resp.isBase64Encoded).toEqual(true)
    expect(Buffer.from(resp.body, 'base64').byteLength).toEqual(35)
  })

})
