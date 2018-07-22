'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const tslib_1 = require('tslib')
const Debug = require('debug')
const electron_1 = require('electron')
const fs_1 = require('fs')
const sharp = require('sharp')
const debug = Debug('electron-exif-rotate')
function install() {
  electron_1.protocol.interceptBufferProtocol('https', (req, callback) => {
    debug('request', req)
    const request = electron_1.net.request(req)
    request.chunkedEncoding = true
    request.on('response', res => {
      const chunks = []
      res.on('data', chunk => {
        chunks.push(Buffer.from(chunk))
      })
      res.on('end', () =>
        tslib_1.__awaiter(this, void 0, void 0, function*() {
          const file = Buffer.concat(chunks)
          if (
            'content-type' in res.headers &&
            (res.headers['content-type'].includes('image/jpeg') ||
              res.headers['content-type'].includes('image/tiff'))
          ) {
            const buffer = yield sharp(file)
              .withMetadata()
              .rotate()
              .toBuffer()
            callback(buffer)
          } else {
            callback(file)
          }
        })
      )
    })
    request.on('error', err => {
      debug('request error', err)
      callback()
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
