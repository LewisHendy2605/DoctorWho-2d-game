class Console extends GameObject {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isStanding = false;

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };
  }

  update(state) {
    // TODO: add screen animation
    // called each game tick
  }

  startBehavior(state, behavior) {
    // TODO - animation ?
  }

  updatePosition() {
    // Dont need i think
  }

  updateSprite() {
    // TODO
  }
}
