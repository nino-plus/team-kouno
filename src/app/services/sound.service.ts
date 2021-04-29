import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  postSound: Howl = new Howl({
    src: ['assets/sounds/pa.mp3'],
  });

  joinSound: Howl = new Howl({
    src: ['assets/sounds/poincho.mp3', 'assets/sounds/poincho.wav'],
  });

  exitSound: Howl = new Howl({
    src: ['assets/sounds/pyuun.mp3'],
  });

  constructor() {}

  // sound(type, sec): void {
  //   const ctx = new AudioContext();
  //   const osc = ctx.createOscillator();
  //   osc.type = type;
  //   osc.frequency.setValueAtTime(150, ctx.currentTime);
  //   osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.5);
  //   const gainNode = ctx.createGain();
  //   gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  //   gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  //   osc.connect(gainNode);
  //   gainNode.connect(ctx.destination);
  //   osc.start();
  //   osc.stop(sec);
  // }
}
