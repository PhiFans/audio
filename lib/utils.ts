
/**
 * Resume an AudioContext.
 * 
 * @link https://github.com/bemusic/bemuse/blob/68e0d5213b56502b3f5812f1d28c8d7075762717/bemuse/src/sampling-master/index.js#L276
 * @param {AudioContext} audioCtx The AudioContext that needs to be resumed
 * @returns {Promise<boolean>} Return false if resume failed
 */
export const resumeAudioCtx = (audioCtx: AudioContext): Promise<boolean> => {
  if (audioCtx.state === 'running') return new Promise((res) => res(true));

  console.info('[Audio]', 'Try resuming audio...');

  const gain = audioCtx.createGain();
  const osc = audioCtx.createOscillator();

  osc.frequency.value = 440;

  osc.start(audioCtx.currentTime + 0.1);
  osc.stop(audioCtx.currentTime + 0.1);

  gain.connect(audioCtx.destination);
  gain.disconnect();

  return new Promise((res) => {
    audioCtx.resume()
      .then(() => res(true))
      .catch((e) => {
        res(false);
        console.error(e);
      });
  });
};
