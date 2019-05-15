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

  it('encodes a query object', () => {
    expect(util.encodeQuery()).toEqual('')
    expect(util.encodeQuery({})).toEqual('')
    expect(util.encodeQuery({foo: 'bar', a: 'b'})).toEqual('?foo=bar&a=b')
    expect(util.encodeQuery({hello: 'esc=ap&stuff'})).toEqual('?hello=esc%3Dap%26stuff')
  })

  it('adds years to dates', () => {
    const date = new Date('1999-01-01')
    expect(util.future(1, date).toISOString()).toEqual('2000-01-01T00:00:00.000Z')
    expect(util.future(2, date).toISOString()).toEqual('2001-01-01T00:00:00.000Z')
    expect(util.future(5, date).toISOString()).toEqual('2004-01-01T00:00:00.000Z')
  })

  it('returns api gateway text', () => {
    expect(util.text(123, 'anything')).toEqual({
      statusCode: 123,
      body: 'anything',
      headers: {'content-type': 'text/plain'}
    })
  })

  it('returns api gateway redirects', () => {
    expect(util.redirect('/some/where')).toEqual({
      statusCode: 302,
      body: 'Redirecting to /some/where',
      headers: {'content-type': 'text/plain', 'location': '/some/where'},
    })
  })

  it('returns api gateway redirects with a cookie', () => {
    expect(util.redirect('/some/where', 'set=the-cookie')).toEqual({
      statusCode: 302,
      body: 'Redirecting to /some/where',
      headers: {'content-type': 'text/plain', 'location': '/some/where', 'set-cookie': 'set=the-cookie'},
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
