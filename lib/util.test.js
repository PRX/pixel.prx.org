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

})
