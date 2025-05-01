/// <reference types="./lib.d.ts" />

import Ticker from './ticker';
import Clock from './clock';

const AudioCtx = window.AudioContext || window.webkitAudioContext;
export const GlobalAudioCtx = new AudioCtx({ latencyHint: 'interactive' });
export const GlobalAudioTicker = new Ticker();
export const GlobalAudioClock = new Clock(GlobalAudioCtx, GlobalAudioTicker);
