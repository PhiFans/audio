
export type TickerOptions = {
  /**
   * Start the ticker when created?
   * @default true
   */
  autoStart?: boolean,
};

/**
 * A ticker usually used to update {@link Clock} and {@link Channel#clipQueue}.
 * 
 * ```js
 * const ticker = new Ticker();
 * function update() {
 *     console.log('This function will be called every frame!');
 * };
 * 
 * ticker.add(update);
 * ```
 */
export class Ticker {
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

  /**
   * Start the ticker manually.
   */
  start() {
    if (!isNaN(this._frameID)) return;
    this._frameID = requestAnimationFrame(this.tick);
  }

  /**
   * Stop the ticker manually.
   */
  stop() {
    if (isNaN(this._frameID)) return;
    cancelAnimationFrame(this._frameID);
    this._frameID = NaN;
  }

  /**
   * Add a function to ticker, function added will be called every frame.
   * @param {Function} callback 
   */
  add(callback: Function) {
    this._callbacks.push(callback);
  }

  /**
   * Remove function from ticker.
   * @param {Function} callback 
   */
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
