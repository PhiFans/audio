import { GlobalAudioClock, GlobalAudioCtx } from './const';
import { Channel } from './channel';
import { decodeAudio, getBaseAudioLatency } from './utils';

export type ClipSource = Blob | ArrayBuffer | string;

/**
 * An audio clip handles everything about audio data.
 * 
 * You can create an audio clip with a file, an ArrayBuffer, or just pass a url.
 * 
 * ```js
 * const clip = await Clip.from('https://example.com/clip.mp3');
 * ```
 * 
 * You can't play a clip directly; instead you need to either connect the clip to a {@link Channel}:
 * 
 * ```js
 * const channel = Bus.createChannel('main');
 * // Connect the clip with an audio channel, could be used to play musics.
 * clip.channel = channel;
 * clip.play(); // Now you can get clip progress via `clip.currentTime`.
 * ```
 * 
 * ...or push it to {@link Channel#clipQueue}:
 * 
 * ```js
 * const channel = Bus.createChannel('sfx');
 * // Push the clip to channel queue, could be used to play SFX, hitsound, etc.
 * channel.startTick(); // Remember to start the ticker first!
 * channel.pushClipToQueue(clip); // The clip will be played in next frame.
 * ```
 */
export class Clip {
  /**
   * The clip source.
   */
  readonly source: AudioBuffer;

  private _buffer?: AudioBufferSourceNode = (void 0);

  /**
   * @see {@link Clip#channel}
   */
  private _channel: Channel | null = null;

  /**
   * @see {@link Clip#loop}
   */
  private _loop: boolean = false;

  /**
   * @see {@link Clip#speed}
   */
  private _speed: number = 1;

  /**
   * @see {@link Clip#status}
   */
  private _status: -1 | 0 | 1 = -1;

  /**
   * The start playing time of this clip.
   */
  private _startTime: number = NaN;

  /**
   * The paused time of this clip.
   */
  private _pausedTime: number = NaN;

  constructor(audioBuffer: AudioBuffer, channel: Channel | null = null) {
    this.source = audioBuffer;
    this._channel = channel;

    this._play = this._play.bind(this);
    this.stop = this.stop.bind(this);
  }

  /**
   * Create a clip from supported source.
   * 
   * @param {ClipSource} source - The source of the clip, could be File, ArrayBuffer and url link.
   * @param {Channel | null} [channel=null] - The channel linked to this clip, leave `null` to unset.
   * @returns {Promise<Clip>} Returns the clip itself.
   */
  static from(source: ClipSource, channel: Channel | null = null) {
    return new Promise<Clip>(async (res, rej) => {
      try {
        const buffer = await decodeAudio(source);
        const result = new Clip(buffer, channel);
        res(result);
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * Play the clip. The clip must be connected to any {@link Channel} to play.
   */
  play() {
    if (!this._channel) throw Error('Can\'t play an audio clip directly without any channel.');
    if (this._status === 1) return;

    setImmediate(this._play);
  }

  private _play() {
    this._buffer = GlobalAudioCtx.createBufferSource();
    this._buffer.buffer = this.source;
    this._buffer.connect(this._channel!.gain);

    this._buffer.loop = this._loop;
    this._buffer.playbackRate.value = this._speed;
    if (!this._loop) this._buffer.onended = this.stop;
    
    if (isNaN(this._pausedTime) || this._loop) {
      this._buffer.start(0, 0);
      this._startTime = GlobalAudioClock.currentTime - getBaseAudioLatency();
    } else {
      const pausedTime = this._pausedTime - this._startTime;
      this._buffer.start(0, pausedTime * this._speed);
      this._startTime = (GlobalAudioClock.currentTime - pausedTime) - getBaseAudioLatency();
    }

    this._pausedTime = NaN;
    this._status = 1;
  }

  /**
   * Pause the clip playing. Use {@link Clip#play} to resume.
   */
  pause() {
    if (this._status !== 1) return;

    this._disconnectBuffer();
    this._pausedTime = GlobalAudioClock.currentTime - getBaseAudioLatency();
    this._status = 0;
  }

  /**
   * Stop the clip playing.
   */
  stop() {
    if (this._status === -1) return;

    this._disconnectBuffer();
    this._startTime = NaN;
    this._pausedTime = NaN;
    this._status = -1;
  }

  /**
   * Seek clip play progress. Note that you cannot seek when clip is not
   * connected to any channels or {@link Clip#status} is stopped.
   * 
   * @param {number} seconds - Seconds that needs seek to.
   */
  seek(seconds: number) {
    if (!this._channel) return;
    if (this._status === -1) return;

    const isPlayingBefore = this._status === 1;
    this.pause();
    this._startTime = this._pausedTime - seconds;

    if (this._startTime > this._pausedTime) this._startTime = this._pausedTime;
    if (isPlayingBefore) this.play();
  }

  /**
   * Destroy the clip. This will stop the clip playing and disconnect to the channel.
   */
  destroy() {
    if (!this._channel) return;
    if (this._status !== -1) this.stop();
    this._channel = null;
  }

  private _disconnectBuffer() {
    if (!this._buffer) return;

    this._buffer.stop();
    this._buffer.disconnect();
    this._buffer.onended = null;
    this._buffer = (void 0);
  }

  /**
   * The channel connected to this clip.
   */
  get channel() {
    return this._channel;
  }

  /**
   * Set the channel connected to this clip. Leave `null` to disconnect.
   */
  set channel(channel: Channel | null) {
    this._channel = channel;
  }

  /**
   * Is this clip will be replayed when the audio reaches the end?
   */
  get loop() {
    return this._loop;
  }

  /**
   * Set if this clip will be replayed when the audio reaches the end.
   * Can't be set when this clip is playing.
   */
  set loop(bool: boolean) {
    if (this._buffer) return;
    this._loop = bool;
  }

  /**
   * Get the playback speed of this clip.
   */
  get speed() {
    return this._speed;
  }

  /**
   * Set the playback speed of this clip.
   */
  set speed(speed: number) {
    if (this._buffer) {
      this._buffer.playbackRate.value = speed;
    }

    if (this._status !== -1) {
      const { currentTime } = GlobalAudioClock;
      const timeDiff = (isNaN(this._pausedTime) ? currentTime : this._pausedTime) - this._startTime;
      this._startTime = currentTime - (timeDiff * this._speed) / speed;
      if (!isNaN(this._pausedTime)) this._pausedTime = currentTime;
    }

    this._speed = speed;
  }

  /**
   * Play status for this clip.
   * 
   * * `-1`: Stop
   * * `1`: Playing
   * * `0`: Paused
   */
  get status() {
    return this._status;
  }

  /**
   * The audio clip duration.
   */
  get duration() {
    return this.source.duration;
  }

  /**
   * The current play progress of this clip. Only usable when connected with a {@link Channel}.
   * Can't get clip progress when {@link Clip#loop} is `true`.
   */
  get currentTime() {
    if (this._loop) return 0;
    if (this._status === -1) return 0;
    if (this._status === 1) return (GlobalAudioClock.currentTime - this._startTime) * this._speed;
    return (this._pausedTime - this._startTime) * this._speed;
  }
}
