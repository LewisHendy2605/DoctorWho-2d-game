class ConsoleScreen {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("ConsoleScreen");
    //this.element.innerHTML = `
    //       <div class="Battle_hero">
    //<img src="${"/images/tardis/tardis-screen.png"}" alt="ConsoleScreenImg"/>
    //      </div>
    //          `;
  }

  end() {
    // End keyboard menu
    this.keyboardMenu.end();
    // remove element
    this.element.remove();
  }
  getPages() {
    return {
      root: [
        {
          label: "Back",
          class: "back-button",
          handler: () => {
            // Clsoe console Screen
            this.onComplete();
          },
        },
      ],
    };
  }

  showMenu(container) {
    this.keyboardMenu = new KeyboardMenu();
    this.keyboardMenu.init(container);
    this.keyboardMenu.setOptions(this.getPages().root);
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.showMenu(this.element);
  }
}
