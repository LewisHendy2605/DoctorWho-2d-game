class OverWorldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.interavtives = config.interavtives || {};
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

    // Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach((object) => object.doBehavior());
  }

  async startInteractive(events) {
    //Start a loop of async events, await each one
    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
      await eventHandler.init();
    }
    // Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach((object) => {
      if (object) {
        object.doBehavior();
      }
    });
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find((object) => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });
    if (!this.isCutScenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutScenePlaying && match) {
      this.startCutscene(match[0].events);
    }
  }

  checkForFootstepInteractive() {
    const hero = this.gameObjects["hero"];
    const match = this.interavtives[`${hero.x},${hero.y}`];
    if (!this.isCutScenePlaying && match) {
      this.startInteractive(match[0].events);
    }
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
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hello Buddy", faceHero: "npcA" },
              { type: "textMessage", text: "Who tf are you .." },
              { who: "hero", type: "walk", direction: "up" },
            ],
          },
        ],
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc2.png",

        //behaviorLoop: [
        //  { type: "walk", direction: "left" },
        //  { type: "stand", direction: "up", time: 800 },
        //  { type: "walk", direction: "up" },
        //  { type: "walk", direction: "right" },
        //  { type: "walk", direction: "down" },
        //],
      }),
    },
    walls: {
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 4)]: [
        {
          events: [
            { who: "npcB", type: "walk", direction: "left" },
            { who: "npcB", type: "stand", direction: "up", time: 500 },
            { type: "textMessage", text: "OI GET OUT, you twit !!" },
            { who: "npcB", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "left" },
          ],
        },
      ],
      [utils.asGridCoord(5, 10)]: [
        {
          events: [{ type: "changeMap", map: "Kitchen" }],
        },
      ],
    },
  },
  Kitchen: {
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Hey, you made it",
                faceHero: ["npcB"],
              },
            ],
          },
        ],
      }),
    },
  },
  Tardis: {
    lowerSrc: "/images/tardis/Tardis-map-v12.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(45),
        y: utils.withGrid(50),
        src: "/images/characters-doctor-who/doctor-11.png",
      }),
      npcA: new Person({
        x: utils.withGrid(48),
        y: utils.withGrid(53),
        src: "/images/characters/people/npc1.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Hey, you made it",
                faceHero: ["npcA"],
              },
            ],
          },
        ],
      }),
      console: new Console({
        x: utils.withGrid(47.5),
        y: utils.withGrid(48),
        src: "/images/tardis/tardis-console.png",
        isConsole: true,
        behaviorLoop: [
          //{ type: "circleLeverDown" }
        ],
      }),
    },
    cutsceneSpaces: {
      // Exit
      [utils.asGridCoord(35, 50)]: [
        {
          events: [{ type: "changeMap", map: "Outside_tardis" }],
        },
      ],
      [utils.asGridCoord(35, 49)]: [
        {
          events: [{ type: "changeMap", map: "Outside_tardis" }],
        },
      ],
    },
    interavtives: {
      // Console
      [utils.asGridCoord(47, 50)]: [
        {
          events: [
            { type: "textMessage", text: "Press Enter to Takeoff" },
            { type: "playAudio", audioSrc: "/audio/tardis_takeoff_2014.mp3" },
            { who: "console", type: "takeOffOne" },
            { who: "console", type: "takeOffTwo" },
            { who: "hero", type: "walk", direction: "up" },
            { who: "hero", type: "walk", direction: "up" },
            { who: "hero", type: "stand", direction: "right", time: 600 },
            { who: "console", type: "takeOffThree" },
            { who: "console", type: "takeOffFour" },
            { who: "hero", type: "walk", direction: "up" },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "stand", direction: "down", time: 700 },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "stand", direction: "left", time: 300 },
            { who: "console", type: "takeOffFive" },
            { who: "hero", type: "stand", direction: "left", time: 200 },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "stand", direction: "left", time: 700 },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "left" },
            { who: "hero", type: "walk", direction: "left" },
            { who: "hero", type: "walk", direction: "left" },
            { who: "hero", type: "walk", direction: "left" },
            { who: "hero", type: "walk", direction: "left" },
            { who: "hero", type: "walk", direction: "up" },
            { who: "hero", type: "walk", direction: "up" },
            { who: "hero", type: "stand", direction: "right", time: 700 },
            { who: "console", type: "consoleStart" },

            // { who: "hero", type: "walk", direction: "down" },
            // { who: "hero", type: "stand", direction: "left", time: 700 },
            // { who: "console", type: "takeOffFive" },
            // { who: "hero", type: "walk", direction: "down" },
            // { who: "hero", type: "walk", direction: "down" },
            // { who: "hero", type: "walk", direction: "down" },
            //{ who: "hero", type: "walk", direction: "left" },
            //{ who: "hero", type: "walk", direction: "left" },
            //{ who: "hero", type: "walk", direction: "left" },
            //{ who: "hero", type: "stand", direction: "up", time: 700 },
          ],
        },
      ],
    },
    walls: {
      // Console
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

      //// RAILS

      // Top rail
      [utils.asGridCoord(48, 41)]: true,
      [utils.asGridCoord(49, 41)]: true,
      [utils.asGridCoord(50, 41)]: true,
      [utils.asGridCoord(51, 41)]: true,
      [utils.asGridCoord(52, 41)]: true,
      [utils.asGridCoord(53, 41)]: true,

      // Top right corner
      [utils.asGridCoord(54, 42)]: true,
      [utils.asGridCoord(55, 43)]: true,
      [utils.asGridCoord(56, 44)]: true,
      [utils.asGridCoord(57, 45)]: true,
      [utils.asGridCoord(58, 46)]: true,

      // Right rail
      [utils.asGridCoord(59, 47)]: true,
      [utils.asGridCoord(59, 48)]: true,
      [utils.asGridCoord(59, 49)]: true,
      [utils.asGridCoord(59, 50)]: true,
      [utils.asGridCoord(59, 51)]: true,

      // Bottom right rail
      [utils.asGridCoord(57, 55)]: true,
      [utils.asGridCoord(55, 56)]: true,
      [utils.asGridCoord(54, 57)]: true,

      // Bottom rail
      [utils.asGridCoord(53, 58)]: true,
      [utils.asGridCoord(52, 58)]: true,
      [utils.asGridCoord(51, 58)]: true,
      [utils.asGridCoord(50, 58)]: true,
      [utils.asGridCoord(49, 58)]: true,

      // Bottom left rail

      // top left rail

      // entry right rail

      // entry left rail
    },
  },
  Outside_tardis: {
    lowerSrc: "/images/maps/tardis-outside-grass-street-map-edit.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(48),
        y: utils.withGrid(40),
        src: "/images/characters-doctor-who/doctor-11.png",
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Hey, you made it",
                faceHero: ["npcB"],
              },
            ],
          },
        ],
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(48, 39)]: [
        {
          events: [{ type: "changeMap", map: "Tardis" }],
        },
      ],
      [utils.asGridCoord(31, 49)]: [
        {
          events: [{ type: "changeMap", map: "Outside_tardis" }],
        },
      ],
    },
  },
};
