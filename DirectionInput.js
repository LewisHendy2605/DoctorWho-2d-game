class DirectionInput {
  constructor() {
    this.heldDirections = [];

    this.map = {
      ArrowUp: "up",
      KeyW: "up",
      ArrowDown: "down",
      KeyS: "down",
      ArrowLeft: "left",
      KeyD: "left",
      ArrowRight: "right",
      KeyA: "right",
    };
  }

  get direction() {
    return this.heldDirections[0];
  }

  init() {
    document.addEventListener("keydown", (e) => {
      const dir = this.map[e.code];
      if (dir && this.heldDirections.indexOf(dir) === -1) {
        this.heldDirections.unshift(dir);
      }
    });

    document.addEventListener("keyup", (e) => {
      const dir = this.map[e.code];
      const index = this.heldDirections.indexOf(dir);
      if (index > -1) {
        this.heldDirections.splice(index, 1);
      }
    });

    // Add event listeners for buttons
    document
      .querySelector(".up-control button")
      .addEventListener("mousedown", () => this.handleButtonDown("up"));
    document
      .querySelector(".up-control button")
      .addEventListener("mouseup", () => this.handleButtonUp("up"));
    document
      .querySelector(".down-control button")
      .addEventListener("mousedown", () => this.handleButtonDown("down"));
    document
      .querySelector(".down-control button")
      .addEventListener("mouseup", () => this.handleButtonUp("down"));
    document
      .querySelector(".left-control button")
      .addEventListener("mousedown", () => this.handleButtonDown("left"));
    document
      .querySelector(".left-control button")
      .addEventListener("mouseup", () => this.handleButtonUp("left"));
    document
      .querySelector(".right-control button")
      .addEventListener("mousedown", () => this.handleButtonDown("right"));
    document
      .querySelector(".right-control button")
      .addEventListener("mouseup", () => this.handleButtonUp("right"));
  }

  handleButtonDown(direction) {
    if (this.heldDirections.indexOf(direction) === -1) {
      this.heldDirections.unshift(direction);
    }
  }

  handleButtonUp(direction) {
    const index = this.heldDirections.indexOf(direction);
    if (index > -1) {
      this.heldDirections.splice(index, 1);
    }
  }
}
