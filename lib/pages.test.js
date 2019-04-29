const pages = require('./pages')

describe('pages', () => {

  it('returns the home page', () => {
    const resp = pages.home()
    expect(resp.statusCode).toEqual(200)
    expect(resp.body).toMatch('<html>')
  })

})
