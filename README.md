# @PhiFans/audio

Another WebAudio library.


## Install 

You can install `@phifans/audio` via npm:

```shell
npm install @phifans/audio
# ...or any package manager you like
pnpm install @phifans/audio
```

## Example

```js
import { Bus, Clip } from '@phifans/audio';

const bus = new Bus();
const musicChannel = bus.createChannel('music');
const sfxChannel = bus.createChannel('sfx');

const musicClip = await Clip.from('https://example.com/music.mp3');
const sfxClip = await Clip.from('https://example.com/sfx.mp3');

// Play a music
musicClip.channel = musicChannel;
musicClip.play();

// Or play a sfx
sfxChannel.startTick();
sfxChannel.pushClipToQueue(sfxClip);
```

## Documents

See https://phifans.github.io/audio/

## Thanks

* [bemuse.ninja](https://github.com/bemusic/bemuse)

## License

```
The MIT License (MIT)
Copyright © 2025 PhiFans

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
