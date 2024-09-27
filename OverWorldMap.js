class OverWorldMap {
  constructor(config) {
    this.id = config.id || null;
    this.overworld = null;

    // Deep copy the gameObjects, cutsceneSpaces, and other objects
    // Recreate game objects, do not deep copy them directly
    //console.log("copying gameObjects:", config.gameObjects);
    this.gameObjects = this.recreateGameObjects(config.gameObjects);
    //console.log("copied gameObjects:", this.gameObjects, config.gameObjects);
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.interavtives = config.interavtives || {};
    this.mapEvents = config.mapEvents || {};
    this.sonicspaces = config.sonicspaces || {};
    this.walls = config.walls || {};

    // Set images
    this.lowerImage = new Image();
    this.lowerImage.src = utils.setDynamicPath(config.lowerSrc);

    this.upperImage = new Image();
    this.upperImage.src = utils.setDynamicPath(config.upperSrc);

    this.stopObjects = false;
    this.isCutScenePlaying = false;
    this.isEventHappening = false;
    this.isPaused = false;
    this.outsideMap = config.outsideMap || null;
    this.tardisLanded = config.tardisLanded || null;

    this.sonicMenu = null;
  }

  // Method to recreate gameObjects with their class constructors
  // Needed to create copy to cahnge the objects valus
  recreateGameObjects(gameObjects) {
    const newGameObjects = {};

    Object.keys(gameObjects).forEach((key) => {
      const obj = gameObjects[key];

      // Use the constructor to recreate the object based on its type
      if (obj instanceof Doctor) {
        newGameObjects[key] = new Doctor({
          ...obj, // Spread first to keep original properties
          src: obj.imageSrc || obj.src, // Set src to obj.imageSrc or fallback to original src
        });
      } else if (obj instanceof Tardis) {
        newGameObjects[key] = new Tardis({
          ...obj,
          src: obj.imageSrc || obj.src,
        });
      } else if (obj instanceof Console) {
        newGameObjects[key] = new Console({
          ...obj,
          src: obj.imageSrc || obj.src,
        });
      } else if (obj instanceof Darlek) {
        newGameObjects[key] = new Darlek({
          ...obj,
          src: obj.imageSrc || obj.src,
        });
      } else if (obj instanceof Door) {
        newGameObjects[key] = new Door({
          ...obj,
          src: obj.imageSrc || obj.src,
        });
      } else if (obj instanceof Box) {
        newGameObjects[key] = new Box({
          ...obj,
          src: obj.imageSrc || obj.src,
        });
      } else {
        // Handle other object types or throw a detailed error
        throw new Error(`Unknown object type for key: ${key}`);
      }
    });

    return newGameObjects;
  }

  // Helper function to perform deep copy
  // Custom deep copy to handle circular references
  deepCopy(obj, seen = new WeakMap()) {
    if (obj === null || typeof obj !== "object") {
      return obj; // Return non-object or null values as is
    }

    if (seen.has(obj)) {
      return seen.get(obj); // Return already seen objects to prevent circular reference
    }

    const copy = Array.isArray(obj) ? [] : {};
    seen.set(obj, copy); // Mark this object as seen

    Object.keys(obj).forEach((key) => {
      copy[key] = this.deepCopy(obj[key], seen);
    });

    return copy;
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
    // let objectInWay = false;
    // for (let obj of this.gameObjects) {
    //   if (obj.x === x && obj.y === y) {
    //     objectInWay = true;
    //   }
    // }
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach((key) => {
      let object = this.gameObjects[key];
      object.id = key;

      console.log("mounting called: ", object);
      // TODO: determine if this object should actually mount
      object.mount(this);
    });
  }

  demountObjects() {
    Object.keys(this.gameObjects).forEach((key) => {
      let object = this.gameObjects[key];
      object.id = key;
      // Complete lifecycle of Objects
      object.deMount();
    });
  }

  async startCutscene(events) {
    //console.log("starting cutscene");
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
    this.isEventHappening = true;
    //Start a loop of async events, await each one
    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
      await eventHandler.init();
    }
    this.isEventHappening = false;
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

    this.startCutscene(match[0].events);

    // if (this.id !== "Tardis") {
    //   console.log(match[0].events);
    //   this.startCutscene(match[0].events);
    //   return;
    // }

    // const isLeaveTardisEvent = match[0].events[0].type === "leaveTardis";

    // if (this.tardisLanded && isLeaveTardisEvent) {
    //   this.startCutscene(match[0].events);
    // }
  }

  checkForFootstepInteractive() {
    const hero = this.gameObjects["hero"];
    const match = this.interavtives[`${hero.x},${hero.y}`];
    if (!this.isCutScenePlaying && match) {
      this.startInteractive(match[0].events);
    }
  }

  checkForFootstepEnterTardis() {
    const hero = this.gameObjects["hero"];
    const tardis = this.gameObjects["tardis"];

    if (tardis) {
      // offest the coords to spawn at the door
      const { x, y } = utils.tardisCoordsOffset(tardis.x, tardis.y);
      // add checks for either side of door
      if (hero.x === x && hero.y === y) {
        // const event = new OverworldEvent({
        //   map: this,
        //   event: { type: "changeMap" },
        // });

        // event.init();

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

  async checkForStartEvent() {
    const match = this.mapEvents[`startEvents`];

    if (this.isCutScenePlaying || !match) {
      return;
    }

    console.log("starting map event", match);
    await this.startCutscene(match);
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
    lowerSrc: "/images/tardis/Tardis-map-v7.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    outsideMap: "Outside_tardis",
    tardisLanded: true,
    gameObjects: {
      hero: new Doctor({
        isPlayerControlled: true,
        x: utils.withGrid(45),
        y: utils.withGrid(50),
        src: "/images/characters-doctor-who/doctor-11.png",
      }),
      console: new Console({
        x: utils.withGrid(47.5),
        y: utils.withGrid(48),
        src: "/images/tardis/console-v3.png",
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
          events: [{ type: "tardisLandOrFly" }],
        },
      ],
      [utils.asGridCoord(47, 51)]: [
        {
          events: [{ type: "tardisLandOrFly" }],
        },
      ],

      // Console screen
      [utils.asGridCoord(52, 50)]: [
        {
          events: [
            { type: "textMessage", text: "Press Enter to use console" },
            { type: "useConsoleScreen" },
          ],
        },
      ],
      [utils.asGridCoord(52, 51)]: [
        {
          events: [
            { type: "textMessage", text: "Press Enter to use console" },
            { type: "useConsoleScreen" },
          ],
        },
      ],
      [utils.asGridCoord(52, 52)]: [
        {
          events: [
            { type: "textMessage", text: "Press Enter to use console" },
            { type: "useConsoleScreen" },
          ],
        },
      ],
      [utils.asGridCoord(51, 52)]: [
        {
          events: [
            { type: "textMessage", text: "Press Enter to use console" },
            { type: "useConsoleScreen" },
          ],
        },
      ],
    },
    sonicspaces: {
      // Console sonic controls
      [utils.asGridCoord(47, 50)]: [
        {
          events: [{ type: "tardisConsoleSonicEvent" }],
        },
      ],
      [utils.asGridCoord(47, 51)]: [
        {
          events: [{ type: "tardisLandOrFly" }],
        },
      ],
    },
    walls: {
      // Console
      [utils.asGridCoord(48, 48)]: true,
      [utils.asGridCoord(48, 49)]: true,
      [utils.asGridCoord(48, 50)]: true,
      [utils.asGridCoord(47, 49)]: true,
      [utils.asGridCoord(47, 50)]: true,
      [utils.asGridCoord(52, 50)]: true,
      [utils.asGridCoord(52, 49)]: true,
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
      // [utils.asGridCoord(49, 41)]: true,
      // [utils.asGridCoord(50, 41)]: true,
      // [utils.asGridCoord(51, 41)]: true,
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
      hero: new Doctor({
        isPlayerControlled: true,
        x: utils.withGrid(48),
        y: utils.withGrid(40),
        src: "/images/characters-doctor-who/doctor-11.png",
      }),
      tardis: new Tardis({
        isPlayerControlled: false,
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
      hero: new Doctor({
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
  DarlekBaseInterior: {
    id: "DarlekBaseInterior",
    lowerSrc: "/images/maps/DarlekBase-v1.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    tardisDoorX: utils.withGrid(48),
    tardisDoorY: utils.withGrid(30),
    gameObjects: {
      hero: new Doctor({
        isPlayerControlled: true,
        x: utils.withGrid(48),
        y: utils.withGrid(40),
        src: "/images/characters-doctor-who/doctor-11.png",
      }),
      tardis: new Tardis({
        isPlayerControlled: false,
        x: utils.withGrid(44),
        y: utils.withGrid(4),
        src: "/images/tardis/tardis-light-blue.png",
        //src: "/images/characters-doctor-who/doctor-11.png",
      }),
      darlek: new Darlek({
        isPlayerControlled: false,
        x: utils.withGrid(30),
        y: utils.withGrid(18),
        src: "/images/characters-doctor-who/darlek.png",
        behaviorLoop: [{ type: "followHeroAndShoot" }],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Exterminate",
                faceHero: "darlek",
              },
            ],
          },
        ],
      }),
      // darlek2: new Darlek({
      //   isPlayerControlled: false,
      //   x: utils.withGrid(44),
      //   y: utils.withGrid(19),
      //   src: "/images/characters-doctor-who/darlek.png",
      //   behaviorLoop: [{ type: "followHero" }],
      //   talking: [
      //     {
      //       events: [
      //         {
      //           type: "textMessage",
      //           text: "Exterminate",
      //           faceHero: "darlek",
      //         },
      //       ],
      //     },
      //   ],
      // }),
      // darlek3: new Darlek({
      //   isPlayerControlled: false,
      //   x: utils.withGrid(49),
      //   y: utils.withGrid(16),
      //   src: "/images/characters-doctor-who/darlek.png",
      //   behaviorLoop: [{ type: "followHero" }],
      //   talking: [
      //     {
      //       events: [
      //         {
      //           type: "textMessage",
      //           text: "Exterminate",
      //           faceHero: "darlek",
      //         },
      //       ],
      //     },
      //   ],
      // }),
      // npcA: new Person({
      //   x: utils.withGrid(40),
      //   y: utils.withGrid(18),
      //   src: "/images/characters/people/npc1.png",
      //   behaviorLoop: [
      //     { type: "walk", direction: "left" },
      //     { type: "walk", direction: "left" },
      //     { type: "walk", direction: "left" },
      //     { type: "stand", direction: "down", time: 300 },
      //     { type: "walk", direction: "right" },
      //     { type: "walk", direction: "right" },
      //     { type: "walk", direction: "right" },
      //     { type: "stand", direction: "down", time: 300 },
      //   ],
      //   talking: [
      //     {
      //       required: ["TALKED_TO_ERIO"],
      //       events: [
      //         {
      //           type: "textMessage",
      //           text: "Erio is a bit of a dick right?",
      //           faceHero: "npcA",
      //         },
      //       ],
      //     },
      //     {
      //       events: [
      //         {
      //           type: "textMessage",
      //           text: "I wanna scrap",
      //           faceHero: "npcA",
      //         },
      //         { type: "battle", enemyId: "beth" },
      //         { type: "addStoryFlag", flag: "DEFEATED_BETH" },
      //         {
      //           type: "textMessage",
      //           text: "Fair play, you won",
      //           faceHero: "npcA",
      //         },
      //         //{ type: "textMessage", text: "Who tf are you .." },
      //         //{ who: "hero", type: "walk", direction: "up" },
      //       ],
      //     },
      //   ],
      // }),

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
  DemoLevel: {
    id: "DemoLevel",
    lowerSrc: "/images/maps/DarlekBase-v1.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    tardisDoorX: utils.withGrid(48),
    tardisDoorY: utils.withGrid(30),
    gameObjects: {
      hero: new Doctor({
        isPlayerControlled: true,
        //x: utils.withGrid(44),
        //y: utils.withGrid(10),
        x: utils.withGrid(86),
        y: utils.withGrid(78),
        src: "/images/characters-doctor-who/doctor-11.png",
      }),
      tardis: new Tardis({
        isPlayerControlled: false,
        x: utils.withGrid(44),
        y: utils.withGrid(4),
        src: "/images/tardis/tardis-light-blue.png",
        //src: "/images/characters-doctor-who/doctor-11.png",
      }),
      door: new Door({
        isPlayerControlled: false,
        x: utils.withGrid(83),
        //y: utils.withGrid(70.2),
        y: utils.withGrid(70),
        src: "/images/objects/darlek-door.png",
        //src: "/images/characters-doctor-who/doctor-11.png",
      }),
      box: new Box({
        isPlayerControlled: false,
        x: utils.withGrid(95),
        y: utils.withGrid(74),
        src: "/images/objects/box-tech.png",
        //src: "/images/characters-doctor-who/doctor-11.png",
      }),
      darlek: new Darlek({
        isPlayerControlled: false,
        x: utils.withGrid(85),
        y: utils.withGrid(60),
        src: "/images/characters-doctor-who/darlek.png",
        // behaviorLoop: [
        //   { type: "followHero" },
        //   {
        //     type: "speak",
        //     text: "Exterminate !",
        //   },
        //   { type: "shoot" },
        // ],
        behaviorLoop: [
          {
            type: "followHeroAndShoot",
            required: "HERO_LEFT_ROOM",
            id: "darlek",
          },
        ],
      }),
      // darlekOne: new Darlek({
      //   isPlayerControlled: false,
      //   x: utils.withGrid(68),
      //   y: utils.withGrid(87),
      //   src: "/images/characters-doctor-who/darlek.png",
      //   behaviorLoop: [
      //     { type: "followHero" },
      //     //{ type: "wait", length: 900 },
      //     // { type: "speak", text: "Exterminate !" },
      //     // { type: "shoot" },
      //   ],
      // }),
    },
    mapEvents: {
      startEvents: [
        {
          type: "textMessage",
          text: "You are in a darlek base !, Locate the tardis and esacpe.",
          fontSize: "0.7rem",
          height: "6svh",
        },
        // {
        //   type: "textMessage",
        //   text: "Use Q to equip, E to scan and space to fire a burst",
        //   fontSize: 0.5,
        // },
      ],
    },
    walls: {
      // Back wall for starting room
      [utils.asGridCoord(89, 72)]: true,
      [utils.asGridCoord(80, 72)]: true,
      [utils.asGridCoord(81, 72)]: true,
      [utils.asGridCoord(82, 72)]: true,

      [utils.asGridCoord(86, 72)]: true,

      [utils.asGridCoord(88, 72)]: true,
      [utils.asGridCoord(89, 72)]: true,
      [utils.asGridCoord(90, 72)]: true,
      [utils.asGridCoord(91, 72)]: true,
      [utils.asGridCoord(92, 72)]: true,
      [utils.asGridCoord(93, 72)]: true,
      [utils.asGridCoord(94, 72)]: true,
      [utils.asGridCoord(95, 72)]: true,
      [utils.asGridCoord(96, 72)]: true,
      [utils.asGridCoord(97, 72)]: true,
    },
    cutsceneSpaces: {},
  },
};
