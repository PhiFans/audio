import { Bus, Clip } from '../lib/main';
import { timeToString } from './utils';
import './style.css';

const qs = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector);

const doms = {
  fileImport: qs<HTMLInputElement>('#file-import'),
  progressBar: qs<HTMLInputElement>('#progress-bar'),
  volumeBar: qs<HTMLInputElement>('#volume-bar'),
  playButton: qs<HTMLButtonElement>('#button-play'),
  pauseButton: qs<HTMLButtonElement>('#button-pause'),
  stopButton: qs<HTMLButtonElement>('#button-stop'),
  timeCurrent: qs<HTMLDivElement>('#time-current'),
  timeTotal: qs<HTMLDivElement>('#time-total'),
  loopCheck: qs<HTMLInputElement>('#check-loop'),
};

const audioBus = new Bus();
const audioChannel = audioBus.createChannel('main');
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
});

window.addEventListener('load', () => {
  setInterval(() => {
    if (!audioClip) return;

    doms.timeCurrent!.innerText = timeToString(audioClip.currentTime);
    doms.progressBar!.value = audioClip.currentTime.toString();
  }, 500);
})

console.log(audioBus);
