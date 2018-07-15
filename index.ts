import { readFileSync } from 'fs'
import { net, protocol } from 'electron'
import sharp = require('sharp')
import Debug = require('debug')

const debug = Debug('electron-exif-rotate')

export function install() {
  protocol.interceptBufferProtocol('https', (req, callback) => {
    debug(req)
    const request = net.request(req)

    request.on('response', res => {
      const chunks: Buffer[] = []

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
        else if (part.file) request.write(readFileSync(part.file))
      })
    }

    request.end()
  })
}
