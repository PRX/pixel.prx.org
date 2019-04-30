const signer = require('./signer')

describe('signer', () => {

  it('signs strings', () => {
    const sig1 = signer.sign('any-string-here')
    const sig2 = signer.sign('any-string-here', 'explicit-secret')
    const sig3 = signer.sign('other-string', 'explicit-secret')
    expect(sig1.length).toBeGreaterThan(10)
    expect(sig1).not.toEqual(sig2)
    expect(sig2).not.toEqual(sig3)

    expect(signer.isValid('any-string-here', sig1)).toEqual(true)
    expect(signer.isValid('any-string-here', sig2)).toEqual(false)
    expect(signer.isValid('any-string-here', sig2, 'explicit-secret')).toEqual(true)
    expect(signer.isValid('other-string', sig1, 'explicit-secret')).toEqual(false)
    expect(signer.isValid('other-string', sig2, 'explicit-secret')).toEqual(false)
    expect(signer.isValid('other-string', sig3, 'explicit-secret')).toEqual(true)
  })

  it('signs objects', () => {
    const obj = {a: 1, b: 2, c: 3}
    const signed = signer.signObject(obj)
    expect(obj).toEqual({a: 1, b: 2, c: 3})
    expect(signed).toMatchObject({a: 1, b: 2, c: 3})
    expect(signed.s.length).toBeGreaterThan(10)

    expect(signer.isValidObject(obj)).toEqual(false)
    expect(signer.isValidObject(signed)).toEqual(true)
    expect(signer.isValidObject({...signed, d: 4})).toEqual(false)
    expect(signer.isValidObject({...signed, s: 'bad'})).toEqual(false)
  })

  it('is order independent when signing objects', () => {
    const sign1 = signer.signObject({a: 1, b: 2, c: 3})
    const sign2 = signer.signObject({b: 2, a: 1, c: 3})
    expect(sign1.s).toEqual(sign2.s)
  })

  it('re-signs objects', () => {
    const sign1 = signer.signObject({a: 1, b: 2, c: 3})
    const sign2 = signer.signObject(sign1)
    const sign3 = signer.signObject(sign2)
    expect(sign1.s).toEqual(sign2.s)
    expect(sign2.s).toEqual(sign3.s)
  })

})
