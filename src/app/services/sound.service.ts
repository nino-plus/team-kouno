import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  postSound: Howl = new Howl({
    src: ['assets/sounds/pa.mp3'],
    volume: 0.4,
  });

  joinSound: Howl = new Howl({
    src: ['assets/sounds/poincho.mp3'],
    volume: 0.4,
  });

  exitSound: Howl = new Howl({
    src: ['assets/sounds/pyuun.mp3'],
    volume: 0.4,
  });

  callSound: Howl = new Howl({
    src: ['assets/sounds/iphone.mp3'],
    volume: 0.4,
    loop: true,
  });

  openSound: Howl = new Howl({
    src: ['assets/sounds/open.mp3'],
    volume: 0.4,
  });

  decisionSound: Howl = new Howl({
    src: ['assets/sounds/kettei.mp3'],
    volume: 0.4,
  });

  hoverSound: Howl = new Howl({
    src: ['assets/sounds/ka.mp3'],
    volume: 0.4,
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
