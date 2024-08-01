class ConsoleScreen {
  constructor({ map, onComplete }) {
    this.map = map;
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

  addBackgroundImage() {
    // Set the image to dynamic path fro live version of game
    const dynamicUrl = utils.setDynamicPath("/images/tardis/tardis-screen.png");
    const consoleScreenElement = document.querySelector(".ConsoleScreen");
    consoleScreenElement.style.backgroundImage = `url(${dynamicUrl})`;
  }

  addFonts() {
    const doctorWhoFontUrl = utils.setDynamicPath("/fonts/Drwho42.ttf");
    const doctorWho2FontUrl = utils.setDynamicPath("/fonts/dr2.ttf");

    const style = document.createElement("style");
    style.innerHTML = `
        @font-face {
          font-family: "DoctorWho";
          src: url(${doctorWhoFontUrl}) format("truetype");
        }
        @font-face {
          font-family: "DoctorWho2";
          src: url(${doctorWho2FontUrl}) format("truetype");
        }
        .ConsoleScreen {
          font-family: "DoctorWho";
        }
      `;
    document.head.appendChild(style);
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
          label: "Change Destination",
          class: "choose-dest",
          handler: () => {
            // Change tardis outside map
            const event = new OverworldEvent({
              map: this.map,
              event: { type: "useChangeDestScreen" },
            });
            event.init();

            // Close console screen
            this.onComplete();
          },
        },
        {
          label: "------Fly------",
          class: "choose-dest",
          handler: () => {
            // Change tardis outside map
            const event = new OverworldEvent({
              map: this.map,
              event: {
                type: "FlyTarids",
                map: "Outside_tardis",
              },
            });
            event.init();

            // Close console screen
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
    this.addBackgroundImage();
    this.addFonts();
    this.showMenu(this.element);
  }
}
