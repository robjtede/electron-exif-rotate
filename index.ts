import Debug = require('debug')
import { net, protocol } from 'electron'
import { readFileSync } from 'fs'
import sharp = require('sharp')

const debug = Debug('electron-exif-rotate')

export function install() {
  protocol.interceptBufferProtocol('https', (req, callback) => {
    debug('intercepted request', req)

    const request = net.request(req)
    // request.chunkedEncoding = true

    request.on('response', res => {
      const chunks: Buffer[] = []

      res.on('data', chunk => {
        chunks.push(Buffer.from(chunk))
      })

      res.on('end', async () => {
        const file = Buffer.concat(chunks)

        if (
          'content-type' in res.headers &&
          (res.headers['content-type'].includes('image/jpeg') ||
            res.headers['content-type'].includes('image/tiff'))
        ) {
          const buffer = await sharp(file)
            .withMetadata()
            .rotate()
            .toBuffer()

          callback(buffer)
        } else {
          callback(file)
        }
      })
    })

    request.on('error', err => {
      debug('request error', err)
      callback()
    })

    if (req.uploadData) {
      req.uploadData.forEach(part => {
        if (part.bytes) {
          debug(part.bytes.toString())
          request.write(part.bytes)
        } else if (part.file) {
          request.write(readFileSync(part.file))
        }
      })
    }

    request.end()
  })
}
