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
    // Add event listeners for buttons (mouse and touch)
    // Define a helper function to bind touch and mouse events
    const bindControl = (selector, direction) => {
      const element = document.querySelector(selector);
      if (element) {
        element.addEventListener("mousedown", () =>
          this.handleButtonDown(direction)
        );
        element.addEventListener("mouseup", () =>
          this.handleButtonUp(direction)
        );
        element.addEventListener("touchstart", () =>
          this.handleButtonDown(direction)
        );
        element.addEventListener("touchend", () =>
          this.handleButtonUp(direction)
        );
      }
    };

    // Bind controls for all directions
    bindControl(".up-control button", "up");
    bindControl(".down-control button", "down");
    bindControl(".left-control button", "left");
    bindControl(".right-control button", "right");
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
