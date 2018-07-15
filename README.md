# electron-exif-rotate

> Automatically rotate images based on EXIF metadata in Electron windows


## Usage

```js
import { install as installExifRotate } from 'electron-exif-rotate'

app.on('ready', () => {
  // must be called after ready event
  // configure HTTPS interceptor for auto image rotation
  installExifRotate()
})
```


## Compatibility

`electron-exif-rotate` supports `electron >= 1`.  
A Typscript definition is included.
