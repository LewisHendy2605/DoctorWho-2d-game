class ChangeDestScreen {
  constructor({ map, onComplete }) {
    this.map = map;
    this.onComplete = onComplete;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("ChangeDestScreen");
  }

  addBackgroundImage() {
    // Set the image to dynamic path fro live version of game
    const dynamicUrl = utils.setDynamicPath("/images/planets/stars.png");
    const consoleScreenElement = document.querySelector(".ChangeDestScreen");
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
          label: "Earth",
          class: "dest-button",
          imgSrc: "/images/planets/earth.png",
          handler: () => {
            // Change tardis outside map
            const event = new OverworldEvent({
              map: this.map,
              event: { type: "useEarthDestScreen" },
            });
            event.init();

            // Close console screen
            this.onComplete();
          },
        },
        {
          label: "Mars",
          class: "dest-button",
          imgSrc: "/images/planets/mars.png",
          handler: () => {
            // Change tardis outside map
            const event = new OverworldEvent({
              map: this.map,
              event: { type: "useMarsDestScreen" },
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

  addImagesToOptions() {
    // Grab the keyboard element for the second console screen
    const keyboardMenuElementName = this.keyboardMenu.element.className;
    const keyboardMenuElements = document.querySelectorAll(
      `.${keyboardMenuElementName}`
    );
    const keyboardMenuElement = keyboardMenuElements[1];

    // Add the images to each destination button
    if (keyboardMenuElement) {
      const options = keyboardMenuElement.querySelectorAll(".option");

      options.forEach((option, index) => {
        //console.log(option);
        // remove span elemenst
        const span = option.querySelector(".right");
        if (span) {
          span.remove();
        }

        // Graps the map image src from the overworldMaps json
        const options = this.getPages();
        const imgSrc = options.root[index].imgSrc;

        if (imgSrc) {
          const dynamicUrl = utils.setDynamicPath(imgSrc);

          const button = option.querySelector("button");

          if (button.classList.contains("dest-button")) {
            button.style.backgroundImage = `url(${dynamicUrl})`;
          }
        }
      });
    } else {
      console.log("KeyboardMenu not found");
    }
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.addBackgroundImage();
    this.addFonts();
    this.showMenu(this.element);
    this.addImagesToOptions();
  }
}
