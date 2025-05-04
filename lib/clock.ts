import { Ticker } from './ticker';
import { resumeAudioCtx } from './utils';

/**
 * An audio clock is a replacement of [AudioContext.currentTime](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/currentTime).
 * 
 * You don't need to manually create the audio clock usually; instead you can get the global audio clock via {@link Bus#clock}.
 * 
 * You can get the current audio time by {@link Clock#currentTime}:
 * 
 * ```js
 * const clock = bus.clock;
 * 
 * function update() {
 *     console.log('Current audio time:', clock.currentTime);
 *     requestAnimationFrame(update);
 * };
 * update();
 * ```
 * 
 * Special thanks to {@link https://github.com/bemusic/bemuse bemuse.ninja} for the code inspiration.
 * 
 * @see {@link https://github.com/bemusic/bemuse/blob/68e0d5213b56502b3f5812f1d28c8d7075762717/bemuse/src/game/clock.js#L14 The original code}
 */
export class Clock {
  /**
   * The current audio time.
  */
  public currentTime: number = 0;

  private readonly _audioCtx: AudioContext;
  private readonly _ticker: Ticker;
  private readonly _offsets: Array<number> = [];
  private _sum: number = 0;

  constructor(audioCtx: AudioContext, ticker: Ticker) {
    this._audioCtx = audioCtx;
    this._ticker = ticker;

    this.onAudioCtxStateChanged = this.onAudioCtxStateChanged.bind(this);
    this.tick = this.tick.bind(this);

    this.init();
  }

  private async init() {
    this._audioCtx.addEventListener('statechange', this.onAudioCtxStateChanged);

    await resumeAudioCtx(this._audioCtx);
    this._ticker.start();
  }

  private onAudioCtxStateChanged() {
    if (this._audioCtx.state !== 'running') return;
    this._ticker.add(this.tick);
  }

  private tick() {
    const { _audioCtx, _offsets } = this;
    const realTime = performance.now() / 1000;
    const delta = realTime - (_audioCtx.currentTime);

    _offsets.push(delta);
    this._sum += delta;

    while (_offsets.length > 60) {
      this._sum -= _offsets.shift()!;
    }

    this.currentTime = realTime - (this._sum / _offsets.length);
  }
}
