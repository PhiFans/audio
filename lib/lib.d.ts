
declare interface Window {
  webkitAudioContext: AudioContext;

  // For browsers that still supports
  setImmediate: (func: Function, args?: unknown[]) => number;
}
