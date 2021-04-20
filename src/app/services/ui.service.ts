import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  dialogType: string;
  loading: boolean;

  constructor() {}

  isLargeScreen(container?: HTMLElement): boolean {
    const screenWidth = window.innerWidth || container.clientWidth;
    const mobileScreen = 700;
    if (screenWidth >= mobileScreen) {
      return true;
    } else {
      return false;
    }
  }
}
