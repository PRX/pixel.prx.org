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
