class HudUI {
  constructor(character, imgPath) {
    this.character = character;
    this.imgPath = utils.setDynamicPath(imgPath);
    this.sonicImgPath = utils.setDynamicPath("/images/ui/sonic-ui.png");
    this.container = document.querySelector(".game-container");
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
