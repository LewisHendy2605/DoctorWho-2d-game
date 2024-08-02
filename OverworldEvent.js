class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
    //this.audioManager = new AudioManager();
  }

  stand(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior(
      { map: this.map },
      {
        type: "stand",
        direction: this.event.direction,
        time: this.event.time,
      }
    );

    // Set up handler to comlete when the correct person is done walking, then resolve event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    };

    document.addEventListener("PersonStandComplete", completeHandler);
  }

  walk(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior(
      { map: this.map },
      {
        type: "walk",
        direction: this.event.direction,
        retry: true,
      }
    );

    // Set up handler to comlete when the correct person is done walking, then resolve event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkComplete", completeHandler);
        resolve();
      }
    };

    document.addEventListener("PersonWalkComplete", completeHandler);
  }

  textMessage(resolve) {
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(
        this.map.gameObjects["hero"].direction
      );
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: (interrupted) => {
        if (!interrupted) {
          resolve();
        }
      },
    });
    message.init(document.querySelector(".game-container"));
  }

  playAudio(resolve) {
    if (this.event.audioSrc) {
      this.audioManager = new AudioManager();
      // Play audio effect without blocking other actions
      this.audioManager.playBackground(
        utils.setDynamicPath(this.event.audioSrc)
      );
    }
    // Resolve immediately if no further action is needed
    resolve();
  }

  changeMap(resolve) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap(window.OverworldMaps[this.event.map], {
        x: this.event.x,
        y: this.event.y,
        direction: this.event.direction,
      });
      resolve();

      sceneTransition.fadeOut();
    });
  }

  battle(resolve) {
    const battle = new Battle({
      enemy: Enemies[this.event.enemyId],
      onComplete: (didWin) => {
        resolve(didWin ? "WON_BATTLE" : "LOST_BATTLE");
      },
    });
    battle.init(document.querySelector(".game-container"));
  }

  pause(resolve) {
    this.map.isPaused = true;
    const menu = new PauseMenu({
      progress: this.map.overworld.progress,
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      },
    });
    menu.init(document.querySelector(".game-container"));
  }

  addStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = true;
    resolve();
  }

  craftingMenu(resolve) {
    const menu = new CrafingMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      },
    });
    menu.init(document.querySelector(".game-container"));
  }

  leaveTardis(resolve) {
    this.event.map = window.tardisState.destination;

    //console.log(window.OverworldMaps[this.event.map]);
    const gameObjects = window.OverworldMaps[this.event.map].gameObjects;
    //console.log(gameObjects);

    Object.values(gameObjects).forEach((go) => {
      if (go.type === "tardis") {
        const { x, y } = utils.tardisCoordsOffset(go.x, go.y);
        this.event.x = x;
        this.event.y = y;
      }
    });

    // Set hero spawn poin t to tardis doors
    //this.event.x =

    this.changeMap(resolve);
  }

  tardisLandOrFly(resolve) {
    const sequence = async () => {
      if (this.map.tardisLanded) {
        // Show text message for interactive
        this.event.text = "Press Enter to Takeoff";
        await new Promise((res) => this.textMessage(res));

        // Play audio
        this.event.audioSrc = "/audio/tardis_takeoff_2014.mp3";
        await new Promise((res) => this.playAudio(res));

        // Run takeoff animations in sequence
        this.event.who = "console"; // Set appropriate who ID
        await new Promise((res) => this.takeOffOne(res));
        await new Promise((res) => this.takeOffTwo(res));
        await new Promise((res) => this.takeOffThree(res));
        await new Promise((res) => this.takeOffFour(res));
        await new Promise((res) => this.takeOffFive(res));

        // Update tardis landed flag
        this.map.tardisLanded = false;

        // Mesage to inform user
        this.event.text = "Tardis has enterd the vortex";
        await new Promise((res) => this.textMessage(res));
      } else {
        // Show text message
        this.event.text = "Press Enter to Land";
        await new Promise((res) => this.textMessage(res));

        // Play audio
        this.event.audioSrc = "/audio/tardis_takeoff_2014.mp3";
        await new Promise((res) => this.playAudio(res));

        // Run takeoff animations in sequence
        this.event.who = "console"; // Set appropriate who ID
        await new Promise((res) => this.consoleStart(res));

        // Update tardis landed flag
        this.map.tardisLanded = true;

        const destName = window.OverworldMaps[this.map.outsideMap].id;

        // Mesage to inform user
        this.event.text = "Tardis has landed at " + destName;
        await new Promise((res) => this.textMessage(res));
      }

      resolve();
    };

    sequence();
  }

  tardisMaterialseChange(resolve) {
    if (!this.map.tardisLanded) {
      this.map.tardisLanded = true;
    } else if (this.map.tardisLanded) {
      this.map.tardisLanded = false;
    }
    resolve();
  }

  changeTardisDest(resolve) {
    //const cutsceneSpaces = this.map.cutsceneSpaces;

    // get the x, y for the tardis door on the new map
    // const doorX = window.OverworldMaps[this.event.map].tardisDoorX;
    // const doorY = window.OverworldMaps[this.event.map].tardisDoorY;

    // // Update the cutscene spces new x, y when map changes
    // Object.keys(cutsceneSpaces).forEach((key) => {
    //   const events = cutsceneSpaces[key];
    //   //console.log(`Key: ${key}`);
    //   events.forEach((event) => {
    //     event.events[0].x = doorX;
    //     event.events[0].y = doorY;
    //   });
    // });

    // Change what map is ouside tardis
    //this.map.outsideMap = this.event.map;
    window.tardisState.destination = this.event.map;

    resolve();
  }

  FlyTarids(resolve) {
    //const cutsceneSpaces = this.map.cutsceneSpaces;

    // Get the x, y for the tardis door on the new map
    //const doorX = window.OverworldMaps[this.event.map].tardisDoorX;
    //const doorY = window.OverworldMaps[this.event.map].tardisDoorY;

    // Change what map is ouside tardis
    //this.map.outsideMap = this.event.map;

    //this.map.overworld.startMap(window.OverworldMaps[this.event.map]);
    this.map.overworld.startMapAsFlyTardis(
      window.OverworldMaps[this.event.map]
    );

    resolve();
  }

  useConsoleScreen(resolve) {
    const consoleScreen = new ConsoleScreen({
      map: this.map,
      onComplete: () => {
        consoleScreen.end();
        resolve();
      },
    });
    consoleScreen.init(document.querySelector(".game-container"));
  }

  useChangeDestScreen(resolve) {
    const consoleScreen = new ChangeDestScreen({
      map: this.map,
      onComplete: () => {
        consoleScreen.end();
        resolve();
      },
    });
    consoleScreen.init(document.querySelector(".game-container"));
  }

  useFlyTardisScreen(resolve) {
    const consoleScreen = new FlyTardisScreen({
      map: this.map,
      onComplete: () => {
        consoleScreen.end();
        resolve();
      },
    });
    consoleScreen.init(document.querySelector(".game-container"));
  }

  useEarthDestScreen(resolve) {
    const consoleScreen = new EarthDestScreen({
      map: this.map,
      onComplete: () => {
        consoleScreen.end();
        resolve();
      },
    });
    consoleScreen.init(document.querySelector(".game-container"));
  }

  useMarsDestScreen(resolve) {
    const consoleScreen = new MarsDestScreen({
      map: this.map,
      onComplete: () => {
        consoleScreen.end();
        resolve();
      },
    });
    consoleScreen.init(document.querySelector(".game-container"));
  }

  circleLeverDown(resolve) {
    const who = this.map.gameObjects[this.event.who];
    setTimeout(function () {
      who.startBehavior(
        { map: this.map },
        {
          type: "circleLeverDown",
        }
      );
      resolve();
    }, 200);
  }

  consoleStart(resolve) {
    const who = this.map.gameObjects[this.event.who];
    setTimeout(function () {
      who.startBehavior(
        { map: this.map },
        {
          type: "start",
        }
      );
      resolve();
    }, 200);
  }

  takeOffOne(resolve) {
    const who = this.map.gameObjects[this.event.who];
    setTimeout(function () {
      who.startBehavior(
        { map: this.map },
        {
          type: "take-off-one",
        }
      );
      resolve();
    }, 300);
  }

  takeOffTwo(resolve) {
    const who = this.map.gameObjects[this.event.who];
    setTimeout(function () {
      who.startBehavior(
        { map: this.map },
        {
          type: "take-off-two",
        }
      );
      resolve();
    }, 900);
  }

  takeOffThree(resolve) {
    const who = this.map.gameObjects[this.event.who];
    setTimeout(function () {
      who.startBehavior(
        { map: this.map },
        {
          type: "take-off-three",
        }
      );
      resolve();
    }, 900);
  }

  takeOffFour(resolve) {
    const who = this.map.gameObjects[this.event.who];
    setTimeout(function () {
      who.startBehavior(
        { map: this.map },
        {
          type: "take-off-four",
        }
      );
      resolve();
    }, 900);
  }

  takeOffFive(resolve) {
    const who = this.map.gameObjects[this.event.who];
    setTimeout(function () {
      who.startBehavior(
        { map: this.map },
        {
          type: "take-off-five",
        }
      );
      resolve();
    }, 100);
  }

  init() {
    return new Promise((resolve) => {
      this[this.event.type](resolve);
    });
  }
}
