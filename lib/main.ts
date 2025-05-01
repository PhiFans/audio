/// <reference types="./lib.d.ts" />

import Ticker from './ticker';
import Clock from './clock';

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const GlobalAudioCtx = new AudioCtx({ latencyHint: 'interactive' });
const GlobalAudioTicker = new Ticker();
const GlobalAudioClock = new Clock(GlobalAudioCtx, GlobalAudioTicker);

}
