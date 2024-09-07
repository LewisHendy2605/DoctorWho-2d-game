class SonicState {
  constructor() {
    this.isSonicEquipped = false;
    this.activeMode = null;
  }

  updateActiveMode(newActiveMode) {
    this.activeMode = newActiveMode;
  }

  updateIsEquipped() {
    if (this.isSonicEquipped === false) {
      this.isSonicEquipped = true;
    } else {
      this.isSonicEquipped = false;
    }
  }
}

window.sonicState = new SonicState();
