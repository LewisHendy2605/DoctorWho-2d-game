class OverWorldMap {
  constructor(config) {
    this.id = config.id || null;
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
    this.isPaused = false;
    this.outsideMap = config.outsideMap || null;
    this.tardisLanded = config.tardisLanded || null;
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
      const result = await eventHandler.init();
      if (result === "LOST_BATTLE") {
        break;
      }
    }

    this.isCutScenePlaying = false;

    // Reset NPCs to do their idle behavior
    if (this.gameObjects.length) {
      Object.values(this.gameObjects).forEach((object) => {
        if (object) {
          object.doBehavior();
        }
      });
    }
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
      const relevantScenario = match.talking.find((scenario) => {
        return (scenario.required || []).every((sf) => {
          return playerState.storyFlags[sf];
        });
      });

      relevantScenario && this.startCutscene(relevantScenario.events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];

    if (this.isCutScenePlaying || !match) {
      return;
    }

    if (this.id !== "Tardis") {
      console.log(match[0].events);
      this.startCutscene(match[0].events);
      return;
    }

    const isLeaveTardisEvent = match[0].events[0].type === "leaveTardis";

    if (this.tardisLanded && isLeaveTardisEvent) {
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

  // Need to implement a way to check if hero stemsp on tardis
  checkForFootstepEnterTardis() {
    const hero = this.gameObjects["hero"];
    const tardis = this.gameObjects["tardis"];

    if (tardis) {
      // offest the coords to spawn at the door
      const { x, y } = utils.tardisCoordsOffset(tardis.x, tardis.y);
      // add checks for either side of door
      if (hero.x === x && hero.y === y) {
        const event = [
          {
            type: "changeMap",
            map: "Tardis",
            x: utils.withGrid(36),
            y: utils.withGrid(50),
            direction: "right",
          },
        ];
        this.startCutscene(event);
      }
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
    id: "DemoRoom",
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
            required: ["TALKED_TO_ERIO"],
            events: [
              {
                type: "textMessage",
                text: "Erio is a bit of a dick right?",
                faceHero: "npcA",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "I wanna scrap",
                faceHero: "npcA",
              },
              { type: "battle", enemyId: "beth" },
              { type: "addStoryFlag", flag: "DEFEATED_BETH" },
              {
                type: "textMessage",
                text: "Fair play, you won",
                faceHero: "npcA",
              },
              //{ type: "textMessage", text: "Who tf are you .." },
              //{ who: "hero", type: "walk", direction: "up" },
            ],
          },
        ],
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Fight me", faceHero: "npcB" },
              { type: "addStoryFlag", flag: "TALKED_TO_ERIO" },
              //{ type: "battle", enemyId: "erio" },
              //{ type: "textMessage", text: "Who tf are you .." },
              //{ who: "hero", type: "walk", direction: "up" },
            ],
          },
        ],

        //behaviorLoop: [
        //  { type: "walk", direction: "left" },
        //  { type: "stand", direction: "up", time: 800 },
        //  { type: "walk", direction: "up" },
        //  { type: "walk", direction: "right" },
        //  { type: "walk", direction: "down" },
        //],
      }),
      pizzaStone: new PizzaStone({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        storyFlag: "USED_PIZZA_STONE",
        pizzas: ["v001", "f001"],
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
          events: [
            {
              type: "changeMap",
              map: "Kitchen",
              x: utils.withGrid(2),
              y: utils.withGrid(2),
              direction: "down",
            },
          ],
        },
      ],
    },
  },
  Kitchen: {
    id: "Kitchen",
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
    cutsceneSpaces: {
      [utils.asGridCoord(5, 10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(29),
              y: utils.withGrid(9),
              direction: "down",
            },
          ],
        },
      ],
    },
  },
  Tardis: {
    id: "Tardis",
    lowerSrc: "/images/tardis/Tardis-map-v13.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    outsideMap: "Outside_tardis",
    tardisLanded: true,
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(45),
        y: utils.withGrid(50),
        src: "/images/characters-doctor-who/doctor-11.png",
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
      [utils.asGridCoord(35, 48)]: [
        {
          events: [
            {
              type: "leaveTardis",
              x: utils.withGrid(47),
              y: utils.withGrid(40),
              direction: "down",
            },
          ],
        },
      ],
      [utils.asGridCoord(35, 49)]: [
        {
          events: [
            {
              type: "leaveTardis",
              x: utils.withGrid(47),
              y: utils.withGrid(40),
              direction: "down",
            },
          ],
        },
      ],
      [utils.asGridCoord(35, 50)]: [
        {
          events: [
            {
              type: "leaveTardis",
              x: utils.withGrid(48),
              y: utils.withGrid(40),
              direction: "down",
            },
          ],
        },
      ],
    },
    interavtives: {
      // Console taek off
      [utils.asGridCoord(47, 50)]: [
        {
          events: [
            { type: "tardisLandOrFly" },
            // { type: "textMessage", text: "Press Enter to Takeoff" },
            // { type: "playAudio", audioSrc: "/audio/tardis_takeoff_2014.mp3" },
            // { who: "console", type: "takeOffOne" },
            // { who: "console", type: "takeOffTwo" },
            // { who: "console", type: "takeOffThree" },
            // { who: "hero", type: "stand", direction: "right", time: 1000 },
            // { type: "tardisMaterialseChange" },

            //  ------------------
            // { who: "console", type: "takeOffFour" }
            // { who: "hero", type: "walk", direction: "up" },
            // { who: "hero", type: "walk", direction: "up" },
            // { who: "hero", type: "stand", direction: "right", time: 600 },
            // { who: "console", type: "takeOffThree" },
            // { who: "console", type: "takeOffFour" },
            // { who: "hero", type: "walk", direction: "up" },
            // { who: "hero", type: "walk", direction: "right" },
            // { who: "hero", type: "walk", direction: "right" },
            // { who: "hero", type: "stand", direction: "down", time: 700 },
            // { who: "hero", type: "walk", direction: "right" },
            // { who: "hero", type: "walk", direction: "right" },
            // { who: "hero", type: "walk", direction: "right" },
            // { who: "hero", type: "walk", direction: "down" },
            // { who: "hero", type: "stand", direction: "left", time: 300 },
            // { who: "console", type: "takeOffFive" },
            // { who: "hero", type: "stand", direction: "left", time: 200 },
            // { who: "hero", type: "walk", direction: "down" },
            // { who: "hero", type: "walk", direction: "down" },
            // { who: "hero", type: "walk", direction: "down" },
            // { who: "hero", type: "stand", direction: "left", time: 700 },
            // { who: "hero", type: "walk", direction: "down" },
            // { who: "hero", type: "walk", direction: "left" },
            // { who: "hero", type: "walk", direction: "left" },
            // { who: "hero", type: "walk", direction: "left" },
            // { who: "hero", type: "walk", direction: "left" },
            // { who: "hero", type: "walk", direction: "left" },
            // { who: "hero", type: "walk", direction: "up" },
            // { who: "hero", type: "walk", direction: "up" },
            // { who: "hero", type: "stand", direction: "right", time: 700 },
            //{ who: "console", type: "consoleStart" },
          ],
        },
      ],

      // Console screen
      [utils.asGridCoord(52, 51)]: [
        {
          events: [
            { type: "textMessage", text: "Press Enter to use console" },
            { type: "useConsoleScreen" },
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
      [utils.asGridCoord(47, 41)]: true,
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
      [utils.asGridCoord(58, 52)]: true,
      [utils.asGridCoord(57, 53)]: true,
      [utils.asGridCoord(56, 54)]: true,
      [utils.asGridCoord(55, 55)]: true,
      [utils.asGridCoord(54, 56)]: true,
      [utils.asGridCoord(53, 57)]: true,
      [utils.asGridCoord(52, 58)]: true,
      // Bottom rail
      [utils.asGridCoord(51, 58)]: true,
      [utils.asGridCoord(50, 58)]: true,
      [utils.asGridCoord(49, 58)]: true,
      [utils.asGridCoord(48, 58)]: true,
      // Bottom left rail
      [utils.asGridCoord(46, 57)]: true,
      [utils.asGridCoord(45, 56)]: true,
      [utils.asGridCoord(44, 55)]: true,
      [utils.asGridCoord(43, 54)]: true,
      [utils.asGridCoord(42, 53)]: true,
      [utils.asGridCoord(41, 52)]: true,
      [utils.asGridCoord(40, 51)]: true,

      // top left rail
      [utils.asGridCoord(46, 42)]: true,
      [utils.asGridCoord(45, 43)]: true,
      [utils.asGridCoord(44, 44)]: true,
      [utils.asGridCoord(43, 45)]: true,
      [utils.asGridCoord(42, 46)]: true,
      [utils.asGridCoord(41, 47)]: true,
      [utils.asGridCoord(40, 47)]: true,

      // entry right rail
      [utils.asGridCoord(40, 47)]: true,
      [utils.asGridCoord(39, 47)]: true,
      [utils.asGridCoord(38, 47)]: true,
      [utils.asGridCoord(37, 47)]: true,
      [utils.asGridCoord(36, 47)]: true,
      [utils.asGridCoord(35, 47)]: true,

      // entry left rail
      [utils.asGridCoord(40, 51)]: true,
      [utils.asGridCoord(39, 51)]: true,
      [utils.asGridCoord(38, 51)]: true,
      [utils.asGridCoord(37, 51)]: true,
      [utils.asGridCoord(36, 51)]: true,
      [utils.asGridCoord(35, 51)]: true,

      // Behind door
      // Exit
      [utils.asGridCoord(34, 48)]: true,
      [utils.asGridCoord(34, 49)]: true,
      [utils.asGridCoord(34, 50)]: true,
    },
  },
  Outside_tardis: {
    id: "Street",
    lowerSrc: "/images/maps/tardis-outside-grass-street-map-edit.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    tardisDoorX: utils.withGrid(48),
    tardisDoorY: utils.withGrid(40),
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(48),
        y: utils.withGrid(40),
        src: "/images/characters-doctor-who/doctor-11.png",
      }),
      tardis: new Tardis({
        x: utils.withGrid(45),
        y: utils.withGrid(25),
        src: "/images/tardis/tardis-light-blue.png",
        //src: "/images/characters-doctor-who/doctor-11.png",
      }),

      // npcB: new Person({
      //   x: utils.withGrid(10),
      //   y: utils.withGrid(8),
      //   src: "/images/characters/people/npc3.png",
      //   talking: [
      //     {
      //       events: [
      //         {
      //           type: "textMessage",
      //           text: "Hey, you made it",
      //           faceHero: ["npcB"],
      //         },
      //       ],
      //     },
      //   ],
      // }),
    },
    cutsceneSpaces: {
      // [utils.asGridCoord(48, 39)]: [
      //   {
      //     events: [
      //       {
      //         type: "changeMap",
      //         map: "Tardis",
      //         x: utils.withGrid(36),
      //         y: utils.withGrid(50),
      //         direction: "right",
      //       },
      //     ],
      //   },
      // ],
      // [utils.asGridCoord(47, 39)]: [
      //   {
      //     events: [
      //       {
      //         type: "changeMap",
      //         map: "Tardis",
      //         x: utils.withGrid(36),
      //         y: utils.withGrid(49),
      //         direction: "right",
      //       },
      //     ],
      //   },
      // ],
    },
  },
  Mars: {
    id: "Mars",
    lowerSrc: "/images/maps/Mars.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    tardisDoorX: utils.withGrid(79),
    tardisDoorY: utils.withGrid(80),
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(79),
        y: utils.withGrid(80),
        src: "/images/characters-doctor-who/doctor-11.png",
      }),
      tardis: new Tardis({
        x: utils.withGrid(80),
        y: utils.withGrid(80),
        src: "/images/tardis/tardis-light-blue.png",
      }),
    },
  },
  Street: {
    id: "Street",
    lowerSrc: "/images/maps/StreetLower.png",
    upperSrc: "/images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(30),
        y: utils.withGrid(10),
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(29, 9)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Kitchen",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up",
            },
          ],
        },
      ],
    },
  },
};
