/// <reference types="./lib.d.ts" />

import { GlobalAudioClock, GlobalAudioCtx } from './const';
import { Channel } from './channel';
import { decodeAudio } from './utils';

export type ClipSource = Blob | ArrayBuffer | string;

export class Clip {
  readonly source: AudioBuffer;

  private readonly _audioCtx: AudioContext;
  private _buffer?: AudioBufferSourceNode = (void 0);
  private _channel: Channel | null = null;

  /**
   * See {@link Clip#status}
   */
  private _status: -1 | 0 | 1 = -1;

  private _startTime: number = NaN;
  private _pausedTime: number = NaN;

  constructor(audioCtx: AudioContext, audioBuffer: AudioBuffer, channel: Channel | null = null) {
    this.source = audioBuffer;

    this._audioCtx = audioCtx;
    this._channel = channel;

    this._play = this._play.bind(this);
    this.stop = this.stop.bind(this);
  }

  static from(source: ClipSource, channel: Channel | null = null) {
    return new Promise<Clip>(async (res, rej) => {
      try {
        const buffer = await decodeAudio(source);
        const result = new Clip(GlobalAudioCtx, buffer, channel);
        res(result);
      } catch (e) {
        rej(e);
      }
    });
  }

  play() {
    if (!this._channel) throw Error('Can\'t play an audio clip directly without any channel.');
    if (this._status === 1) return;

    if ('setImmediate' in window) {
      window.setImmediate(this._play);
    } else {
      setTimeout(this._play, 10);
    }
  }

  private _play() {
    this._buffer = this._audioCtx.createBufferSource();
    this._buffer.buffer = this.source;
    this._buffer.connect(this._channel!.gain);
    
    if (isNaN(this._pausedTime)) {
      this._buffer.start(0, 0);
      this._startTime = GlobalAudioClock.currentTime;
    } else {
      const pausedTime = this._pausedTime - this._startTime;
      this._buffer.start(0, pausedTime);
      this._startTime = GlobalAudioClock.currentTime - pausedTime;
    }

    this._pausedTime = NaN;
    this._status = 1;
    this._buffer.onended = this.stop;
  }

  pause() {
    if (this._status !== 1) return;

    this._disconnectBuffer();
    this._pausedTime = GlobalAudioClock.currentTime;
    this._status = 0;
  }

  stop() {
    if (this._status === -1) return;

    this._disconnectBuffer();
    this._startTime = NaN;
    this._pausedTime = NaN;
    this._status = -1;
  }

  seek(seconds: number) {
    if (!this._channel) return;
    if (this._status === -1) return;

    const isPlayingBefore = this._status === 1;
    this.pause();
    this._startTime = this._pausedTime - seconds;

    if (this._startTime > this._pausedTime) this._startTime = this._pausedTime;
    if (isPlayingBefore) this.play();
  }

  destroy() {
    if (!this._channel) return;
    if (this._status !== -1) this.stop();
  }

  private _disconnectBuffer() {
    if (!this._buffer) return;

    this._buffer.stop();
    this._buffer.disconnect();
    this._buffer.onended = null;
    this._buffer = (void 0);
  }

  get channel() {
    return this._channel;
  }

  set channel(channel: Channel | null) {
    this._channel = channel;
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

  get duration() {
    return this.source.duration;
  }

  get currentTime() {
    return (
      this._status === 1 ? (GlobalAudioClock.currentTime - this._startTime) :
      this._status === 0 ? (this._pausedTime - this._startTime) : 0
    );
  }
}
