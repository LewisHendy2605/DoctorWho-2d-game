class TitleScreen {
  constructor({ progress }) {
    this.progress = progress;
  }

  getOptions(resolve) {
    const saveFile = this.progress.getSaveFile();
    const demoLevel = window.OverworldMaps.DemoLevel;
    return [
      {
        label: "New Game",
        description: "Start a New Game as the Doctor in the Tardis",
        handler: () => {
          this.close();
          resolve({ progress: null, level: null });
        },
      },
      demoLevel
        ? {
            label: "Demo Level",
            description: "Learn with the Demo Level",
            handler: () => {
              this.close();
              resolve({ progress: null, level: demoLevel });
            },
          }
        : null,
      saveFile
        ? {
            label: "Continue Game",
            description: "Resume your game",
            handler: () => {
              this.close();
              resolve({ progress: saveFile, level: null });
            },
          }
        : null,
    ].filter((v) => v);
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("TitleScreen");
    this.element.innerHTML = `
    <img class="TitleScreen_logo" src=${utils.setDynamicPath(
      "/images/doctor-who-2d-logo.png"
    )} alt="Pizza Legends" />
    `;

    const dynamicUrl = utils.setDynamicPath("/images/planets/stars.png");
    this.element.style.backgroundImage = `url(${dynamicUrl})`;
  }

  close() {
    this.keyboardMenu.end();
    this.element.remove();
  }

  async init(container) {
    return new Promise((resolve) => {
      this.createElement();
      container.appendChild(this.element);
      this.keyboardMenu = new KeyboardMenu();
      this.keyboardMenu.init(this.element);
      this.keyboardMenu.setOptions(this.getOptions(resolve));
    });
  }
}
