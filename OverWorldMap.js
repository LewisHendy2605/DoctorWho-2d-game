class OverWorldMap {
  constructor(config) {
    this.gameObjects = config.gameObjects;
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = utils.setDynamicPath(config.lowerSrc);

    this.upperImage = new Image();
    this.upperImage.src = utils.setDynamicPath(config.upperSrc);
    //console.log("Config src: ", this.dynamicPath(config.lowerSrc));

    this.isCutScenePlaying = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach((key) => {
      let object = this.gameObjects[key];
      object.id = key;

      // TODO: determine if this object should actually mount
      object.mount(this);
    });
  }

  async startCutscene(events) {
    this.isCutScenePlaying = true;

    //Start a loop of async events, await each one
    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
      await eventHandler.init();
    }

    this.isCutScenePlaying = false;
  }

  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }

  removeWall(x, y) {
    delete this.walls[`${x},${y}`];
  }

  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const { x, y } = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }
}

window.OverworldMaps = {
  DemoRoom: {
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "up", time: 800 },
          { type: "stand", direction: "right", time: 1200 },
          { type: "stand", direction: "up", time: 300 },
        ],
      }),
      npcB: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(7),
        src: "/images/characters/people/npc2.png",
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "stand", direction: "up", time: 800 },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
        ],
      }),
    },
    walls: {
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
    },
  },
  Kitchen: {
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: 3,
        y: 5,
      }),
      npcA: new GameObject({
        x: 9,
        y: 6,
        src: "/images/characters/people/npc2.png",
      }),
      npcB: new GameObject({
        x: 10,
        y: 8,
        src: "/images/characters/people/npc3.png",
      }),
    },
  },
  Tardis: {
    lowerSrc: "/images/maps/tardis-map-v4.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(46),
        y: utils.withGrid(50),
        src: "/images/characters-doctor-who/doctor-11.png",
      }),
      npc1: new Person({
        x: utils.withGrid(51),
        y: utils.withGrid(55),
        src: "/images/characters/people/npc1.png",
      }),
    },
    walls: {
      [utils.asGridCoord(48, 48)]: true,
      [utils.asGridCoord(48, 49)]: true,
      [utils.asGridCoord(48, 50)]: true,
      [utils.asGridCoord(48, 51)]: true,

      [utils.asGridCoord(49, 51)]: true,
      [utils.asGridCoord(50, 51)]: true,
      [utils.asGridCoord(51, 51)]: true,

      [utils.asGridCoord(51, 50)]: true,
      [utils.asGridCoord(51, 49)]: true,
      [utils.asGridCoord(51, 48)]: true,

      [utils.asGridCoord(50, 48)]: true,
      [utils.asGridCoord(49, 48)]: true,
    },
  },
};
