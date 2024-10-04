class Npc extends GameObject {
  constructor(config) {
    super(config, "npc");
    this.movingProgressRemaining = 0;
    this.isStanding = false;

    this.key = config.key;

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.speedMultiplier = 0.5;

    this.isSpeechBoxActive = false;

    this.behaviorLoop = [
      { type: "walkSteps", direction: "right", steps: 40 },
      // idle movement
      { type: "stand", direction: "right", time: 800 },
      { type: "stand", direction: "down", time: 3000 },
      { type: "stand", direction: "left", time: 3000 },
      { type: "stand", direction: "down", time: 3000 },
      { type: "stand", direction: "right", time: 800 },
      { type: "stand", direction: "down", time: 3000 },
      { type: "stand", direction: "left", time: 3000 },
      { type: "stand", direction: "down", time: 3000 },
      { type: "stand", direction: "right", time: 800 },
      { type: "stand", direction: "down", time: 3000 },
      { type: "stand", direction: "left", time: 3000 },
      { type: "stand", direction: "down", time: 3000 },
      //{ type: "walkSteps", direction: "right", steps: 20 },
      //{ type: "stand", direction: "right", time: 1500 },
      { type: "walkSteps", direction: "left", steps: 20 },
      //{ type: "stand", direction: "left", time: 1100 },
      //   { type: "walk", direction: "down" },
      //   { type: "walk", direction: "left" },
      //   { type: "walk", direction: "up" },
    ];

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };
  }

  stopBehavior() {}

  restartBehavior() {}

  update(state) {
    // handle any interactivity
    const hero = this.map.gameObjects["hero"];

    if (
      hero.x >= this.x - 16 &&
      hero.x <= this.x + 16 &&
      hero.y >= this.y - 16 &&
      hero.y <= this.y + 16
    ) {
      if (!this.isSpeechBoxActive) {
        this.isSpeechBoxActive = true;
        //this.stopBehavior();
        this.isPaused = true;
        this.doInteractivity();
      }
    } else {
      if (this.isSpeechBoxActive) {
        this.isSpeechBoxActive = false;
        this.finishSpeechBoxResult();
        //this.restartBehavior();
        this.isPaused = false;
      }
    }

    if (this.movingProgressRemaining > 0) {
      // handle walking
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

  async doInteractivity() {
    // response options
    this.options = [
      { text: "Go away" },
      { text: "Hello, whats this place like" },
      { text: "Anything interesting around here" },
    ];

    const speechEvent = new OverworldEvent({
      map: this.map,
      event: {
        type: "speechBox",
        who: this.key,
        text: "Hey there stranger.",
        responseOptions: this.options,
      },
    });
    this.finishSpeechBoxResult = await speechEvent.init();
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
      // Adjust progress remaining based on speed multiplier
      //this.movingProgressRemaining = 16 / this.speedMultiplier; // Lower the steps per frame if speedMultiplier > 1
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
    //console.log("update position called");
    const [property, change] = this.directionUpdate[this.direction];
    // this[property] += change;
    // Adjust the speed of movement by applying speedMultiplier
    this[property] += change * this.speedMultiplier;
    this.movingProgressRemaining -= 1 * this.speedMultiplier;

    if (this.movingProgressRemaining === 0) {
      // We finished the walk
      //console.log("emiting: PersonWalkComplete ");
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
