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
    // Destructure the user's current position and direction
    const { x: userX, y: userY, direction } = this.user;

    // Define the maximum range to scan for objects
    const maxRange = 10; // Reduced from 200 to improve performance

    // The initial wave range is reduced since the scanning is directional
    let range = 1;

    // Define the directional increments based on the user's direction
    const directions = {
      down: { dx: 0, dy: 1 }, // Move downward (y+)
      right: { dx: 1, dy: 0 }, // Move rightward (x+)
      up: { dx: 0, dy: -1 }, // Move upward (y-)
      left: { dx: -1, dy: 0 }, // Move leftward (x-)
    };

    // Get the correct increment values (dx, dy) based on the user's direction
    const { dx, dy } = directions[direction];

    // Loop over the defined range to scan in the player's direction
    for (let j = 0; j < maxRange; j++) {
      // Calculate the current scanning position based on the player's direction
      const scanX = userX + j * dx;
      const scanY = userY + j * dy;

      // Check all game objects to see if any are at the scanning position
      for (let key in this.user.map.gameObjects) {
        const gameObject = this.user.map.gameObjects[key];

        // If an interactive object is found at the scanning position
        if (
          gameObject.x === scanX &&
          gameObject.y === scanY &&
          key !== "hero"
        ) {
          console.log(gameObject);

          // If an event is currently happening, update the Sonic menu
          if (this.user.map.isEventHappening) {
            const sonicMenu = document.querySelector(".SonicMenu");
            if (sonicMenu) {
              console.log("menu is active", sonicMenu);
            }
          } else {
            // If no event is happening, start a new event
            if (gameObject.interactiveOptions !== 0) {
              const event = new OverworldEvent({
                map: this.user.map,
                event: {
                  type: "showSonicMenu",
                  options: gameObject.interactiveOptions,
                },
              });
              await event.init();
            }
          }
          // Exit the function early after finding an interactive object
          return;
        }
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
