exports.currentUser = async (cookieStr) => {
  if (cookieStr === 'valid-cookie') {
    return {sub: 123, name: 'Test', preferred_username: 'testuser'}
  } else if (cookieStr === 'invalid-cookie') {
    return false
  } else {
    throw new Error(`Unrecognized test cookie: ${cookieStr}`)
  }
}
