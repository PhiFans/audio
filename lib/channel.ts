import { Bus } from './bus';

export class Channel {
  readonly bus: Bus;
  readonly gain: GainNode;

  constructor(bus: Bus) {
    this.bus = bus;
    this.gain = bus.audioCtx.createGain();
    this.gain.connect(bus.gain);
  }

  destroy() {
    this.gain.disconnect();
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
