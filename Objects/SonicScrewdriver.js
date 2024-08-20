class SonicScrewdriver {
  constructor(user) {
    this.user = user;
    this.isSonicEquipped = false;
    this.sonicActive = false;
    this.sonicAudio = new Audio(utils.setDynamicPath("/audio/sonic.mp3"));
    this.sonicListener = null;
    this.sonicFinishedListener = null;

    this.bindScrewdriverEquiperListener();
  }

  bindSonicListeners() {
    // Using arrow function instead of directly passing method so i can use "this" keyword
    //document.addEventListener("click", (event) => this.handleSonicEvent(event));

    if (document.body.classList.contains("mobile-device")) {
      if (this.sonicButton) {
        this.sonicButton.addEventListener("click", () =>
          this.handleSonicEvent()
        );
      }
    } else {
      this.sonicListener = new KeyPressListener("KeyE", () =>
        this.handleSonicEvent()
      );
    }
  }

  unbindSonicListener() {
    //console.log("unbinded mouse listerner");
    // document.removeEventListener("click", (event) =>
    //   this.handleSonicEvent(event)
    // );
    if (document.body.classList.contains("mobile-device")) {
      this.sonicButton.removeEventListener("click", () =>
        this.handleSonicEvent()
      );
    } else {
      if (this.sonicListener) {
        this.sonicListener.unbind();
      }
    }
  }

  async handleSonicEvent() {
    if (this.isSonicEquipped) {
      // need to proply unbind
      if (this.user.map) {
        // const { mouseGridX, mouseGridY } = utils.getMapCoordsFromMouse(
        //   this.map.gameObjects.hero,
        //   event
        // );
        // Need to implement time for sonic instead
        if (this.sonicActive) {
          // Update flag
          this.sonicActive = false;

          //change buton text   / need only for mobiole otherwise bug
          //this.sonicButton.innerText = "Sonic";
          // emit event for sonic menu
          utils.emitEvent("SonicFinished", {
            whoId: this.user.id,
          });
          // Stop audio
          if (this.sonicAudio) {
            this.sonicAudio.pause();
          }
        } else {
          // update flag
          this.sonicActive = true;

          //change buton text  / need only for mobiole otherwise bug
          //this.sonicButton.innerText = "Stop Sonic";
          // Handele audio
          if (this.sonicAudio) {
            this.sonicAudio.pause(); // Ensure any previous audio is paused
          }

          this.sonicAudio.currentTime = 1;

          try {
            await this.sonicAudio.play();
          } catch (error) {
            console.error("Audio playback failed:", error);
          }

          // Handle sonic event
          this.checkForInteractive();
        }
      }
    }
  }

  checkForInteractive() {
    //const interactives = this.map.interavtives; // fix miss spelling
    let sonicRayX = this.user.x;
    let sonicRayY = this.user.y;

    // Search 300 pixels infront of player
    for (let j = 0; j < 300; j++) {
      //console.log(`Sonic X: ${sonicRayX}, Sonic Y:`, sonicRayY);

      // Check for interactive usins g sonic x,y
      const match = this.user.map.sonicspaces[`${sonicRayX},${sonicRayY}`];

      if (match && !this.user.map.isCutScenePlaying) {
        console.log("Found match");
        console.log(match[0].events);
        this.user.map.startInteractive(match[0].events);
        return;
      }

      // Increment sonic ray x or y otherwise absed on player direction
      if (this.user.direction === "down") {
        sonicRayY += 1;
      } else if (this.user.direction == "right") {
        sonicRayX += 1;
      } else if (this.user.direction == "up") {
        sonicRayY -= 1;
      } else if (this.user.direction == "left") {
        sonicRayX -= 1;
      }
    }
  }

  bindScrewdriverEquiperListener() {
    // Only set listener if it is the doctor as only doctor can use sonic (for now)
    if (this.user.isDoctor) {
      if (document.body.classList.contains("mobile-device")) {
        // equip for mobile
        this.actionButton = document.getElementById("actionButton");
        this.sonicButton = document.getElementById("sonicButton");

        //this.updateSonicButtons();

        if (actionButton) {
          actionButton.addEventListener("click", () => {
            // Update sprite src to one with sonic in hand
            if (this.isSonicEquipped) {
              this.user.sprite.image.src = utils.setDynamicPath(
                "/images/characters-doctor-who/doctor-11.png"
              );
              this.isSonicEquipped = false;
              this.updateSonicButtons();
            } else {
              this.user.sprite.image.src = utils.setDynamicPath(
                "/images/characters-doctor-who/doctor-11-screwdriver.png"
              );
              this.isSonicEquipped = true;
              this.updateSonicButtons();
              this.bindSonicListeners();
            }
          });
        }
      } else {
        // set key listeners for dektop
        this.screwdriverEquipListener = new KeyPressListener("KeyQ", () =>
          this.handleSonicEquip()
        );
      }
    }
  }

  updateSonicButtons() {
    if (this.isSonicEquipped) {
      actionButton.innerText = "Unequip Sonic";
      sonicButton.style.display = "block";
    } else {
      actionButton.innerText = "Equip Sonic";
      sonicButton.style.display = "none";
    }
  }

  handleSonicEquip() {
    // Update sprite src to one with sonic in hand
    if (this.isSonicEquipped) {
      this.user.sprite.image.src = utils.setDynamicPath(
        "/images/characters-doctor-who/doctor-11.png"
      );
      this.isSonicEquipped = false;
      this.unbindSonicListeners();
    } else {
      this.user.sprite.image.src = utils.setDynamicPath(
        "/images/characters-doctor-who/doctor-11-screwdriver.png"
      );
      this.isSonicEquipped = true;
      this.bindSonicListeners();
    }
  }
}
