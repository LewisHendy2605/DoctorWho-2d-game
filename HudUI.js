class HudUI {
  constructor(character, imgPath) {
    this.character = character;
    this.imgPath = utils.setDynamicPath(imgPath);
    this.sonicImgPath = utils.setDynamicPath("/images/ui/sonic-ui.png");
    this.container = document.querySelector(".game-container");

    this.isPlayerMenuActive = false;
    this.playerMenuActiveScreen = "";

    this.isSonicMenuActive = false;
    this.sonic - null;
  }

  createElement() {
    // creaet hud HTML
    this.element = document.createElement("div");
    this.element.classList.add("HudUI");
    this.element.innerHTML = `
    <h3 class="HudUI_p_name">${utils.capitalizeFirstLetter(
      this.character.type
    )}</h3>
      <img src="${this.imgPath}" class="HudUI_img " />
      <div class="HudUI_sonic hidden">
      <img src="${this.sonicImgPath}" class="HudUI_sonic_img" />
      <p class="HudUI_sonic_mode_p"> Mode: ${
        this.character.sonicScrewdriver.activeMode.name
      } </p>
      </div>
    `;

    //<p class="HudUI_sonic_img"> Mode: ${
    //  this.character.sonicScrewdriver.activeMode.name
    // } </p>

    // Store references to the images for later manipulation
    this.image = this.element.querySelector(".HudUI_img");
    this.sonicImage = this.element.querySelector(".HudUI_sonic_img");
    this.sonicHud = this.element.querySelector(".HudUI_sonic");

    // amke sonic element interactibale
    //this.sonicElement = this.element.querySelector(".HudUI_sonic_img");
    this.sonicHud.addEventListener("click", () => this.addOrRemoveSonicHUD());

    this.image.addEventListener("click", () => this.addOrRemoveDoctorHUD());

    // Show sonic hud if we have to
    if (this.character.sonicScrewdriver.isSonicEquipped) {
      this.toggleSonicVisibility();
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

      this.playerImg = document.createElement("img");
      this.playerImg.classList.add("InvatoryScreen_playerImg");
      this.playerImg.src = utils.setDynamicPath(
        "/images/characters-doctor-who/doctor-single.png"
      );
      this.invatoryScreen.appendChild(this.playerImg);

      // create holder for invatory items
      this.invatoryContainer = document.createElement("div");
      this.invatoryContainer.classList.add("InvatoryScreen_container");
      this.invatoryScreen.appendChild(this.invatoryContainer);

      let tempElement = null;
      for (let i = 0; i < this.character.invatory.length; i++) {
        let item = this.character.invatory[i];
        tempElement = document.createElement("p");
        tempElement.classList.add("InvatoryScreen_item");
        tempElement.innerText =
          item.type === "collectable"
            ? item.name + ` - *${item.quantity}`
            : item.name;
        this.invatoryContainer.appendChild(tempElement);
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

  addSkillsScreen() {
    this.clearPlayerMenuScreen();
    console.log("skills clicked");
    this.playerMenuActiveScreen = "skills";
    if (!this.skillsHeaderElem.classList.contains("active")) {
      this.skillsHeaderElem.classList.add("active");
    }
  }

  removeSkillsScreen() {
    if (this.skillsScreen) {
      this.skillsScreen.remove();
    }

    if (this.skillsHeaderElem.classList.contains("active")) {
      this.skillsHeaderElem.classList.remove("active");
    }

    // reset menu elements
    this.skillsScreen = null;
  }

  addMapScreen() {
    this.clearPlayerMenuScreen();
    console.log("map clicked");
    if (!this.mapHeaderElem.classList.contains("active")) {
      this.mapHeaderElem.classList.add("active");
    }
    if (!this.mapScreen) {
      console.log("creating map");
      // create invatory screen if not created
      this.mapScreen = document.createElement("div");
      this.mapScreen.classList.add("MapScreen");

      // create map img
      this.mapImg = document.createElement("img");
      this.mapImg.classList.add("MapScreen_img");
      this.mapImg.src = this.character.map.lowerImage.src;
      // add to map screen
      this.mapScreen.appendChild(this.mapImg);

      // add elemet to game container
      this.playerHudMenu.appendChild(this.mapScreen);
    }
  }

  removeMapScreen() {
    if (this.mapScreen) {
      this.mapScreen.remove();
    }

    if (this.mapHeaderElem.classList.contains("active")) {
      this.mapHeaderElem.classList.remove("active");
    }

    // reset menu elements
    this.mapScreen = null;
  }

  addOrRemoveSonicHUD() {
    console.log("sonic clicked");
    //toggleSonic;
    // if active hide menu
    if (this.isSonicMenuActive) {
      this.sonicHudMenu.remove();
      this.isSonicMenuActive = false;
    } else {
      // else add it to hud
      this.sonicHudMenu = document.createElement("div");
      this.sonicHudMenu.classList.add("SonicHudUI");
      this.sonicHudMenu.innerHTML = `
      <h3 class="SonicHudUI_title">${"Sonic Modes"}</h3>
    
  
      `;
      // <p class="SonicHudUI_option"> Settings </p>

      // Set up conrtrols for sonic
      //console.log("Sonic: ", this.sonic.modes);
      // create sonic menu options
      let tempElement = null;
      this.character.sonicScrewdriver.modes.forEach((element) => {
        tempElement = document.createElement("p");
        tempElement.classList.add("SonicHudUI_option");
        tempElement.innerText = element.name;
        tempElement.addEventListener("click", () =>
          this.sonicModeOptionClicked(element)
        );
        this.sonicHudMenu.appendChild(tempElement);
      });

      // add elemet to game container
      this.element.appendChild(this.sonicHudMenu);
      this.isSonicMenuActive = true;
    }
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

  createElementCanvas() {
    // Create a new div element
    this.element = document.createElement("div");
    this.element.classList.add("HudUI");

    // Create and configure the canvas element
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Define the size of the canvas to match your image's dimensions
    const imageSize = 32; // Example size, replace with your actual image size
    canvas.width = imageSize;
    canvas.height = imageSize;

    // Set image smoothing to false
    context.imageSmoothingEnabled = false;
    context.imageSmoothingQuality = "high";

    // Create an image object
    const img = new Image();
    img.src = this.imgPath;

    // Draw the image on the canvas once it has loaded
    img.onload = () => {
      context.drawImage(img, 0, 0, 16, 16);
    };

    // Append the canvas to the div
    this.element.appendChild(canvas);

    // Optionally, add a paragraph for HUD text
    const p = document.createElement("p");
    p.classList.add("HudUI_p");
    p.textContent = "HUD";
    this.element.appendChild(p);
  }

  update() {}

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
    this.container.appendChild(this.element);
  }
}
