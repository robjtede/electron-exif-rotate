import { net, protocol } from 'electron'
import sharp = require('sharp')

export function install() {
  protocol.interceptBufferProtocol('https', (req, callback) => {
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

    request.end()
  })
}
