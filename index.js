'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const fs_1 = require('fs')
const electron_1 = require('electron')
const sharp = require('sharp')
const Debug = require('debug')
const debug = Debug('electron-exif-rotate')
function install() {
  electron_1.protocol.interceptBufferProtocol('https', (req, callback) => {
    debug(req)
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
    if (req.uploadData) {
      req.uploadData.forEach(part => {
        debug(part)
        if (part.bytes) request.write(part.bytes)
        else if (part.file) request.write(fs_1.readFileSync(part.file))
      })
    }
    request.end()
  })
}
exports.install = install
