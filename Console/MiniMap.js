class MiniMap {
  constructor({ map, onComplete }) {
    this.map = map;
    this.onComplete = onComplete;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("miniMapScreen");
    this.element.classList.add("consoleScreenBox");

    // add background image
    const miniMapImg = document.createElement("img");
    miniMapImg.classList.add("miniMapScreenImg");
    miniMapImg.src = utils.setDynamicPath("/images/maps/Town/townMiniMap.png");
    this.element.appendChild(miniMapImg);

    // add back button
    const backButton = document.createElement("div");
    backButton.classList.add("miniMapScreenBackBtn");
    backButton.innerText = "Back";
    backButton.addEventListener("click", () => {
      this.end();
    });
    this.element.appendChild(backButton);
  }

  addInteractiveElements() {
    // create clickable / hoverable to select what part of the map to go to

    // --- Top right
    const topRightElement = document.createElement("div");
    topRightElement.classList.add("miniMapScreenTopRightInteractive");

    // add interactivity
    topRightElement.addEventListener("click", () => {
      // Change tardis outside map
      const event = new OverworldEvent({
        map: this.map,
        event: { type: "changeTardisDest", map: "SunnyVale_PowerStation" },
      });
      event.init();
      // Tell palyer theve aarived
      const textEvent = new OverworldEvent({
        map: this.map,
        event: {
          type: "textMessage",
          text: "Tardis Destination set to SunnyVale Power Station",
        },
      });
      textEvent.init();
      // Close Screen
      this.end();
    });

    // show / remove place name
    topRightElement.addEventListener("mouseover", () => {
      this.addPlaceNameFromHover("Power Station", topRightElement);
    });
    topRightElement.addEventListener("mouseout", () => {
      this.removePlaceNameFromHover();
    });
    this.element.appendChild(topRightElement);

    // --- Bottom Left
    const bottomLeftElement = document.createElement("div");
    bottomLeftElement.classList.add("miniMapScreenBottomLeftInteractive");

    // add interactivity
    bottomLeftElement.addEventListener("click", () => {
      // Change tardis outside map
      const event = new OverworldEvent({
        map: this.map,
        event: { type: "changeTardisDest", map: "Earth_Town" },
      });
      event.init();
      // Tell palyer theve aarived
      const textEvent = new OverworldEvent({
        map: this.map,
        event: {
          type: "textMessage",
          text: "Tardis Destination set to SunnyVale Town",
        },
      });
      textEvent.init();

      // Close Screen
      this.end();
    });

    // show / remove place name
    bottomLeftElement.addEventListener("mouseover", () => {
      this.addPlaceNameFromHover("Town Center", bottomLeftElement);
    });
    bottomLeftElement.addEventListener("mouseout", () => {
      this.removePlaceNameFromHover();
    });
    this.element.appendChild(bottomLeftElement);
  }

  addPlaceNameFromHover(name, element) {
    // // Show hover text near the mouse cursor
    this.hoverElement = document.createElement("div");
    this.hoverElement.classList.add("hover_mouse_text");

    this.hoverElement.innerText = name;

    //this.map.overworld.element.appendChild(this.hoverElement);
    element.appendChild(this.hoverElement);

    // Update hover text position next to the mouse (adjust for scale)
    this.hoverElement.style.left = `50%`; // Offset 10px
    this.hoverElement.style.top = `30%`;
    this.hoverElement.style.zIndex = `24`;
  }

  removePlaceNameFromHover() {
    if (this.hoverElement) {
      this.hoverElement.remove();
    }
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
    if (this.keyboardMenu) {
      this.keyboardMenu.end();
    }

    // remove element
    this.element.remove();

    this.onComplete();
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
          label: "Town",
          class: "dest-button",
          map: "Earth_Town",
          handler: () => {
            // get the map data
            const selectedMap = window.OverworldMaps["Earth_Town"];

            // Show the mini map for the town
            const event = new OverworldEvent({
              map: this.map,

              event: { type: "showMiniMap", for: selectedMap },
            });
            event.init();

            // Change tardis outside map
            // const event = new OverworldEvent({
            //   map: this.map,
            //   event: { type: "changeTardisDest", map: "Earth_Town" },
            // });
            // event.init();
            // Tell palyer theve aarived
            // const textEvent = new OverworldEvent({
            //   map: this.map,
            //   event: { type: "textMessage", text: "Tardis Landed" },
            // });
            // textEvent.init();
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
        const mapId = options.root[index].map;
        const imgSrc = window.OverworldMaps[mapId];

        if (imgSrc) {
          const lowerSrc = imgSrc.lowerSrc;

          const dynamicUrl = utils.setDynamicPath(lowerSrc);

          const button = option.querySelector("button");

          if (button.classList.contains("dest-button")) {
            button.style.backgroundImage = `url(${dynamicUrl})`;
            button.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Add desired background color
            button.style.border = "7px solid blue";
            button.style.borderRadius = "15%";
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
    this.addInteractiveElements();
    //this.addBackgroundImage();
    // this.addFonts();
    // this.showMenu(this.element);
    // this.addImagesToOptions();
  }
}
