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
    if (this.isSonicEquipped && this.user.map) {
      if (this.sonicActive) {
        this.sonicActive = false;

        utils.emitEvent("SonicFinished", { whoId: this.user.id });

        if (this.sonicAudio && !this.sonicAudio.paused) {
          this.sonicAudio.pause();
          this.sonicAudio.currentTime = 1; // Reset to the start
        }
      } else {
        this.sonicActive = true;

        if (this.sonicAudio) {
          this.sonicAudio.pause();
          this.sonicAudio.currentTime = 1; // Reset to the start

          try {
            await this.sonicAudio.play();
          } catch (error) {
            console.error("Audio playback failed:", error);
          }
        }

        // Optimize this method further if needed
        this.checkForInteractive();
        this.scanObjects();
      }
    }
  }

  async scanObjects() {
    let sonicScanRayX = this.user.x;
    let sonicScanRayY = this.user.y;

    // Define the initial range of the wave (starting from 1)
    let waveRange = 1;

    // Search 10 steps ahead of the player
    for (let j = 0; j < 200; j++) {
      // Check for interactive objects within the current wave range
      for (let dx = -waveRange; dx <= waveRange; dx++) {
        for (let dy = -waveRange; dy <= waveRange; dy++) {
          let checkX = sonicScanRayX + dx;
          let checkY = sonicScanRayY + dy;

          for (let key in this.user.map.gameObjects) {
            if (
              this.user.map.gameObjects[key].x === checkX &&
              this.user.map.gameObjects[key].y === checkY &&
              key !== "hero"
            ) {
              const match = this.user.map.gameObjects[key];
              console.log(match); // Display objects to user

              if (this.user.map.isEventHappening) {
                console.log("menu is active");
                const sonicMenu = document.querySelector(".SonicMenu");
                console.log("sonic menu from sonic", sonicMenu);
              } else {
                console.log("no menu");
                // Start a menu with data
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
              // Return after finding the first match
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

      // Increase the wave range every two steps
      if (j > 1) {
        waveRange += 1;
      }
    }
  }

  checkForInteractive() {
    // Destructure the user's current position and direction
    const { x: userX, y: userY, direction } = this.user;

    // Define the directional increments based on the user's direction
    const directions = {
      down: { dx: 0, dy: 1 }, // Move downward (y+)
      right: { dx: 1, dy: 0 }, // Move rightward (x+)
      up: { dx: 0, dy: -1 }, // Move upward (y-)
      left: { dx: -1, dy: 0 }, // Move leftward (x-)
    };

    // Get the correct increment values (dx, dy) based on the user's direction
    const { dx, dy } = directions[direction];

    // Define how far ahead to check for interactive objects
    const maxSteps = 50; // Reduced from 300 pixels for better performance

    // Loop over the defined range to check in the player's direction
    for (let i = 0; i < maxSteps; i++) {
      // Calculate the current scanning position based on the player's direction
      const checkX = userX + i * dx;
      const checkY = userY + i * dy;

      // Check if there's an interactive object at the current scanning position
      const match = this.user.map.sonicspaces[`${checkX},${checkY}`];

      // If an interactive object is found and no cutscene is playing
      if (match && !this.user.map.isCutScenePlaying) {
        console.log("Found match", match[0].events);

        // Start the interactive event
        this.user.map.startInteractive(match[0].events);

        // Exit the function early after finding an interactive object
        return;
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
