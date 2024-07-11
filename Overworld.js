class OverWorld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
  }

  startGameLoop() {
    const step = () => {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Establish the camera person
      const cameraPerson = this.map.gameObjects.hero;

      // Update all objects

      Object.values(this.map.gameObjects).forEach((object) => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        });
      });

      // Draw Lower Layer
      this.map.drawLowerImage(this.ctx, cameraPerson);

      //Draw Game Objects

      Object.values(this.map.gameObjects)
        .sort((a, b) => {
          return a.y - b.y;
        })
        .forEach((object) => {
          object.sprite.draw(this.ctx, cameraPerson);
        });

      // Draw Upper Layer
      this.map.drawUpperImage(this.ctx, cameraPerson);

      requestAnimationFrame(() => {
        step();
      });
    };
    step();
  }

  init() {
    this.map = new OverWorldMap(window.OverworldMaps.Tardis);
    //console.log(this.map.walls);
    this.map.mountObjects();

    this.directionInput = new DirectionInput();
    this.directionInput.init();
    //this.directionInput.direction;

    this.startGameLoop();

    /*
    this.map.startCutscene([
      { who: "hero", type: "walk", direction: "down" },
      { who: "hero", type: "walk", direction: "down" },
      { who: "npcA", type: "walk", direction: "left" },
      { who: "npcA", type: "walk", direction: "left" },
      { who: "npcA", type: "stand", direction: "up", time: 800 },
    ]);
    */

    console.log("Hello from the Overworld", this);
  }
}
