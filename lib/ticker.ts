
export type TickerOptions = {
  autoStart?: boolean,
};

/**
 * The audio ticker, usually used to update the {@link Clock} and {@link Channel#clipQueue}.
 */
export default class Ticker {
  private _callbacks: Function[] = [];
  private _frameID: number = NaN;

  constructor(options?: TickerOptions) {
    const _options: Required<TickerOptions> = {
      autoStart: true,
      ...(options || {})
    };

    this.tick = this.tick.bind(this);

    if (_options.autoStart) this.start();
  }

  start() {
    if (!isNaN(this._frameID)) return;
    this._frameID = requestAnimationFrame(this.tick);
  }

  stop() {
    if (isNaN(this._frameID)) return;
    cancelAnimationFrame(this._frameID);
    this._frameID = NaN;
  }

  add(callback: Function) {
    this._callbacks.push(callback);
  }

  remove(callback: Function) {
    this._callbacks = this._callbacks.filter((e) => e !== callback);
  }

  private tick() {
    if (isNaN(this._frameID)) return;

    for (const callback of this._callbacks) {
      callback();
    }

    this._frameID = requestAnimationFrame(this.tick);
  }
}
