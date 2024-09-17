class Box extends GameObject {
  constructor(config) {
    super(config, "box");
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
      { type: "Type", data: "Storage Box" },
      { type: "Composition", data: "Darlekium, Titanium, Copper" },
      { type: "Description", data: "Metal Box used to store items" },
      { type: "Electrical Systems", data: "None" },
      { type: "Status", data: this.isOpen ? "Open" : "Closed" },
      { type: "Lock Status", data: "Unlocked" },
      {
        type: "Perceptible to",
        data: "Opening",
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
      //   {
      //     label: "Open Door / Close Door ",
      //     class: "choose-dest",
      //     handler: () => {
      //       // open or close door
      //       this.toggleOpenOrCloseDoor();

      //       // Close menu scrren
      //       this.map.sonicMenu.end();
      //     },
      //   },
    ];

    this.invatory = [new Titanium({ quantity: 19 })];
  }

  openBox() {
    console.log("calling open box");
    //await utils.wait(250);

    // Toggle the door state
    this.isOpen = true;

    // Update the animation based on the new state
    this.sprite.setAnimation("open");

    // Update the "Status" field in the data dynamically
    this.data = this.data.map((item) => {
      if (item.type === "Status") {
        return {
          ...item,
          data: "Open",
        };
      }
      return item;
    });

    //const map = this.map;
    // show box invatory
    this.boxInvatoryScreen = new InvatoryScreen({
      map: this.map,
      invatory: this.invatory,
    });
    this.boxInvatoryScreen.init(document.querySelector(".game-container"));
  }
  async closeBox() {
    if (this.boxInvatoryScreen) {
      this.boxInvatoryScreen.done();
    }

    // delay animation
    await utils.wait(400);

    // Toggle the door state
    this.isOpen = false;

    // Update the animation based on the new state
    this.sprite.setAnimation("closed");

    // Update the "Status" field in the data dynamically
    this.data = this.data.map((item) => {
      if (item.type === "Status") {
        return {
          ...item,
          data: "Closed",
        };
      }
      return item;
    });
  }
  toggleOpenOrCloseDoor() {
    // Toggle the door state
    this.isOpen = !this.isOpen;

    // wait before opeing
    //await utils.wait(200);

    // Update the animation based on the new state
    if (this.isOpen) {
      this.sprite.setAnimation("open");
    } else {
      this.sprite.setAnimation("closed");
      // re add waalls
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

    map.addWall(this.x + utils.withGrid(1), this.y);

    // left hoizonal side
    //map.addWall(this.x, this.y + utils.withGrid(1));
    // map.addWall(this.x, this.y + utils.withGrid(2));

    // // middle horizontal
    // map.addWall(this.x + utils.withGrid(1), this.y);
    // map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(1));
    // map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(2));

    // right horizontal side
    // map.addWall(this.x + utils.withGrid(2), this.y);
    // map.addWall(this.x + utils.withGrid(2), this.y + utils.withGrid(1));
    // map.addWall(this.x + utils.withGrid(2), this.y + utils.withGrid(2));
  }

  update(state) {
    //console.log("Box updated: ", state.map);
    const gameObject = state.map.gameObjects["hero"];
    //console.log(gameObject, this);
    if (!this.isOpen) {
      // if player is standing infront open box
      // add direction chek too (&& gameObject.direction === this.direction)
      if (gameObject.x === this.x + 0 && gameObject.y === this.y + 16) {
        console.log(
          "open box ",
          gameObject.x,
          gameObject.y,
          " this; ",
          this.x,
          this.y,
          this.isOpen
        );
        this.openBox();
      }
    } else {
      /// if is open then check if player is not infront, close if they arnt
      if (gameObject.x !== this.x + 0 || gameObject.y !== this.y + 16) {
        console.log(
          "close box ",
          gameObject.x,
          gameObject.y,
          " this; ",
          this.x,
          this.y,
          this.isOpen
        );
        this.closeBox();
      }
    }

    //console.log(this);
    // if (this.movingProgressRemaining > 0) {
    //   this.updatePosition();
    // } else {
    //   // More cases for starting to walk will come here
    //   //
    //   //
    //   // Case: Were keyboard ready and have an arrow presed
    //   if (
    //     !state.map.isCutScenePlaying &&
    //     this.isPlayerControlled &&
    //     state.arrow
    //   ) {
    //     console.log(state.arrow);
    //     this.startBehavior(state, {
    //       type: "walk",
    //       direction: state.arrow,
    //     });
    //   }
    //   this.updateSprite(state);
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
