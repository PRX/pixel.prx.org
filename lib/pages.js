const auth = require('./auth')
const signer = require('./signer')
const util = require('./util')

/**
 * Static home page
 */
exports.home = () => {
  return util.html(`
    <html>
      <head><title>PRX Pixel Tracker</title></head>
      <body style="display:flex;justify-content:center;align-items:center">
        <div style="text-align:center">
          <h1>PRX Pixel Tracker</h1>
          <a style="display:block" href="https://github.com/PRX/pixel.prx.org">on GitHub</a>
        </div>
      </body>
    </html>
  `)
}

/**
 * Admin page to create new pixel trackers
 */
exports.admin = async (query = {}, headers = {}) => {
  const user = await auth.currentUser(headers['cookie'] || '')
  if (!user) {
    return util.text(401, 'Not Authorized')
  }

  const key = query['k'] || ''
  const canonical = query['c'] || ''
  const destination = query['d'] || ''
  const destinationsHtml = getDestinations(destination)
  const trackerHtml = getSignedTracker(headers['host'], key, canonical, destination)

  return util.html(`
    <html>
      <head>
        <title>PRX Pixel Tracker</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
      </head>
      <body class="container">
        <div class="row">
          <div class="col-3"></div>
          <form class="col-6" method="get">
            <h2 class="text-center">Generate pixel tracker</h2>

            <div class="form-group">
              <label for="inputKey">Key</label>
              <input name="k" value="${key}" type="text" class="form-control" id="inputKey" aria-describedby="keyHelp" placeholder="Enter key" required>
              <small id="keyHelp" class="form-text text-muted">This string ends up in the BigQuery "key" field.</small>
            </div>

            <div class="form-group">
              <label for="inputCanonical">Canonical URL</label>
              <input name="c" value="${canonical}" type="url" class="form-control" id="inputCanonical" aria-describedby="canonicalHelp" placeholder="Enter url" required>
              <small id="canonicalHelp" class="form-text text-muted">The canonical url for the content you're embedding</small>
            </div>

            <div class="form-group">
              <label for="inputDestination">Destination table</label>
              <select name="d" class="form-control" id="inputDestination" aria-describedby="destinationHelp" required>
                <option value="">Choose a table...</option>${destinationsHtml}
              </select>
              <small id="destinationHelp" class="form-text text-muted">The destination table in BigQuery</small>
            </div>

            <button style="margin-bottom:20px" class="btn btn-primary" type="submit">Generate</button>
            ${trackerHtml}
          </form>
        </div>

        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script
      </body>
    </html>
  `)
}

// translate ENV destination tables into options
const getDestinations = (selected) => {
  return (process.env['DESTINATIONS'] || '').split(',').map(o => {
    if (o === selected) {
      return `<option value="${o}" selected>${o}</option>`
    } else {
      return `<option value="${o}">${o}</option>`
    }
  }).join('')
}

// sign a tracker or return error message
const getSignedTracker = (host, k, c, d) => {
  if ((k || c || d) && !(k && c && d)) {
    return '<div><b style="color:#f00" class="error">Invalid fields</b></div>'
  } else if (k && c && d) {
    const signed = signer.signObject({k, c, d})
    const params = Object.keys(signed).map(k => `${k}=${encodeURIComponent(signed[k])}`)
    const url = host.match(/localhost|127.0.0.1/) ? `http://${host}/i.gif` : `https://${host}/i.gif`
    return `<input type="text" class="form-control" disabled value="${url}?${params.join('&')}">`
  } else {
    return ''
  }
}
