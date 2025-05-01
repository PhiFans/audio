import { GlobalAudioCtx } from './const';

/**
 * The main audio bus, used to connect channel(s) and decode audio file.
 */
export class Bus {
  readonly audioCtx = GlobalAudioCtx;
  readonly gain: GainNode;
  readonly channels = new Map<string, unknown>();

  constructor() {
    this.gain = this.audioCtx.createGain();
    this.gain.connect(this.audioCtx.destination);
  }

  /**
   * Get the volume of this audio bus
   */
  get volume() {
    return this.gain.gain.value;
  }

  /**
   * Set the volume of this audio bus
   */
  set volume(volume: number) {
    this.gain.gain.value = volume;
  }
}
