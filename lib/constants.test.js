const constants = require('./constants')

describe('constants', () => {

  it('has the correct byte size', () => {
    const bytes = Buffer.byteLength(constants.pixel)
    expect(constants.pixelSize).toEqual(bytes)
  })

  it('translates to base 64', () => {
    const buffer1 = new Buffer(constants.base64Pixel, 'base64')
    const buffer2 = new Buffer('A' + constants.base64Pixel, 'base64')
    expect(buffer1).toEqual(constants.pixel)
    expect(buffer2).not.toEqual(constants.pixel)
  })

})
