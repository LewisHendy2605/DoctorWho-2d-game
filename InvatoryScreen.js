class InvatoryScreen {
  constructor({ map, invatory }) {
    if (map.gameObjects["hero"]) {
      this.hero = map.gameObjects["hero"];
    }

    this.map = map;
    this.invatory = invatory;
  }

  createElement() {
    // creaet hud HTML // css in in HudUi folder
    this.element = document.createElement("div");
    this.element.classList.add("InvatoryScreen");
    this.element.classList.add("boxInvatory-blue");

    let tempElement = null;
    for (let i = 0; i < this.invatory.length; i++) {
      let item = this.invatory[i];
      console.log(item);
      tempElement = document.createElement("p");
      //tempElement.classList.add("InvatoryScreen_item");
      tempElement.innerText = item.name + ` - × ${item.quantity}`;
      this.element.appendChild(tempElement);
    }
  }
  addOrRemoveDoctorHUD() {
    console.log("Doctor clicked");
    //toggleSonic;
    // if active hide menu
    if (this.isPlayerMenuActive) {
      this.clearPlayerMenuScreen();
      // remove screen + update tracker
      this.playerHudMenu.remove();
      this.isPlayerMenuActive = false;
    } else {
      // else add it to hud
      this.playerHudMenu = document.createElement("div");
      this.playerHudMenu.classList.add("PlayerHudUI");
      this.playerHudMenu.innerHTML = `
        
        <div class="PlayerHudUI_header"> 
          <p class="PlayerHudUI_header_option invatory">Invatory</p> 
          <p class="PlayerHudUI_header_option skills">Skills</p> 
          <p class="PlayerHudUI_header_option crafting">Crafting</p> 
          <p class="PlayerHudUI_header_option map">Map</p> 
        </div>
        `;
      // <h3 class="PlayerHudUI_title">${"Player Menu"}</h3>
      // <p class="SonicHudUI_option"> Settings </p>

      // Add listeners to show the relevant screen when header iption is clicked
      //invatory
      this.invatoryHeaderElem = this.playerHudMenu.querySelector(
        ".PlayerHudUI_header_option.invatory"
      );
      this.invatoryHeaderElem.addEventListener("click", () =>
        this.addInvatoryScreen()
      );
      //skills
      this.skillsHeaderElem = this.playerHudMenu.querySelector(
        ".PlayerHudUI_header_option.skills"
      );
      this.skillsHeaderElem.addEventListener("click", () =>
        this.addSkillsScreen()
      );
      // map
      this.mapHeaderElem = this.playerHudMenu.querySelector(
        ".PlayerHudUI_header_option.map"
      );
      this.mapHeaderElem.addEventListener("click", () => this.addMapScreen());

      // show invatory to start
      this.addInvatoryScreen();

      // // add elemet to game container
      this.element.appendChild(this.playerHudMenu);
      this.isPlayerMenuActive = true;
    }
  }

  clearPlayerMenuScreen() {
    this.removeInvatoryScreen();
    this.removeSkillsScreen();
    this.removeMapScreen();
  }

  addInvatoryScreen() {
    this.clearPlayerMenuScreen();
    console.log("invatory clicked");
    // if (this.playerMenuActiveScreen === "invatory") {
    //   // active button in header
    //   //this.invatoryHeaderElem.classList.remove("active");
    //   //this.playerMenuActiveScreen = "";
    //   //this.playerHudMenu.remove();
    //   //this.isPlayerMenuActive = false;
    // } else {
    // update trackers + button
    this.playerMenuActiveScreen = "invatory";
    if (!this.invatoryHeaderElem.classList.contains("active")) {
      this.invatoryHeaderElem.classList.add("active");
    }
    if (!this.invatoryScreen) {
      console.log("creating invatorty");
      // create invatory screen if not created
      this.invatoryScreen = document.createElement("div");
      this.invatoryScreen.classList.add("InvatoryScreen");

      let tempElement = null;
      for (let i = 0; i < this.character.invatory.length; i++) {
        let item = this.character.invatory[i];
        tempElement = document.createElement("p");
        tempElement.classList.add("InvatoryScreen_item");
        tempElement.innerText =
          item.type === "collectable"
            ? item.name + ` - *${item.quantity}`
            : item.name;
        this.invatoryScreen.appendChild(tempElement);
      }
      // add elemet to game container
      this.playerHudMenu.appendChild(this.invatoryScreen);
    }

    //}
  }

  removeInvatoryScreen() {
    if (this.invatoryScreen) {
      this.invatoryScreen.remove();
    }

    if (this.invatoryHeaderElem.classList.contains("active")) {
      this.invatoryHeaderElem.classList.remove("active");
    }

    // reset menu elements
    //this.invatoryHeaderElem = null;
    this.invatoryScreen = null;
  }

  sonicModeOptionClicked(elem) {
    //this.character.sonicScrewdriver.activeMode = elem;
    this.character.sonicScrewdriver.setActiveMode(elem);

    // Update the text of the sonic mode paragraph
    const modeParagraph = this.element.querySelector(".HudUI_sonic_mode_p");
    modeParagraph.textContent = `Mode: ${elem.name}`;

    // Close sonic menu after selection
    this.addOrRemoveSonicHUD();
  }

  toggleSonicVisibility() {
    // Toggle the 'hidden' class to show or hide the images
    //console.log(this.element.innerHTML);
    this.sonicHud.classList.toggle("hidden");
  }

  done() {
    this.element.remove();
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

  init(container) {
    this.addFonts();
    this.createElement();
    //this.createElementCanvas();

    console.log("adding to screen", this.element, container);
    container.appendChild(this.element);
  }
}
