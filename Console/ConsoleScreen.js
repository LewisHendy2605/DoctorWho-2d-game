class ConsoleScreen {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("ConsoleScreen");
    this.element.innerHTML = `
        <div class="tardis_status">
            <h3>Tardis Status</h3>
            <p>Status: Landed</p>
            <p>Engines: On</p>
            <p>Eye of Harmony: Stable</p>
            <p>Shields: On</p>
        </div>
             `;
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
            // Close console screen
            this.onComplete();
          },
        },

        {
          label: "Choose Destination",
          class: "choose-dest",
          handler: () => {
            // TODO
            console.log("Select tardis destination");
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
