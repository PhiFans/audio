import { Channel } from './channel';
import { GlobalAudioCtx, GlobalAudioClock, GlobalAudioTicker } from './const';

/**
 * The audio bus is the root entry of the entire audio structure.
 * 
 * ```js
 * const bus = new Bus();
 * const channel = bus.createChannel('main');
 * const clip = await Clip.from('https://example.com/test.mp3');
 * 
 * clip.channel = channel;
 * clip.play();
 * ```
 */
export class Bus {
  /**
   * The global AudioContext.
   */
  readonly audioCtx = GlobalAudioCtx;

  /**
   * The global {@link Clock}.
   */
  readonly clock = GlobalAudioClock;

  /**
   * The global {@link Ticker}.
   */
  readonly ticker = GlobalAudioTicker;

  /**
   * The [`GainNode`](https://developer.mozilla.org/docs/Web/API/GainNode) of the audio bus, used to control the master volume.
   */
  readonly gain: GainNode;

  /**
   * Channels in this bus.
   */
  readonly channels = new Map<string, Channel>();

  constructor() {
    this.gain = this.audioCtx.createGain();
    this.gain.connect(this.audioCtx.destination);
  }

  /**
   * Create a new audio channel.
   * @param {string} name - The audio channel name.
   * @returns {Channel} The new audio channel.
   */
  createChannel(name: string): Channel {
    const newChannel = new Channel(this);
    this.channels.set(name, newChannel);
    return newChannel;
  }

  /**
   * Delete an audio channel.
   * @param {string} name - The audio channel name.
   * @returns {boolean} Return true if the channel exists.
   */
  removeChannel(name: string): boolean {
    const channel = this.channels.get(name);
    if (!channel) return false;
    
    channel.destroy();
    return this.channels.delete(name);
  }

  /**
   * Get the volume of this audio bus
   */
  get volume() {
    return this.gain.gain.value;
  }

  /**
   * Set the volume of this audio bus
   */
  set volume(volume: number) {
    this.gain.gain.value = volume;
  }
}
