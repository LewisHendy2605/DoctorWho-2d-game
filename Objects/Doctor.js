class Doctor extends GameObject {
  constructor(config) {
    super(config, "doctor");
    this.movingProgressRemaining = 0;
    this.isStanding = false;

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.speedMultiplier = 1.5;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };

    this.isDoctor = this.sprite.image.src.includes("doctor-11.png");
    this.isSonicEquipped = false;
    this.sonicActive = false;
    this.sonicAudio = null;
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
      if (this.map) {
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
            whoId: this.id,
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
          this.sonicAudio = new Audio(utils.setDynamicPath("/audio/sonic.mp3"));
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
    let sonicRayX = this.x;
    let sonicRayY = this.y;

    // Search 300 pixels infront of player
    for (let j = 0; j < 300; j++) {
      //console.log(`Sonic X: ${sonicRayX}, Sonic Y:`, sonicRayY);

      // Check for interactive usins g sonic x,y
      const match = this.map.sonicspaces[`${sonicRayX},${sonicRayY}`];

      if (match && !this.map.isCutScenePlaying) {
        console.log("Found match");
        console.log(match[0].events);
        this.map.startInteractive(match[0].events);
        return;
      }

      // Increment sonic ray x or y otherwise absed on player direction
      if (this.direction === "down") {
        sonicRayY += 1;
      } else if (this.direction == "right") {
        sonicRayX += 1;
      } else if (this.direction == "up") {
        sonicRayY -= 1;
      } else if (this.direction == "left") {
        sonicRayX -= 1;
      }
    }
  }

  bindScrewdriverEquiperListener() {
    // Only set listener if it is the doctor as only doctor can use sonic (for now)
    if (this.isDoctor) {
      if (document.body.classList.contains("mobile-device")) {
        // equip for mobile
        this.actionButton = document.getElementById("actionButton");
        this.sonicButton = document.getElementById("sonicButton");

        this.updateSonicButtons();

        if (actionButton) {
          actionButton.addEventListener("click", () => {
            // Update sprite src to one with sonic in hand
            if (this.isSonicEquipped) {
              this.sprite.image.src = utils.setDynamicPath(
                "/images/characters-doctor-who/doctor-11.png"
              );
              this.isSonicEquipped = false;
              this.updateSonicButtons();
            } else {
              this.sprite.image.src = utils.setDynamicPath(
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
      this.sprite.image.src = utils.setDynamicPath(
        "/images/characters-doctor-who/doctor-11.png"
      );
      this.isSonicEquipped = false;
      this.unbindSonicListeners();
    } else {
      this.sprite.image.src = utils.setDynamicPath(
        "/images/characters-doctor-who/doctor-11-screwdriver.png"
      );
      this.isSonicEquipped = true;
      this.bindSonicListeners();
    }
  }

  update(state) {
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      // More cases for starting to walk will come here
      //
      //

      // Case: Were keyboard ready and have an arrow presed
      if (
        !state.map.isCutScenePlaying &&
        this.isPlayerControlled &&
        state.arrow
      ) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow,
        });
      }
      this.updateSprite(state);
    }
  }

  startBehavior(state, behavior) {
    // Setting character direction to whatever behavior has
    this.direction = behavior.direction;

    if (behavior.type === "walk") {
      // Stop here if space is not free
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
        behavior.retry &&
          setTimeout(() => {
            this.startBehavior(state, behavior);
          }, 10);
        return;
      }

      // Ready to walk
      state.map.moveWall(this.x, this.y, this.direction);
      utils.emitEvent("PersonStartWalk", {
        whoId: this.id,
      });
      this.movingProgressRemaining = 16;
      this.updateSprite(state);
    }

    if (behavior.type === "stand") {
      this.isStanding = true;
      setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id,
        });
        this.isStanding = false;
      }, behavior.time);
    }
  }

  updatePosition() {
    const [property, change] = this.directionUpdate[this.direction];
    this[property] += change;
    this.movingProgressRemaining -= 1;

    if (this.movingProgressRemaining === 0) {
      // We finished the walk
      utils.emitEvent("PersonWalkComplete", {
        whoId: this.id,
      });
    }
  }

  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      return;
    }
    if (this.sonicActive) {
      this.sprite.setAnimation("sonic-" + this.direction);
    } else {
      this.sprite.setAnimation("idle-" + this.direction);
    }
  }
}
