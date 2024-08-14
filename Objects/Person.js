class Person extends GameObject {
  constructor(config) {
    super(config, "person");
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

    // console.log("idDoctor: ", this.isDoctor);
    // console.log(this.sprite.image.src);
    // console.log(
    //   utils.setDynamicPath("/images/characters-doctor-who/doctor-11.png")
    // );
    // console.log(
    //   this.sprite.image.src.includes(
    //     "/images/characters-doctor-who/doctor-11.png"
    //   )
    // );

    this.bindScrewdriverEquiperListener();
  }

  bindMouseClickListener() {
    // Using arrow function instead of directly passing method so i can use "this" keyword
    document.addEventListener("click", (event) => this.handleMouseClick(event));
  }

  unbindMouseClickListener() {
    document.removeEventListener("click", (event) =>
      this.handleMouseClick(event)
    );
  }

  handleMouseClick(event) {
    if (this.map) {
      const hero = this.map.gameObjects.hero;

      const canvas = document.getElementById("gameCanvas");
      const rect = canvas.getBoundingClientRect();

      // Step 1: Get mouse coordinates relative to the canvas
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Step 2: Calculate scaling factor
      const scaleFactor = 3; // The scaling factor applied to the canvas

      // Adjust for scaling to get the true canvas coordinates
      const unscaledMouseX = mouseX / scaleFactor;
      const unscaledMouseY = mouseY / scaleFactor;

      // Step 3: Get hero position in unscaled canvas coordinates
      // The hero's position in the canvas needs to be adjusted based on scaling
      const heroCanvasX = canvas.width / 2;
      const heroCanvasY = canvas.height / 2;

      // Step 4: Calculate relative mouse position compared to hero
      const relativeX = unscaledMouseX - heroCanvasX;
      const relativeY = unscaledMouseY - heroCanvasY;

      // Step 5: Adjust for any drawing offsets
      const heroDrawOffsetX = 8; // Example offset
      const heroDrawOffsetY = 18; // Example offset

      const mapX = hero.x + relativeX + heroDrawOffsetX;
      const mapY = hero.y + relativeY + heroDrawOffsetY;

      // Step 6: Convert to grid coordinates (16x16 pixels per grid cell)
      const gridSize = 16;
      const gridX = Math.floor(mapX / gridSize);
      const gridY = Math.floor(mapY / gridSize);

      // console.log("Mouse Coordinates (Canvas):", mouseX, mouseY);
      // console.log(
      //   "Unscaled Mouse Coordinates:",
      //   unscaledMouseX,
      //   unscaledMouseY
      // );
      // console.log("Relative to Hero Coordinates:", relativeX, relativeY);
      // console.log("Map Coordinates:", mapX, mapY);
      console.log("Grid Coordinates:", gridX, gridY);
      console.log("Doctor Coordinates (Map):", this.x / 16, this.y / 16);
    }
  }

  mapToCanvas(mapX, mapY, cameraX, cameraY, canvasWidth, canvasHeight) {
    // Convert map coordinates to canvas coordinates
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;
    return {
      canvasX: canvasCenterX + (mapX - cameraX),
      canvasY: canvasCenterY + (mapY - cameraY),
    };
  }

  canvasToMap(canvasX, canvasY, cameraX, cameraY, canvasWidth, canvasHeight) {
    // Convert canvas coordinates to map coordinates
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;
    return {
      mapX: cameraX + (canvasX - canvasCenterX),
      mapY: cameraY + (canvasY - canvasCenterY),
    };
  }

  bindScrewdriverEquiperListener() {
    // Only set listener if it is the doctor as only doctor can use sonic (for now)
    if (this.isDoctor) {
      this.screwdriverListener = new KeyPressListener("KeyQ", () => {
        // Update sprite src to one with sonic in hand
        if (this.isSonicEquipped) {
          this.sprite.image.src = utils.setDynamicPath(
            "/images/characters-doctor-who/doctor-11.png"
          );
          this.isSonicEquipped = false;
          this.unbindMouseClickListener();
        } else {
          this.sprite.image.src = utils.setDynamicPath(
            "/images/characters-doctor-who/doctor-11-screwdriver.png"
          );
          this.isSonicEquipped = true;
          this.bindMouseClickListener();
        }
      });
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
    this.sprite.setAnimation("idle-" + this.direction);
  }
}
