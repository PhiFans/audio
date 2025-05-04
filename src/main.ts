import { Bus, Clip } from '../lib/main';
import { timeToString } from './utils';
import './style.css';

const qs = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector);

const doms = {
  fileImport: qs<HTMLInputElement>('#file-import'),
  progressBar: qs<HTMLInputElement>('#progress-bar'),
  playButton: qs<HTMLButtonElement>('#button-play'),
  playQueueButton: qs<HTMLButtonElement>('#button-play-queue'),
  pauseButton: qs<HTMLButtonElement>('#button-pause'),
  stopButton: qs<HTMLButtonElement>('#button-stop'),
  timeCurrent: qs<HTMLDivElement>('#time-current'),
  timeTotal: qs<HTMLDivElement>('#time-total'),
  loopCheck: qs<HTMLInputElement>('#check-loop'),
  volumeLabel: qs<HTMLSpanElement>('#text-volume'),
  volumeBar: qs<HTMLInputElement>('#volume-bar'),
  speedLabel: qs<HTMLSpanElement>('#text-speed'),
  speedBar: qs<HTMLInputElement>('#speed-bar'),
};

const audioBus = new Bus();
const audioChannel = audioBus.createChannel('main');
const audioChannelSfx = audioBus.createChannel('sfx');
let audioClip: Clip | null = null;

doms.fileImport?.addEventListener('input', () => {
  const { files } = doms.fileImport!;
  if (!files) return;
  const [ file ] = files;
  if (!file) return;

  Clip.from(file)
    .then((e) => {
      if (audioClip) {
        audioClip.destroy();
        audioClip = null;
      }

      audioClip = e;
      audioClip.channel = audioChannel;
      audioClip.loop = doms.loopCheck?.checked || false;
      audioClip.speed = parseFloat(doms.speedBar!.value);

      doms.timeTotal!.innerText = timeToString(audioClip.duration);
      doms.progressBar!.max = audioClip.duration.toString();

      console.log(audioClip);
    })
    .catch((e) => console.error(e));
});

doms.progressBar?.addEventListener('input', () => {
  if (!audioClip) return;

  const { value: _value } = doms.progressBar!;
  const value = parseInt(_value);
  if (isNaN(value)) return;

  audioClip.seek(value);
  doms.timeCurrent!.innerText = timeToString(audioClip.currentTime);
});

doms.playQueueButton?.addEventListener('click', () => {
  if (!audioClip) return;
  audioChannelSfx.pushClipToQueue(audioClip);
});

doms.playButton?.addEventListener('click', () => {
  if (!audioClip) return;
  audioClip.play();
});

doms.pauseButton?.addEventListener('click', () => {
  if (!audioClip) return;
  audioClip.pause();
});

doms.stopButton?.addEventListener('click', () => {
  if (!audioClip) return;
  audioClip.stop();
});

doms.loopCheck?.addEventListener('input', () => {
  if (!audioClip) return;
  audioClip.loop = doms.loopCheck!.checked;
  doms.loopCheck!.checked = audioClip!.loop;
});

doms.volumeBar?.addEventListener('input', () => {
  const { value: _value } = doms.volumeBar!;
  const value = parseFloat(_value);
  if (isNaN(value)) return;

  audioChannel.volume = value;
  doms.volumeLabel!.innerText = `${Math.floor(value * 100).toString()}%`;
});

doms.speedBar?.addEventListener('input', () => {
  const { value: _value } = doms.speedBar!;
  const value = parseFloat(_value);
  if (isNaN(value)) return;

  if (audioClip) audioClip.speed = value;
  doms.speedLabel!.innerText = `x${(Math.floor(value * 100) / 100).toString()}`;
});

window.addEventListener('load', () => {
  audioChannelSfx.startTick();

  setInterval(() => {
    if (!audioClip) return;

    const newTimeStr = timeToString(audioClip.currentTime);
    if (doms.timeCurrent!.innerText !== newTimeStr) doms.timeCurrent!.innerText = newTimeStr;
    doms.progressBar!.value = audioClip.currentTime.toString();
  }, 100);
})

console.log(audioBus);
