/// <reference types="./lib.d.ts" />

import Ticker from './ticker';
import Clock from './clock';
import { resumeAudioCtx } from './utils';

const AudioCtx = window.AudioContext || window.webkitAudioContext;
export const GlobalAudioCtx = new AudioCtx({ latencyHint: 'interactive' });
export const GlobalAudioTicker = new Ticker();
export const GlobalAudioClock = new Clock(GlobalAudioCtx, GlobalAudioTicker);

const _resumeAudioCtx = async () => {
  const result = await resumeAudioCtx(GlobalAudioCtx);
  if (!result) return;
  if (GlobalAudioCtx.state !== 'running') return;

  window.removeEventListener('pointerdown', _resumeAudioCtx);
};

window.addEventListener('load', () => {
  if (GlobalAudioCtx.state === 'running') return;

  window.addEventListener('pointerdown', _resumeAudioCtx);
});
