jest.mock('./auth')

const pages = require('./pages')
const signer = require('./signer')

describe('pages', () => {

  it('returns the home page', () => {
    const resp = pages.home()
    expect(resp.statusCode).toEqual(200)
    expect(resp.body).toMatch('<html>')
  })

  it('returns a 401 for admin page without auth', async () => {
    const resp = await pages.admin({}, {cookie: 'invalid-cookie'})
    expect(resp.statusCode).toEqual(401)
  })

  it('returns the admin page with auth', async () => {
    const resp = await pages.admin({}, {cookie: 'valid-cookie'})
    expect(resp.statusCode).toEqual(200)
    expect(resp.body).toMatch('Generate pixel tracker')
  })

  it('generates the signed tracker url', async () => {
    const query = {k: 'key', c: 'canon', d: 'dest_tbl'}
    const headers = {host: 'pixel.testing.prx.tech', cookie: 'valid-cookie'}
    const resp = await pages.admin(query, headers)

    expect(resp.statusCode).toEqual(200)
    expect(resp.body).toMatch('https://pixel.testing.prx.tech/i.gif?k=key&c=canon&d=dest_tbl&s=')

    const match = resp.body.match(/i\.gif\?.+&s=([^"]+)/)
    const sig = match[1]
    expect(sig.length).toBeGreaterThan(10)

    expect(signer.signObject(query).s).toEqual(sig)
    expect(signer.isValidObject({...query, s: sig})).toEqual(true)
  })

})
