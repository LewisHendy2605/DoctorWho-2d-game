class SonicScrewdriver {
  constructor(user) {
    this.user = user;
    this.isSonicEquipped = false;
    this.sonicActive = false;
    this.sonicAudio = new Audio(utils.setDynamicPath("/audio/sonic.mp3"));
    this.sonicListener = null;
    this.sonicFinishedListener = null;

    this.bindScrewdriverEquiperListener();
    this.createSonicMenu();
  }

  done() {
    this.unbindSonicListeners();
    this.screwdriverEquipListener.unbind();
  }

  createSonicMenu() {}

  bindSonicListeners() {
    // Using arrow function instead of directly passing method so i can use "this" keyword
    //document.addEventListener("click", (event) => this.handleSonicEvent(event));

    if (document.body.classList.contains("mobile-device")) {
      if (this.sonicButton) {
        this.sonicButton.addEventListener("click", () =>
          this.handleSonicEvent()
        );
        this.sonicShootButton.addEventListener("click", () =>
          this.handleSonicShoot()
        );
      }
    } else {
      this.sonicListener = new KeyPressListener("KeyE", () =>
        this.handleSonicEvent()
      );
      this.sonicShootListener = new KeyPressListener("Space", () =>
        this.handleSonicShoot()
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
      this.sonicShootButton.removeEventListener("click", () =>
        this.handleSonicShoot()
      );
    } else {
      // probs should be seperate
      if (this.sonicListener && this.sonicShootListener) {
        this.sonicListener.unbind();
        this.sonicShootListener.unbind();
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

  async sonicForTime() {
    if (this.isSonicEquipped && this.user.map) {
      if (!this.sonicActive) {
        this.sonicActive = true;

        if (this.sonicAudio) {
          this.sonicAudio.pause();
          this.sonicAudio.currentTime = 1; // Reset to the start
          try {
            await this.sonicAudio.play();
            await utils.wait(600);
            this.sonicAudio.pause();
            this.sonicActive = false;
          } catch (error) {
            console.error("Audio playback failed:", error);
          }
        }
      }
    }
  }

  handleSonicShoot() {
    if (this.user.isMounted) {
      //console.log("Sonic shooting");
      this.sonicForTime();
      this.shoot();
    }
  }

  shoot() {
    let x = this.user.x;
    let y = this.user.y;

    const projectile = new Projectile({
      x,
      y,
      direction: this.user.direction,
      speed: 1,
      imageSrc: utils.setDynamicPath("/images/misc/sonic-projectile.png"),
    });
    this.user.sonicProjectiles.push(projectile);
  }

  async scanObjects() {
    let sonicScanRayX = this.user.x;
    let sonicScanRayY = this.user.y;

    // Define the initial range of the wave (starting from 1)
    let waveRange = 1;

    // Precompute the direction deltas
    const directionDeltas = {
      down: { x: 0, y: 1 },
      up: { x: 0, y: -1 },
      right: { x: 1, y: 0 },
      left: { x: -1, y: 0 },
    };

    const delta = directionDeltas[this.user.direction];

    // Precompute and cache gameObjects to avoid looking up values multiple times
    const gameObjects = Object.values(this.user.map.gameObjects).filter(
      (obj) => obj.id !== "hero"
    );

    // Helper function to process a single step asynchronously
    const processStep = async (sonicScanRayX, sonicScanRayY, waveRange) => {
      for (let dx = -waveRange; dx <= waveRange; dx++) {
        for (let dy = -waveRange; dy <= waveRange; dy++) {
          let checkX = sonicScanRayX + dx;
          let checkY = sonicScanRayY + dy;

          // Find the matching object within the current coordinates
          const match = gameObjects.find(
            (obj) => obj.x === checkX && obj.y === checkY
          );

          if (match) {
            console.log(match); // Display objects to user

            if (this.user.map.isEventHappening) {
              console.log("menu is active");
              const sonicMenu = document.querySelector(".SonicMenu");
              console.log("sonic menu from sonic", sonicMenu);
            } else {
              console.log("no menu");
              // Start a menu with data
              if (match.interactiveOptions !== 0) {
                const event = new OverworldEvent({
                  map: this.user.map,
                  event: {
                    type: "showSonicMenu",
                    options: match.interactiveOptions,
                  },
                });
                await event.init();
              }
            }
            return true; // Return true if a match is found
          }
        }
      }
      return false; // Return false if no match is found
    };

    // Iterate through 200 steps asynchronously
    for (let j = 0; j < 200; j++) {
      // Process the current step asynchronously
      const foundMatch = await processStep(
        sonicScanRayX,
        sonicScanRayY,
        waveRange
      );
      if (foundMatch) return;

      // Increment sonic ray position based on player direction
      sonicScanRayX += delta.x;
      sonicScanRayY += delta.y;

      // Increase the wave range every two steps
      if (j > 1) {
        waveRange += 1;
      }

      // Pause briefly to allow other tasks to execute, reducing freezing
      await new Promise((resolve) => setTimeout(resolve, 0)); // Use 0ms to yield to the event loop
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
    //this.sonicButton = document.getElementById("sonicButton"); / using id and class name cause weird thinsg
    this.sonicButton = document.querySelector(".sonicButton");
    this.sonicShootButton = document.querySelector(".sonicShootButton");

    // Only set listener if it is the doctor as only doctor can use sonic (for now)
    if (this.user.isDoctor) {
      if (document.body.classList.contains("mobile-device")) {
        // Initialse the sonic buttons
        this.updateSonicButtons();

        if (this.actionButton) {
          this.actionButton.addEventListener("click", () => {
            this.handleSonicEquipMobile();
          });
        }
      } else {
        // set key listeners for dektop
        this.screwdriverEquipListener = new KeyPressListener("KeyQ", () => {
          this.handleSonicEquipDesktop();
        });

        // Hide buttons if desktop
        this.actionButton.style.display = "none";
        this.sonicButton.style.display = "none";
        this.sonicShootButton.style.display = "none";
      }
    }
  }

  updateSonicButtons() {
    if (this.isSonicEquipped) {
      this.actionButton.innerText = "Unequip Sonic";
      this.sonicButton.style.display = "block";
      this.sonicShootButton.style.display = "block";
    } else {
      this.actionButton.innerText = "Equip Sonic";
      this.sonicButton.style.display = "none";
      this.sonicShootButton.style.display = "none";
    }
  }

  handleSonicEquipMobile() {
    // Update sprite src to one with sonic in hand
    if (this.isSonicEquipped) {
      this.user.sprite.image.src = utils.setDynamicPath(
        "/images/characters-doctor-who/doctor-11.png"
      );
      this.isSonicEquipped = false;
      this.updateSonicButtons();
      this.user.map.overworld.hud.toggleSonicVisibility();
    } else {
      this.user.sprite.image.src = utils.setDynamicPath(
        "/images/characters-doctor-who/doctor-11-screwdriver.png"
      );
      this.isSonicEquipped = true;
      this.updateSonicButtons();
      this.bindSonicListeners();
      this.user.map.overworld.hud.toggleSonicVisibility();
    }
  }

  handleSonicEquipDesktop() {
    //console.log("Sonic equiq event, HUD: ", this.user.map.overworld.hud);
    // Update sprite src to one with sonic in hand
    if (this.isSonicEquipped) {
      this.user.sprite.image.src = utils.setDynamicPath(
        "/images/characters-doctor-who/doctor-11.png"
      );
      this.isSonicEquipped = false;
      this.unbindSonicListeners();
      if (this.user.map) {
        this.user.map.overworld.hud.toggleSonicVisibility();
      }
    } else {
      this.user.sprite.image.src = utils.setDynamicPath(
        "/images/characters-doctor-who/doctor-11-screwdriver.png"
      );
      this.isSonicEquipped = true;
      this.bindSonicListeners();
      if (this.user.map) {
        this.user.map.overworld.hud.toggleSonicVisibility();
      }
    }
  }
}
