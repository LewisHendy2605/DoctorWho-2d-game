class TardisDoor extends GameObject {
  constructor(config) {
    super(config, "tardis-door");
    this.movingProgressRemaining = 0;
    this.isStanding = false;
    this.isOpen = false;
    this.isElectricalSystemsActive = true;

    this.isPlayerControlled = false;

    this.speedMultiplier = 1;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };

    this.data = [
      { type: "Type", data: "tardis Door" },
      { type: "Composition", data: "Darlekium, Zinc, Titanium, Copper, Gold" },
      { type: "Description", data: "Door inside darlek base" },
      { type: "Electrical Systems", data: "Active" },
      { type: "Status", data: this.isOpen ? "Open" : "Closed" },
      { type: "Lock Status", data: "Locked" },
      {
        type: "Perceptible to",
        data: "Sonic field pulse to override lock system",
      },
    ];

    this.interactiveOptions = [
      {
        label:
          "Scan Results from " +
          utils.capitalizeFirstLetter(utils.removeNumbersFromString(this.type)),
        class: "choose-dest",
        handler: () => {
          // // Close menu scrren
          // this.map.sonicMenu.end();

          //console.log(this);

          this.map.sonicMenu.showData(this.data);
        },
      },
      {
        label: "Open Door / Close Door ",
        class: "choose-dest",
        handler: () => {
          //   this.electricalSystemsActive = this.checkElectricalSystems();
          //   if (this.electricalSystemsActive) {
          //     // open or close door
          //     this.toggleOpenOrCloseDoor();
          //     // Close menu scrren
          //     this.map.sonicMenu.end();
          //   } else {
          //     // Close menu scrren
          //     this.map.sonicMenu.end();
          //     this.tellPlayerElectricalSystemsNotActive();
          //   }
        },
      },
      {
        label: "Disable Electrical Systems",
        class: "choose-dest",
        handler: () => {
          // Close menu scrren
          this.map.sonicMenu.end();
        },
      },
      {
        label: "Magnitise",
        class: "choose-dest",
        handler: () => {
          // Close menu scrren
          this.map.sonicMenu.end();
        },
      },
    ];

    // wait for mount to create wall panel
    //this.waitForMount();
  }

  waitForMount() {
    const intervalId = setInterval(() => {
      //console.log("creating interval");
      if (this.isMounted) {
        // Create wall screen next to door
        this.wallScreen = new WallScreen({
          isPlayerControlled: false,
          x: this.x + utils.withGrid(4),
          y: this.y + utils.withGrid(2),
          src: "/images/objects/wallscreen.png",
          //src: "/images/characters-doctor-who/doctor-11.png",
        });
        this.wallScreen.mount(this.map);
        // add wall screen to game objects to enter game loop update + to be demounted
        this.map.gameObjects["wallScreen"] = this.wallScreen;

        // set electrical systems bool
        this.electricalSystemsActive = this.checkElectricalSystems();

        clearInterval(intervalId); // Stop checking once mounted
        //console.log("interval destryoed");
      }
    }, 100); // Check every 100ms
  }

  deMount() {
    super.deMount();
  }

  async toggleOpenOrCloseDoor() {
    // Toggle the door state
    this.isOpen = !this.isOpen;

    // Update the animation based on the new state
    if (this.isOpen) {
      this.sprite.setAnimation("half-open");

      await utils.wait(100);
      this.sprite.setAnimation("open");
      //this.updateWalls(false); // Remove walls to allow walk-through
    } else {
      this.sprite.setAnimation("half-open");
      await utils.wait(100);
      this.sprite.setAnimation("closed");
      //this.updateWalls(true); // Add walls to block the door
    }

    // Update the "Status" field in the data dynamically
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].type === "Status") {
        this.data[i].data = this.isOpen ? "Open" : "Closed";
        break; // No need to continue once the status is updated
      }
    }
  }

  // Helper function to add or remove walls around the door
  updateWalls(addWalls) {
    const offsets = [0, 1, 2]; // The grid offsets to update
    offsets.forEach((offset) => {
      const x = this.x + utils.withGrid(1);
      const y = this.y + utils.withGrid(offset);
      if (addWalls) {
        this.map.addWall(x, y);
      } else {
        this.map.removeWall(x, y);
      }
    });
  }

  mount(map) {
    super.mount(map);

    // left hoizonal side
    // map.addWall(this.x, this.y + utils.withGrid(1));
    // map.addWall(this.x, this.y + utils.withGrid(2));

    // // middle horizontal
    // map.addWall(this.x + utils.withGrid(1), this.y);
    // map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(1));
    // map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(2));

    // // right horizontal side
    // map.addWall(this.x + utils.withGrid(2), this.y);
    // map.addWall(this.x + utils.withGrid(2), this.y + utils.withGrid(1));
    // map.addWall(this.x + utils.withGrid(2), this.y + utils.withGrid(2));
  }

  update(state) {
    const gameObject = state.map.gameObjects["hero"];

    // Check if player's position has changed
    if (gameObject.x !== this.prevX || gameObject.y !== this.prevY) {
      this.prevX = gameObject.x;
      this.prevY = gameObject.y;

      // Check if player is near the door
      if (this.isHeroInFrontOfDoor(gameObject) && !this.isOpen) {
        this.toggleOpenOrCloseDoor();
      }

      // hide player spriet in doorway
      // if (this.isHeroInDoorway(gameObject) && this.isOpen) {
      //   gameObject.sprite.hide = true;
      // } else if (!this.isHeroInDoorway(gameObject) && this.isOpen) {
      //   gameObject.sprite.hide = false;
      // }

      // Check if player has passed through the door and should close it
      if (this.isOpen && !this.isHeroInFrontOfDoor(gameObject)) {
        this.toggleOpenOrCloseDoor(); // Close door after the player passes through
      }
    }
  }

  // Helper function to check if hero is standing in front of the door
  isHeroInFrontOfDoor(gameObject) {
    // console.log(
    //   "checking if hero is infront of door: ",
    //   this.x,
    //   this.y,
    //   gameObject.x,
    //   gameObject.y
    // );
    return (
      (gameObject.y === this.y + utils.withGrid(4) ||
        gameObject.y === this.y + utils.withGrid(3)) &&
      gameObject.x <= this.x + utils.withGrid(3) &&
      gameObject.x >= this.x
    );
  }

  // Helper function to check if hero is in the doorway
  isHeroInDoorway(gameObject) {
    return (
      gameObject.y === this.y + utils.withGrid(1) &&
      gameObject.x >= this.x - utils.withGrid(1) &&
      gameObject.x <= this.x + utils.withGrid(2)
    );
  }

  tellPlayerElectricalSystemsNotActive() {
    if (this.wallScreen.hasAllElectricalComponents()) {
      const textEvent = new OverworldEvent({
        map: this.map,
        event: {
          type: "textMessage",
          text: "Electrical Systems not active",
        },
      });
      textEvent.init();
    } else {
      const textEvent = new OverworldEvent({
        map: this.map,
        event: {
          type: "textMessage",
          text: "Electrical Systems not active, wall panel is missing componenets",
          fontSize: "0.7rem",
        },
      });
      textEvent.init();
    }
  }

  checkElectricalSystems() {
    if (
      this.wallScreen.hasAllElectricalComponents() &&
      this.isElectricalSystemsActive
    ) {
      return true;
    } else {
      return false;
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
    //this.sprite.setAnimation("closed");
  }
}
