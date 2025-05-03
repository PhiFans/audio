import audioDecode from 'audio-decode';
import { ClipSource } from './clip';

/**
 * Resume an AudioContext.
 * 
 * @param {AudioContext} audioCtx The AudioContext that needs to be resumed
 * @returns {Promise<boolean>} Return false if resume failed
 * @see {@link https://github.com/bemusic/bemuse/blob/68e0d5213b56502b3f5812f1d28c8d7075762717/bemuse/src/sampling-master/index.js#L276 The origina code}
 * @license AGPL-1.0-or-later
 */
export const resumeAudioCtx = (audioCtx: AudioContext): Promise<boolean> => {
  if (audioCtx.state === 'running') return new Promise((res) => res(true));

  console.info('[Audio]', 'Try resuming audio...');

  const gain = audioCtx.createGain();
  const osc = audioCtx.createOscillator();

  osc.frequency.value = 440;

  osc.start(audioCtx.currentTime + 0.1);
  osc.stop(audioCtx.currentTime + 0.1);

  gain.connect(audioCtx.destination);
  gain.disconnect();

  return new Promise((res) => {
    audioCtx.resume()
      .then(() => res(true))
      .catch((e) => {
        res(false);
        console.error(e);
      });
  });
};

export const readFileAsArrayBuffer = (file: Blob) => 
  new Promise<ArrayBuffer>((res, rej) => {
    const reader = new FileReader();

    reader.onload = () => {
      res(reader.result as ArrayBuffer);
    }

    reader.onerror = (e) => {
      rej(e);
    }

    reader.readAsArrayBuffer(file);
  });

export const downloadFile = (url: string) =>
  new Promise<ArrayBuffer>((res, rej) => {
    fetch(url)
      .then(e => e.arrayBuffer())
      .then(e => res(e))
      .catch(e => rej(e));
  });

/**
 * Decode audio source as {@link AudioBuffer}.
 */
export const decodeAudio = (source: ClipSource) => {
  if (source instanceof ArrayBuffer) return audioDecode(source);
  if (source instanceof Blob) {
    return new Promise<AudioBuffer>(async (res, rej) => {
      try {
        const buffer = await readFileAsArrayBuffer(source);
        const result = await audioDecode(buffer);
        res(result);
      } catch (e) {
        rej(e);
      }
    });
  }
  if (typeof source === 'string') {
    return new Promise<AudioBuffer>(async (res, rej) => {
      try {
        const buffer = await downloadFile(source);
        const result = await audioDecode(buffer);
        res(result);
      } catch (e) {
        rej(e);
      }
    });
  }

  throw Error('Unsupported source type');
};
