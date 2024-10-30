class Ship extends GameObject {
  constructor(config) {
    super(config, "ship");
    this.movingProgressRemaining = 0;
    this.isStanding = false;

    //this.currentLocation = this.map.id;
    this.isOpen = false;

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.speedMultiplier = 3;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };

    this.data = [
      { type: "Type", data: "Tardis" },
      { type: "Age", data: "99999999" },
      { type: "Origin", data: "Galifray" },
      { type: "Description", data: "Tardis MK1, " },
      { type: "Magnatism Field Strength", data: "987892 H" },
      { type: "Electromagnatism Field Strength", data: "756 H" },
      { type: "Radiation", data: "5000J Bqv" },
      { type: "Temporal Field", data: "Very Active" },
      { type: "Temporal Radiation", data: "Low" },
    ];

    this.interactiveOptions = [
      {
        label: "Scan Results from " + this.type,
        class: "choose-dest",
        handler: () => {
          // // Close menu scrren
          // this.map.sonicMenu.end();

          console.log(this);

          this.map.sonicMenu.showData(this.data);

          // Show data about object

          // Initiate tardis event
          // const event = new OverworldEvent({
          //   map: this.map,
          //   event: { type: "tardisLandOrFly" },
          // });
          // event.init();
        },
      },
      {
        label: "Land / Take Off",
        class: "choose-dest",
        handler: () => {
          // Close menu scrren
          this.map.sonicMenu.end();

          // Initiate tardis event
          // const event = new OverworldEvent({
          //   map: this.map,
          //   event: { type: "tardisLandOrFly" },
          // });
          // event.init();
        },
      },
    ];
  }

  mount(map) {
    //console.log("Tardis mounted");
    this.isMounted = true;

    // Add walls for the larger Tardis sprite
    map.addWall(this.x + utils.withGrid(1), this.y);

    this.map = map;

    // If we have a behavior, kick off after a short delay
    setTimeout(() => {
      this.deBehaviorEvent(map);
    }, 10);
  }

  update(state) {
    // --- check if user has waled into entrance
    const gameObject = state.map.gameObjects["hero"];

    // Check if player's position has changed
    if (gameObject.x !== this.prevX || gameObject.y !== this.prevY) {
      this.prevX = gameObject.x;
      this.prevY = gameObject.y;

      // Check if player is near the door
      if (this.isHeroInFrontOfDoor(gameObject) && !this.isOpen) {
        this.toggleOpenOrCloseDoor(); // Open door if it's closed and electrical systems are active
      }
    }

    // hide player spriet in doorway
    // if (this.isHeroInDoorway(gameObject) && this.isOpen) {
    //   gameObject.sprite.hide = true;
    // } else if (!this.isHeroInDoorway(gameObject) && this.isOpen) {
    //   gameObject.sprite.hide = false;
    // }

    // Check if player has passed through the door and should close it
    if (
      this.isOpen &&
      //!this.isHeroInDoorway(gameObject) &&
      !this.isHeroInFrontOfDoor(gameObject)
    ) {
      this.toggleOpenOrCloseDoor(); // Close door after the player passes through
    }

    // change map if player enters
    if (this.heroEntersDoor(gameObject)) {
      console.log("hero entered doorway, chnage map");
      const event = new OverworldEvent({
        map: this.map,
        event: {
          type: "changeMap",
          map: "SpaceShip_Entrance",
          x: utils.withGrid(44),
          y: utils.withGrid(38),
          direction: gameObject.direction,
        },
      });
      event.init();
    }
  }

  heroEntersDoor(gameObject) {
    return (
      gameObject.x === this.x + utils.withGrid(6) &&
      gameObject.y === this.y + utils.withGrid(4)
    );
  }

  // Helper function to check if hero is standing in front of the door
  isHeroInFrontOfDoor(gameObject) {
    return (
      (gameObject.x === this.x + utils.withGrid(6) &&
        gameObject.y <= this.y + utils.withGrid(8) &&
        gameObject.y >= this.y + utils.withGrid(5)) ||
      gameObject.y === this.y - utils.withGrid(1)
    );
  }

  async toggleOpenOrCloseDoor() {
    // Toggle the door state
    this.isOpen = !this.isOpen;

    // Update the animation based on the new state
    if (this.isOpen) {
      this.sprite.setAnimation("doorHalfOpen");
      await utils.wait(200);
      this.sprite.setAnimation("doorOpen");
      //this.updateWalls(false); // Remove walls to allow walk-through
    } else {
      this.sprite.setAnimation("doorHalfOpen");
      await utils.wait(200);
      this.sprite.setAnimation("start");
      //this.updateWalls(true); // Add walls to block the door
    }

    // Update the "Status" field in the data dynamically
    // for (let i = 0; i < this.data.length; i++) {
    //   if (this.data[i].type === "Status") {
    //     this.data[i].data = this.isOpen ? "Open" : "Closed";
    //     break; // No need to continue once the status is updated
    //   }
    // }
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

      // need to also move other wallls

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
    this[property] += change * this.speedMultiplier;
    this.movingProgressRemaining -= this.speedMultiplier;

    if (this.movingProgressRemaining === 0) {
      // We finished the walk
      utils.emitEvent("PersonWalkComplete", {
        whoId: this.id,
      });
    }
  }

  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation(this.direction);
      return;
    }
    this.sprite.setAnimation(this.direction);
  }
}
