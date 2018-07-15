'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const electron_1 = require('electron')
const sharp = require('sharp')
function install() {
  electron_1.protocol.interceptBufferProtocol('https', (req, callback) => {
    const request = electron_1.net.request(req)
    request.on('response', res => {
      const chunks = []
      res.on('data', chunk => {
        chunks.push(Buffer.from(chunk))
      })
      res.on('end', () => {
        const file = Buffer.concat(chunks)
        if (
          'content-type' in res.headers &&
          res.headers['content-type'].includes('image/jpeg')
        ) {
          sharp(file)
            .rotate()
            .toBuffer()
            .then(callback)
            .catch(console.error)
        } else {
          callback(file)
        }
      })
    })
    request.end()
  })
}
exports.install = install
