class SonicMenu {
  constructor({ map, user, onComplete, options }) {
    this.map = map;
    // not used yet
    this.user = user;
    this.onComplete = onComplete;
    this.options = options;
    this.handleSonicFinished = this.handleSonicFinished.bind(this);
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("SonicMenu");
    this.element.classList.add("green");
    //this.element.classList.add("SonicMenu_blue");
    // this.element.innerHTML = `
    //         <div class="sonic_menu">
    //             <h3>Sonic Menu</h3>
    //             <p>Option 1</p>
    //             <p>Option 2</p>
    //             <p>Option 3</p>
    //             <p>Option 4</p>
    //         </div>
    //              `;
  }

  addBackgroundImage() {
    // Set the image to dynamic path for live version of game
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

  handleSonicFinished() {
    this.onComplete();
  }

  end() {
    // End keyboard menu
    // this.keyboardMenu.end();
    // remove element
    this.element.remove();

    document.removeEventListener("SonicFinished", this.handleSonicFinished);
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

  showMenu(container) {
    this.container = container;
    this.menu = new Menu({
      //title: "Sonic Options",
    });
    this.menu.init(container);
    console.log("sonic menu options: ", this.options);
    this.addFonts();

    this.menu.setOptions(this.options);
  }

  showData(data) {
    console.log("Show data callsed");
    console.log(data);
    this.dataScreenMenu = new Menu({
      title: "Scan results for: " + data.id,
    });
    this.menu.hide();
    this.dataScreenMenu.init(this.container);
    const backButtonFunc = () => {
      console.log("back button pressed");
      this.menu.unhide();
      this.dataScreenMenu.end();
    };
    this.dataScreenMenu.setDataElement(data, backButtonFunc);
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
    document.addEventListener("SonicFinished", this.handleSonicFinished);
    // this.addBackgroundImage();
    // this.addFonts();
    this.showMenu(this.element);

    // utils.wait(20);

    // this.keyboardMenu.setDescText("Sonic Menu TEST");
    // ///this.keyboardMenu.descriptionElementText.innerText = "Sonic Menu TEST";
  }
}
