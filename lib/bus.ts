import { Channel } from './channel';
import { GlobalAudioCtx } from './const';

/**
 * The main audio bus, used to connect channel(s) and decode audio file.
 */
export class Bus {
  readonly audioCtx = GlobalAudioCtx;
  readonly gain: GainNode;
  readonly channels = new Map<string, Channel>();

  constructor() {
    this.gain = this.audioCtx.createGain();
    this.gain.connect(this.audioCtx.destination);
  }

  /**
   * Create a new audio channel.
   * @param {string} name - The audio channel name.
   * @returns {Channel} The new audio channel.
   */
  createChannel(name: string): Channel {
    const newChannel = new Channel(this);
    this.channels.set(name, newChannel);
    return newChannel;
  }

  /**
   * Delete an audio channel.
   * @param {string} name - The audio channel name.
   * @returns {boolean} Return true if the channel exists.
   */
  removeChannel(name: string): boolean {
    const channel = this.channels.get(name);
    if (!channel) return false;
    
    channel.destroy();
    return this.channels.delete(name);
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
