class Door extends GameObject {
  constructor(config) {
    super(config, "door64");
    this.movingProgressRemaining = 0;
    this.isStanding = false;
    this.isOpen = false;

    this.isPlayerControlled = false;

    this.speedMultiplier = 1;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };

    this.data = [
      { type: "Type", data: "Door" },
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
        label: "Scan Results from " + this.type,
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
          // open or close door
          this.toggleOpenOrCloseDoor();

          // Close menu scrren
          this.map.sonicMenu.end();
        },
      },
    ];
  }

  toggleOpenOrCloseDoor() {
    // Toggle the door state
    this.isOpen = !this.isOpen;

    // Update the animation based on the new state
    if (this.isOpen) {
      this.sprite.setAnimation("open");
      // remove walls to walkthrough
      this.map.removeWall(this.x + utils.withGrid(1), this.y);
      this.map.removeWall(
        this.x + utils.withGrid(1),
        this.y + utils.withGrid(1)
      );
      this.map.removeWall(
        this.x + utils.withGrid(1),
        this.y + utils.withGrid(2)
      );
    } else {
      this.sprite.setAnimation("closed");
      // re add waalls
      this.map.addWall(this.x + utils.withGrid(1), this.y);
      this.map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(1));
      this.map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(2));
    }

    // Update the "Status" field in the data dynamically
    this.data = this.data.map((item) => {
      if (item.type === "Status") {
        return {
          ...item,
          data: this.isOpen ? "Open" : "Closed",
        };
      }
      return item;
    });
  }

  mount(map) {
    super.mount(map);

    // left hoizonal side
    map.addWall(this.x, this.y + utils.withGrid(1));
    map.addWall(this.x, this.y + utils.withGrid(2));

    // middle horizontal
    map.addWall(this.x + utils.withGrid(1), this.y);
    map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(1));
    map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(2));

    // right horizontal side
    map.addWall(this.x + utils.withGrid(2), this.y);
    map.addWall(this.x + utils.withGrid(2), this.y + utils.withGrid(1));
    map.addWall(this.x + utils.withGrid(2), this.y + utils.withGrid(2));
  }

  update(state) {
    //console.log(this);
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
        console.log(state.arrow);
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
