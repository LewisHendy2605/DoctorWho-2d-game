class Tardis extends GameObject {
  constructor(config) {
    super(config, "tardis");
    this.movingProgressRemaining = 0;
    this.isStanding = false;

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.speedMultiplier = 3;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };
  }

  mount(map) {
    //console.log("Tardis mounted");
    this.isMounted = true;

    // Add walls for the larger Tardis sprite
    map.addWall(this.x + utils.withGrid(1), this.y);
    map.addWall(this.x + utils.withGrid(2), this.y);
    map.addWall(this.x + utils.withGrid(3), this.y);
    map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(1));
    map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(2));
    map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(3));
    map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(4));
    map.addWall(this.x + utils.withGrid(2), this.y + utils.withGrid(1));
    map.addWall(this.x + utils.withGrid(2), this.y + utils.withGrid(2));
    map.addWall(this.x + utils.withGrid(2), this.y + utils.withGrid(3));
    map.addWall(this.x + utils.withGrid(3), this.y + utils.withGrid(1));
    map.addWall(this.x + utils.withGrid(3), this.y + utils.withGrid(2));
    map.addWall(this.x + utils.withGrid(3), this.y + utils.withGrid(3));
    map.addWall(this.x + utils.withGrid(3), this.y + utils.withGrid(4));

    // If we have a behavior, kick off after a short delay
    setTimeout(() => {
      this.deBehaviorEvent(map);
    }, 10);
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
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation(this.direction);
      return;
    }
    this.sprite.setAnimation(this.direction);
  }
}
