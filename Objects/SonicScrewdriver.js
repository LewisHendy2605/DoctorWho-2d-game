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
  unbindSonicListeners() {
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
          // wave prorpogation scan for game objets + can start interactives
          this.scanObjects();
        }
      }
    }
  }

  async scanObjects() {
    let sonicScanRayX = this.user.x;
    let sonicScanRayY = this.user.y;

    // Define the initial range of the wave (starting from 1)
    let waveRange = 1;

    // Search 10 steps ahead of the player
    for (let j = 0; j < 300; j++) {
      //   console.log(
      //     `Sonic X: ${sonicScanRayX}, Sonic Y: ${sonicScanRayY}, Wave Range: ${waveRange}`
      //   );

      // Check for interactive objects within the current wave range
      for (let dx = -waveRange; dx <= waveRange; dx++) {
        for (let dy = -waveRange; dy <= waveRange; dy++) {
          let checkX = sonicScanRayX + dx;
          let checkY = sonicScanRayY + dy;

          for (let key in this.user.map.gameObjects) {
            //console.log(this.user.map.gameObjects[key]);
            if (
              this.user.map.gameObjects[key].x === checkX &&
              this.user.map.gameObjects[key].y === checkY &&
              key !== "hero"
            ) {
              //console.log("found match !!!!!");
              const match = this.user.map.gameObjects[key];
              // Display objects to user
              console.log(match);
              if (this.user.map.isEventHappening) {
                // add object data to existing menu
                console.log("menu is active");
                const sonicMenu = document.querySelector(".SonicMenu");
                console.log("sonic menu from sonic", sonicMenu);
              } else {
                console.log("no menu");
                // start a menu up with data
                // Start sonic menu
                if (this.user.map.gameObjects[key].interactiveOptions !== 0) {
                  const event = new OverworldEvent({
                    map: this.user.map,
                    event: {
                      type: "showSonicMenu",
                      options:
                        this.user.map.gameObjects[key].interactiveOptions,
                    },
                  });
                  await event.init();
                }
              }
              //this.menuEvent
              return;
            }
          }
        }
      }

      // Increment sonic ray x or y based on player direction
      if (this.user.direction === "down") {
        sonicScanRayY += 1;
      } else if (this.user.direction == "right") {
        sonicScanRayX += 1;
      } else if (this.user.direction == "up") {
        sonicScanRayY -= 1;
      } else if (this.user.direction == "left") {
        sonicScanRayX -= 1;
      }

      // Increase the wave range as the ray moves outward
      waveRange += 1;
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
        //this.user.map.startInteractive(match[0].events);
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
    // Grab buttons for the sonic use on mobile
    this.actionButton = document.getElementById("actionButton");
    this.sonicButton = document.getElementById("sonicButton");

    // Only set listener if it is the doctor as only doctor can use sonic (for now)
    if (this.user.isDoctor) {
      if (document.body.classList.contains("mobile-device")) {
        // Initialse the sonic buttons
        this.updateSonicButtons();

        if (this.actionButton) {
          this.actionButton.addEventListener("click", () => {
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

        // Hide buttons if desktop
        this.actionButton.style.display = "none";
        this.sonicButton.style.display = "none";
      }
    }
  }

  updateSonicButtons() {
    if (this.isSonicEquipped) {
      this.actionButton.innerText = "Unequip Sonic";
      this.sonicButton.style.display = "block";
    } else {
      this.actionButton.innerText = "Equip Sonic";
      this.sonicButton.style.display = "none";
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
