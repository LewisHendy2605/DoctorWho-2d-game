class HudUI {
  constructor(character, imgPath) {
    this.character = character;
    this.imgPath = utils.setDynamicPath(imgPath);
    this.sonicImgPath = utils.setDynamicPath("/images/ui/sonic-ui.png");
    this.container = document.querySelector(".game-container");
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("HudUI");
    this.element.innerHTML = `
    <p class="HudUI_p_name">${utils.capitalizeFirstLetter(
      this.character.type
    )}</p>
      <img src="${this.imgPath}" class="HudUI_img" />
      <div class="HudUI_sonic">
      <img src="${this.sonicImgPath}" class="HudUI_sonic_img hidden" />
      </div>
    `;

    // Store references to the images for later manipulation
    this.image = this.element.querySelector(".HudUI_img");
    this.sonicImage = this.element.querySelector(".HudUI_sonic_img");
  }

  toggleSonicVisibility() {
    // Toggle the 'hidden' class to show or hide the imagesq
    //console.log("Toggle called");
    //console.log(this.element.innerHTML);
    this.sonicImage.classList.toggle("hidden");
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
