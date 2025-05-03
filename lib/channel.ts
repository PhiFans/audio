import { Bus } from './bus';
import { Clip } from './clip';
import { GlobalAudioTicker, GlobalAudioCtx } from './const';
import { Ticker } from './ticker';

/**
 * 
 */
export class Channel {
  readonly bus: Bus;
  readonly ticker: Ticker = GlobalAudioTicker;
  readonly gain: GainNode;

  /**
   * Clips waiting to be played in next tick.
   * 
   * Clips could be added by {@link Channel#pushClipToQueue}.
   */
  readonly clipQueue: Clip[] = [];

  private _isTickStart = false;

  constructor(bus: Bus) {
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

  destroy() {
    this.gain.disconnect();
    this.ticker.remove(this._tick);
    this.clipQueue.length = 0;
    this._isTickStart = false;
  }

  /**
   * Push clip(s) to {@link Channel#clipQueue}. This/ese clip(s) will be played in next tick.
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
