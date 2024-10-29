class EarthDestScreen {
  constructor({ map, onComplete }) {
    this.map = map;
    //this.hoverInteractiveText = hoverInteractiveText;
    this.onComplete = onComplete;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("ChangeDestScreen");
    this.element.classList.add("consoleScreenBox");
  }

  addBackgroundImage() {
    // Set the image to dynamic path fro live version of game
    const dynamicUrl = utils.setDynamicPath("/images/planets/earth.png");
    const consoleScreenElement =
      document.querySelectorAll(".ChangeDestScreen")[1];
    consoleScreenElement.style.backgroundColor = "black";
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

            // show interactiev again
            //this.hoverInteractiveText.style.display = "block";
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
              hoverInteractiveText: this.hoverInteractiveText,
              event: { type: "showMiniMap", mapToShow: selectedMap },
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
        console.log(options, index, options.root[index]);
        // chack if map is present
        if (options.root[index]) {
          const mapId = options.root[index].map;
          const map = window.OverworldMaps[mapId];

          if (map) {
            let imgSrc = map.lowerSrc;
            // use mini map map img if it exsists
            if (map.miniMapSrc) {
              imgSrc = map.miniMapSrc;
            }

            const dynamicUrl = utils.setDynamicPath(imgSrc);

            const button = option.querySelector("button");

            if (button.classList.contains("dest-button")) {
              // craete and add img to button
              const imgElement = document.createElement("img");
              imgElement.src = dynamicUrl;
              imgElement.style.position = "absolute";
              //imgElement.style.objectFit = "cover";
              imgElement.style.width = "100%";
              imgElement.style.height = "100%";
              imgElement.style.border = "1px solid black";
              imgElement.style.borderRadius = "5px";
              button.appendChild(imgElement);

              // add text to buton
              const textElement = document.createElement("p");
              textElement.innerText = map.id;
              textElement.style.position = "absolute";
              textElement.style.fontSize = "0.8rem";
              textElement.style.width = "100%";
              textElement.style.height = "100%";
              textElement.style.margin = "0";
              textElement.style.padding = "20% 0";
              button.appendChild(textElement);
              console.log("appended img to button", button);
              // button.style.backgroundImage = `url(${dynamicUrl})`;
              // button.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Add desired background color
              // button.style.border = "1px solid blue";
              // button.style.borderRadius = "2px";
            }
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
