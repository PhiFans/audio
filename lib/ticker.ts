
const FPS_WINDOW_TIME = 10;
const MEASURE_WARMUP_MS = 500;
const MEASURE_DURATION = 60;

export type TickerOptions = {
  /**
   * Start the ticker when created?
   * @default true
   */
  autoStart?: boolean,
};

export type TickerCallback = (timestamp: number) => void;

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
  fps = 60;

  private _callbacks: TickerCallback[] = [];
  private _frameID: number = NaN;
  private _lastTime = 0;

  private readonly _frameTimes: number[] = [];

  private _measuring = false;
  private _measureStartTime: number = -1;
  private _measureStartWallTime: number = -1;
  private _measureFrameCount: number = 0;
  private _measuredRefreshRate: number | null = null;

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
  add(callback: TickerCallback) {
    this._callbacks.push(callback);
  }

  /**
   * Remove function from ticker.
   * @param {Function} callback 
   */
  remove(callback: TickerCallback) {
    this._callbacks = this._callbacks.filter((e) => e !== callback);
  }

  private tick(timestamp: number) {
    if (isNaN(this._frameID)) return;

    if (this._lastTime > 0) {
      const deltaTime = timestamp - this._lastTime;

      if (this._measuring)
        this._measureRefreshRate(timestamp);

      this._frameTimes.push(deltaTime);
      if (this._frameTimes.length > FPS_WINDOW_TIME) {
        this._frameTimes.shift();
      }

      const avgDelta = (
        this._frameTimes.reduce((sum, dt) => sum + dt, 0) /
        this._frameTimes.length
      );

      this.fps = 1000 / avgDelta;
    } else {
      this._measuring = true;
      this._measureStartWallTime = timestamp;
      this._measureFrameCount = 0;
    }

    this._lastTime = timestamp;

    for (const callback of this._callbacks) {
      callback(timestamp);
    }

    this._frameID = requestAnimationFrame(this.tick);
  }

  private _measureRefreshRate(timestamp: number) {
    if (this._measureStartTime <= 0) {
      const warmupDuration = timestamp - this._measureStartWallTime;
      if (warmupDuration < MEASURE_WARMUP_MS) {
        return;
      }

      this._measureStartTime = timestamp;
    }

    this._measureFrameCount++;
    if (this._measureFrameCount >= MEASURE_DURATION) {
      const totalTime = timestamp - this._measureStartTime;
      this._measuredRefreshRate = Math.round(
        (MEASURE_DURATION * 1000) / totalTime
      );
      this._measuring = false;
      console.info('[Ticker] Measured refresh rate:', this.measuredRefreshRate, 'Hz');
    }
  }

  get measuredRefreshRate() {
    return this._measuredRefreshRate;
  }
}
