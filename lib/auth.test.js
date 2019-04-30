const nock = require('nock')
const auth = require('./auth')

describe('auth', () => {

  beforeEach(() => {
    process.env['ID_HOST'] = 'id.testing.prx.tech'
  })

  it('sends cookies on to id', async () => {
    const reqheaders = {cookie: 'my-cookie'}
    const json = {sub: 123, name: 'Test', preferred_username: 'testuser'}
    const scope = nock('https://id.testing.prx.tech', {reqheaders})
      .get('/userinfo')
      .query({scope: 'profile'})
      .reply(200, json)

    const user = await auth.currentUser('my-cookie')
    expect(user).toEqual(json)
    expect(scope.isDone()).toEqual(true)
  })

  it('handles blank cookie strings', async () => {
    expect(await auth.currentUser('')).toEqual(false)
  })

  it('allows anonymous access without an ENV', async () => {
    process.env['ID_HOST'] = ''
    expect(await auth.currentUser()).toMatchObject({name: 'Anonymous'})
  })

  it('changes protocol based on domain', async () => {
    process.env['ID_HOST'] = 'id.foo.bar'

    const scope = nock('http://id.foo.bar')
      .get('/userinfo')
      .query({scope: 'profile'})
      .reply(200, {some: 'data'})

    const user = await auth.currentUser('my-cookie')
    expect(user).toEqual({some: 'data'})
    expect(scope.isDone()).toEqual(true)
  })

  it('catches 401s', async () => {
    const scope = nock('https://id.testing.prx.tech')
      .get('/userinfo')
      .query({scope: 'profile'})
      .reply(401)

    const user = await auth.currentUser('my-cookie')
    expect(user).toEqual(false)
    expect(scope.isDone()).toEqual(true)
  })

  it('throws 500s', async () => {
    const scope = nock('https://id.testing.prx.tech')
      .get('/userinfo')
      .query({scope: 'profile'})
      .reply(500)
    try {
      await auth.currentUser('my-cookie')
      fail('should have gotten an error')
    } catch (err) {
      expect(err.message).toEqual('Got 500 from https://id.testing.prx.tech/userinfo')
    }
  })

})
