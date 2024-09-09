class TitleScreen {
  constructor({ progress }) {
    this.progress = progress;
  }

  getOptions(resolve) {
    const saveFile = this.progress.getSaveFile();
    return [
      {
        label: "New Game",
        description: "Start a New Game as the Doctor in the Tardis",
        handler: () => {
          this.close();
          resolve();
        },
      },
      {
        label: "Demo Level",
        description: "Learn the basics with instructions",
        handler: () => {
          this.close();
          resolve();
        },
      },
      saveFile
        ? {
            label: "Continue Game",
            description: "Resume your game",
            handler: () => {
              this.close();
              resolve(saveFile);
            },
          }
        : null,
    ].filter((v) => v);
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("TitleScreen");
    this.element.innerHTML = `
    <img class="TitleScreen_logo" src="/images/doctor-who-logo.png" alt="Pizza Legends" />
    `;
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
