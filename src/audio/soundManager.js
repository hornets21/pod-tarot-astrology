import * as Tone from 'tone';

let bellSynth = null;
let noiseSynth = null;
let isAudioEnabled = false;

export function initAudio() {
  try {
    if (!bellSynth) {
      // Temple Bell Gong
      bellSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 3.5, sustain: 0.1, release: 4.0 }
      }).toDestination();
      bellSynth.volume.value = -8;

      // Bamboo Shaker rattle noise synth
      noiseSynth = new Tone.NoiseSynth({
        noise: { type: "brown" },
        envelope: { attack: 0.02, decay: 0.12, sustain: 0 }
      }).toDestination();
      noiseSynth.volume.value = -12;
    }
  } catch (err) {
    console.warn("Audio init deferred until user gesture", err);
  }
}

export async function toggleAudio() {
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
  initAudio();
  isAudioEnabled = !isAudioEnabled;
  if (isAudioEnabled) {
    playTempleGong();
  }
  return isAudioEnabled;
}

export function playRattleSound() {
  if (!isAudioEnabled || !noiseSynth) return;
  try {
    noiseSynth.triggerAttackRelease("16n");
  } catch (e) {
    // Ignored
  }
}

export function playTempleGong() {
  if (!isAudioEnabled || !bellSynth) return;
  try {
    bellSynth.triggerAttackRelease(["C4", "G4", "C5"], "2n");
  } catch (e) {
    // Ignored
  }
}

export function getAudioStatus() {
  return isAudioEnabled;
}
