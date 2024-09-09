class Progress {
  constructor() {
    this.mapId = "Tardis";
    this.startingHeroX = 0;
    this.startingHeroY = 0;
    this.startingHeroDirection = "down";
    this.sonicState = { isSonicEquipped: null, activeMode: null };
    this.saveFileKey = "DoctorWho2d_SaveFile2";
  }

  save() {
    console.log("saving to loacal storage", this);
    window.localStorage.setItem(
      this.saveFileKey,
      JSON.stringify({
        mapId: this.mapId,
        startingHeroX: this.startingHeroX,
        startingHeroY: this.startingHeroY,
        startingHeroDirection: this.startingHeroDirection,
        sonicState: {
          isSonicEquipped: this.sonicState.isSonicEquipped,
          activeMode: this.sonicState.activeMode,
          // pizzas: playerState.pizzas,
          // lineup: playerState.lineup,
          // items: playerState.items,
          // storyFlags: playerState.storyFlags,
        },
        playerState: {
          pizzas: playerState.pizzas,
          lineup: playerState.lineup,
          items: playerState.items,
          storyFlags: playerState.storyFlags,
        },
      })
    );
  }

  getSaveFile() {
    const file = window.localStorage.getItem(this.saveFileKey);
    return file ? JSON.parse(file) : null;
  }

  load() {
    const file = this.getSaveFile();
    if (file) {
      this.mapId = file.mapId;
      this.startingHeroX = file.startingHeroX;
      this.startingHeroY = file.startingHeroY;
      this.startingHeroDirection = file.startingHeroDirection;
      this.sonicState.isSonicEquipped = file.sonicState.isSonicEquipped;
      this.sonicState.activeMode = file.sonicState.activeMode;
      Object.keys(file.playerState).forEach((key) => {
        playerState[key] = file.playerState[key];
      });
      console.log("loading:", this, file);
    }
  }
}
