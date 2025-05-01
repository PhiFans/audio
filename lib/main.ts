/// <reference types="./lib.d.ts" />

import Ticker from './ticker';

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const GlobalAudioCtx = new AudioCtx({ latencyHint: 'interactive' });
const GlobalAudioTicker = new Ticker();

}
