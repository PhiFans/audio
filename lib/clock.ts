import Ticker from './ticker';
import { resumeAudioCtx } from './utils';

/**
 * The audio clock is a replacement of {@link https://developer.mozilla.org/docs/Web/API/BaseAudioContext/currentTime `AudioContext.currentTime`}
 * 
 * Special thanks to {@link https://github.com/bemusic/bemuse bemuse.ninja} for the code inspiration
 * 
 * {@link https://github.com/bemusic/bemuse/blob/68e0d5213b56502b3f5812f1d28c8d7075762717/bemuse/src/game/clock.js#L14 See original code}
 */
export default class Clock {
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
