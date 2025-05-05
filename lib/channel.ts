import { Bus } from './bus';
import { Clip } from './clip';
import { GlobalAudioTicker, GlobalAudioCtx } from './const';
import { Ticker } from './ticker';

/**
 * An audio channel is a bridge connecting {@link Bus} and {@link Clip}.
 * 
 * You can't create it directly, instead you need to use {@link Bus#createChannel}:
 * 
 * ```js
 * const bus = new Bus();
 * const channel = bus.createChannel('main');
 * ```
 * 
 * You can adjust channel volume by setting {@link Channel#volume}:
 * 
 * ```js
 * console.log(channel.volume); // Get current channel volume
 * channel.volume = 0.5; // Set channel volume to 50%;
 * ```
 */
export class Channel {
  /**
   * The name of this channel.
   */
  readonly name: string;

  /**
   * The bus that owned this channel.
   * @see {@link Bus}
   */
  readonly bus: Bus;

  /**
   * The ticker of this channel, used to update {@link Channel#clipQueue}.
   */
  readonly ticker: Ticker = GlobalAudioTicker;

  /**
   * The [`GainNode`](https://developer.mozilla.org/docs/Web/API/GainNode) of the audio channel.
   */
  readonly gain: GainNode;

  /**
   * Clips waiting to be played in next tick.
   * 
   * Clips could be added by {@link Channel#pushClipToQueue}.
   * 
   * @see {@link Clip}
   */
  readonly clipQueue: Clip[] = [];

  private _isTickStart = false;

  constructor(name: string, bus: Bus) {
    this.name = name;
    this.bus = bus;
    this.gain = bus.audioCtx.createGain();
    this.gain.connect(bus.gain);

    this._tick = this._tick.bind(this);
  }

  /**
   * Start ticking {@link Channel#clipQueue}. You must start ticking before add clip(s) to queue.
   */
  startTick() {
    if (this._isTickStart) return;

    this.ticker.add(this._tick);
    this._isTickStart = true;
  }

  /**
   * Stop ticking {@link Channel#clipQueue}.
   */
  stopTick() {
    if (!this._isTickStart) return;

    this.ticker.remove(this._tick);
    this.clipQueue.length = 0;
    this._isTickStart = false;
  }

  /**
   * Disconnect audio nodes, clean clip queue, and stop ticker.
   */
  destroy() {
    this.gain.disconnect();
    this.ticker.remove(this._tick);
    this.clipQueue.length = 0;
    this._isTickStart = false;
  }

  /**
   * Push clip(s) to {@link Channel#clipQueue}. This/ese clip(s) will be played in next tick.
   * 
   * ```js
   * const clip = await Clip.from('https://example.com/test.mp3');
   * const channel = Bus.createChannel('main');
   * 
   * channel.startTick(); // Remember to start the ticker first!
   * channel.pushClipToQueue(clip); // The clip will be played in next frame.
   * ```
   * 
   * @see {@link Channel#clipQueue}
   */
  pushClipToQueue(...clips: Clip[]) {
    return this.clipQueue.push(...clips);
  }

  private _tick() {
    while (this.clipQueue.length > 0) {
      const clip = this.clipQueue.shift()!;
      const buffer = GlobalAudioCtx.createBufferSource();

      buffer.buffer = clip.source;
      buffer.connect(this.gain);
      buffer.start();
    }
  }

  /**
   * Get the volume of this audio channel
   */
  get volume() {
    return this.gain.gain.value;
  }

  /**
   * Set the volume of this audio channel
   */
  set volume(volume: number) {
    this.gain.gain.value = volume;
  }
}
