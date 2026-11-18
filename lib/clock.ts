import { Ticker } from './ticker';
import { resumeAudioCtx } from './utils';

const INITIAL_WINDOW_SIZE = 120;
const MIN_WINDOW_SIZE = 30;
const MAX_WINDOW_SIZE = 500;
const ADJUST_INTERVAL = 5000;

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

  private _offsets: Float64Array;
  private _windowSize: number;
  private _offsetIndex: number = 0;
  private _offsetCount: number = 0;

  private _mean: number = 0;
  private _M2: number = 0;

  private _lastAdjustTime = 0;

  constructor(audioCtx: AudioContext, ticker: Ticker) {
    this._audioCtx = audioCtx;
    this._ticker = ticker;

    this._windowSize = INITIAL_WINDOW_SIZE;
    this._offsets = new Float64Array(this._windowSize);

    this.onAudioCtxStateChanged = this.onAudioCtxStateChanged.bind(this);
    this.tick = this.tick.bind(this);

    this.init();
  }

  private async init() {
    this._audioCtx.addEventListener('statechange', this.onAudioCtxStateChanged);

    if (!(await resumeAudioCtx(this._audioCtx))) {
      console.error('[Clock] Failed to resume AudioContext');
      return;
    }

    if (this._audioCtx.state === 'running') {
      this._ticker.start();
    }
  }

  private onAudioCtxStateChanged() {
    if (this._audioCtx.state === 'running')
      this._ticker.add(this.tick);
    else
      this._ticker.remove(this.tick);
  }

  private tick() {
    const { _audioCtx, _offsets } = this;
    const now = performance.now();
    const realTime = now / 1000;
    const delta = realTime - _audioCtx.currentTime;

    _offsets[this._offsetIndex] = delta;
    this._offsetIndex = (this._offsetCount + 1) % this._windowSize;

    if (this._offsetIndex < this._windowSize)
      this._offsetCount++;
  
    const n = this._offsetCount;
    const oldMean = this._mean;
    this._mean = oldMean + (delta - oldMean) / n;
    this._M2 += (delta - oldMean) * (delta - this._mean);

    this.currentTime = realTime - this._mean;

    if (now - this._lastAdjustTime > ADJUST_INTERVAL) {
      this._adjustWindowSize();
      this._lastAdjustTime = now;
    }
  }

  private _adjustWindowSize() {
    const targetFps = this._ticker.measuredRefreshRate || this._ticker.fps;
    const targetSize = Math.round(targetFps);

    const clampedSize = Math.max(
      MIN_WINDOW_SIZE,
      Math.min(MAX_WINDOW_SIZE, targetSize)
    );

    const sizeRatio = clampedSize / this._windowSize;
    if (sizeRatio > 0.9 && sizeRatio < 1.1)
      return;

    console.info(
      `[Clock] Adjusting window size: ${this._windowSize} -> ${clampedSize} ` +
      `(target FPS: ${targetFps.toFixed(1)})`
    );

    const newBuffer = new Float64Array(clampedSize);
    const copyCount = Math.min(this._offsetCount, clampedSize);

    for (let i = 0; i < copyCount; i++) {
      const oldIdx = (this._offsetIndex - copyCount + i + this._windowSize) % this._windowSize;
      newBuffer[i] = this._offsets[oldIdx];
    }

    this._offsets = newBuffer;
    this._windowSize = clampedSize;
    this._offsetIndex = copyCount % clampedSize;
    this._offsetCount = copyCount;

    this._recalculateStats();
  }

  private _recalculateStats() {
    this._mean = 0;
    this._M2 = 0;

    for (let i = 0; i < this._offsetCount; i++) {
      const delta = this._offsets[i];
      const oldMean = this._mean;
      const n = i + 1;

      this._mean = oldMean + (delta - oldMean) / n;
      this._M2 += (delta - oldMean) * (delta - this._mean);
    }
  }
}
