import { Channel } from './channel';
import { GlobalAudioCtx, GlobalAudioClock, GlobalAudioTicker } from './const';

/**
 * An audio bus is the root entry of the whole audio system. You music create it first to use the audio.
 * 
 * The audio bus only handles the core part: the global [AudioContext](https://developer.mozilla.org/docs/Web/API/AudioContext), the global {@link Clock}, and
 * with a master [GainNode](https://developer.mozilla.org/docs/Web/API/GainNode) for controlling the master volume.
 * 
 * Audio bus itself doesn't handle anything about {@link Clip}, you must create at lease one {@link Channel} to play a {@link Clip}:
 * 
 * ```js
 * const bus = new Bus();
 * const channel = bus.createChannel('main');
 * const clip = await Clip.from('https://example.com/clip.mp3');
 * 
 * clip.channel = channel;
 * clip.play();
 * ```
 * 
 * You can adjust the master volume by setting {@link Bus#volume}:
 * 
 * ```js
 * console.log(bus.volume); // Get current master volume
 * bus.volume = 0.5; // Set master volume to 50%;
 * ```
 */
export class Bus {
  /**
   * The global AudioContext.
   */
  readonly audioCtx = GlobalAudioCtx;

  /**
   * The global {@link Clock}.
   * @see {@link Clock}
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
   * @see {@link Channel}
   */
  readonly channels = new Map<string, Channel>();

  constructor() {
    this.gain = this.audioCtx.createGain();
    this.gain.connect(this.audioCtx.destination);
  }

  /**
   * Create a new audio channel with given name. If the channel exists, we will return the channel directly.
   * @param {string} name - The audio channel name.
   * @returns {Channel} The new audio channel.
   * @see {@link Channel}
   */
  createChannel(name: string): Channel {
    const existChannel = this.channels.get(name);
    if (existChannel) return existChannel;

    const newChannel = new Channel(this);
    this.channels.set(name, newChannel);
    return newChannel;
  }

  /**
   * Delete an audio channel.
   * @param {string} name - The audio channel name.
   * @returns {boolean} Return true if the channel exists.
   * @see {@link Channel}
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
