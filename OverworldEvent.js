class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
    //this.audioManager = new AudioManager();
    this.options = [];
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

  async walkSteps(resolve) {
    for (let i = 0; i < this.event.steps; i++) {
      console.log(i);
      // Wait for each step to finish before proceeding to the next
      await new Promise((res) => this.walk(res));
      this.event.time = 100;
      await new Promise((res) => this.stand(res));
    }
    // Resolve after all steps have been completed
    //return Promise.resolve();
    resolve();
  }

  walkFoward(resolve) {
    console.log("person start walk called");
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior(
      { map: this.map },
      {
        type: "walk",
        direction: who.direction,
        retry: true,
      }
    );

    // Set up handler to comlete when the correct person is done walking, then resolve event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkComplete", completeHandler);
        console.log("person complete called");
        resolve();
      }
    };

    document.addEventListener("PersonWalkComplete", completeHandler);
  }

  async followHero(resolve) {
    try {
      // Face the hero first
      await new Promise((res) => this.faceHero(res));

      const who = this.map.gameObjects[this.event.who];

      // Define a maximum number of retries to prevent an infinite loop
      let maxRetries = 5;
      let retries = 0;

      // Retry walking if space is taken
      while (retries < maxRetries) {
        if (this.map.isSpaceTaken(who.x, who.y, who.direction)) {
          //console.log("Space is taken, retrying...");
          retries++;

          // Optional: Wait before retrying to give the game some time to process
          await new Promise((res) => setTimeout(res, 200)); // Wait for 500ms before retrying
        } else {
          // If space is not taken, walk forward
          await new Promise((res) => this.walkFoward(res));
          break; // Break out of the retry loop once the walk succeeds
        }
      }

      // If retries exceeded maxRetries, consider resolving or handling failure
      // if (retries >= maxRetries) {
      //   console.log("Max retries reached, could not move forward.");
      // }

      resolve(); // Resolve the main promise after everything is done
    } catch (err) {
      console.error("Error in followHero process:", err);
      resolve(); // Ensure resolve is still called in case of an error
    }
  }

  faceHero(resolve) {
    try {
      const obj = this.map.gameObjects[this.event.who];
      utils.faceObjToOtherObj(obj, this.map.gameObjects["hero"]);
      //console.log("Set to faceHero", obj);
      resolve();
    } catch (err) {
      console.error("Error in faceHero:", err);
      resolve();
    }
  }

  speak(resolve) {
    //console.log("speak called");
    const message = new SpeechBox({
      text: this.event.text,
      who: this.event.who,
      onComplete: () => {
        resolve();
      },
    });
    message.init(document.querySelector(".game-container"));
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
      fontSize: this.event.fontSize,
      height: this.event.height,
      onComplete: (interrupted) => {
        if (!interrupted) {
          resolve();
        }
      },
    });
    message.init(document.querySelector(".game-container"));
  }

  textMessageStopObjects(resolve) {
    this.map.stopObjects = true;
    console.log("stoppping ojects", this.map);
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(
        this.map.gameObjects["hero"].direction
      );
    }

    const message = new TextMessage({
      text: this.event.text,
      fontSize: this.event.fontSize,
      height: this.event.height,
      onComplete: (interrupted) => {
        if (!interrupted) {
          resolve();
          this.map.stopObjects = false;
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
    // console.log(
    //   "chnagemap called",
    //   this.event.x,
    //   this.event.y,
    //   this.event.direction
    // );
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

  async followHeroFiveSteps(resolve) {
    console.log();
    try {
      // Move toward the hero and count steps
      await new Promise((res) => this.faceHero(res));

      for (let i = 0; i < 5; i++) {
        // Move for 5 steps
        this.walkFoward();
      }

      resolve(); // Once the movement loop is done, resolve followHero
    } catch (err) {
      console.error("Error in followHero:", err);
      resolve();
    }
  }

  shoot() {
    // console.log(
    //   "shoot called",
    //   this,
    //   "gameobjects: ",
    //   this.map.gameObjects,
    //   this.event
    // );
    if (this.event.who === "darlek") {
      const darlek = this.map.gameObjects[this.event.who];
      darlek.shoot();
    }
  }

  // wont shoot if stopped mid septs
  async followHeroAndShoot(resolve) {
    let stepsTaken = 0; // Track steps taken
    const shootEveryStepsNum = 7;

    try {
      // Loop for a number of steps, shooting periodically
      for (let i = 0; i < shootEveryStepsNum; i++) {
        // Follow the hero, with retry logic if blocked
        await new Promise((res) => this.followHero(res));
        stepsTaken++;

        // Shoot after every shootEveryStepsNum steps
        if (stepsTaken >= shootEveryStepsNum) {
          console.log("Shooting after ", shootEveryStepsNum, " steps");
          this.shoot();
          stepsTaken = 0; // Reset step counter
        }
      }

      // Resolve when the behavior is done
      resolve();
    } catch (err) {
      console.error("Error in followHeroAndShoot:", err);
      resolve(); // Always resolve the promise even in case of an error
    }
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
      map: this.map,
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
    // grab console and check if take off active
    const consoleObject = this.map.gameObjects["console"];

    //if (this.map.tardisLanded) {
    if (!consoleObject.takeOffActivated) {
      this.event.map = window.tardisState.destination;
      // test
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
      this.changeMap(resolve);
    } else {
      const setTextMessage = async () => {
        this.event.text = "Tardis Not Landed";
        await new Promise((res) => this.textMessage(res));
      };
      setTextMessage();
      resolve();
    }
  }

  // Currently two options to find interactives
  tardisConsoleSonicEvent(resolve) {
    // Create asyncronous function to show console options in sonic menu
    const sequence = async () => {
      //this.options = ["tardisLandOrFly", "useConsoleScreen"];
      this.options = [
        {
          label: "Land / Take Off",
          class: "choose-dest",
          handler: () => {
            // Close menu scrren
            this.sonicMenu.end();

            // Initiate tardis event
            const event = new OverworldEvent({
              map: this.map,
              event: { type: "tardisLandOrFly" },
            });
            event.init();
          },
        },
        {
          label: "Use Console Screen",
          class: "choose-dest",
          handler: () => {
            // Close menu scrren
            this.sonicMenu.end();

            const event = new OverworldEvent({
              map: this.map,
              event: {
                type: "useConsoleScreen",
              },
            });
            event.init();
          },
        },
      ];
      await new Promise((res) => this.showSonicMenu(res));
    };
    sequence();
    resolve();
  }

  showSonicMenu(resolve) {
    // Takes options and shows them around the object (maybe)
    //const options =
    //console.log("event", this.event);
    //console.log("options", this.options);

    const options = this.options ? this.options : this.event.options;

    //console.log("this.options: ", this.options);
    //console.log("this.event.options: ", this.event.options);
    //

    this.sonicMenu = new SonicMenu({
      map: this.map,
      user: this.event.user,
      event: this,
      onComplete: () => {
        this.sonicMenu.end();
        resolve();
      },
      options: this.event.options ? this.event.options : this.options,
    });
    this.sonicMenu.init(document.querySelector(".game-container"));
    this.map.sonicMenu = this.sonicMenu;
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
    const setTextMessage = async () => {
      this.event.text = "Tardis has not landed";
      new Promise((res) => this.textMessage(res));
    };
    if (this.map.tardisLanded) {
      // If landed show outside map
      this.map.overworld.startMapAsFlyTardis(
        window.OverworldMaps[this.event.map],
        window.OverworldMaps["Tardis"]
      );
    } else {
      setTextMessage();
    }

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
  async showTitleScreen() {
    // stop previous map if there is one
    //this.stopGameLoop();
    //this.stopMap();
    this.map.isPaused = true;

    //console.log("title screeen: ", this.progress, this.map);

    const container = document.querySelector(".game-container");

    //Show the title screen
    this.map.overworld.titleScreen = new TitleScreen({
      progress: this.map.overworld.progress,
    });
    const { progress, level } = await this.map.overworld.titleScreen.init(
      container
    );

    //Potentially load saved data
    let initialHeroState = null;
    let initialSonicState = null;
    // if progress is returned then start with last saved
    // else start with level
    if (progress) {
      this.map.overworld.progress.load();
      initialHeroState = {
        x: this.map.overworld.progress.startingHeroX,
        y: this.map.overworld.progress.startingHeroY,
        direction: this.map.overworld.progress.startingHeroDirection,
      };
      initialSonicState = {
        isSonicEquipped: this.map.overworld.progress.sonicState.isSonicEquipped,
        activeMode: this.map.overworld.progress.sonicState.activeMode,
      };
      this.map.overworld.startMap(
        window.OverworldMaps[this.map.overworld.progress.mapId],
        initialHeroState,
        initialSonicState
      );
    }
    if (level) {
      this.map.overworld.startMap(window.OverworldMaps[level.id]);
    } else {
      this.map.overworld.startMap(window.OverworldMaps.Tardis);
    }

    this.map.isPaused = false;
    this.map.overworld.startGameLoop();
  }

  heroKilled(resolve) {
    //console.log("heroKilled event: ", this);

    // Change back to tardis map
    //this.event.map = "Tardis"; // TODO better way of setting map
    const killScreen = new KillScreen();
    killScreen.init(document.querySelector(".game-container"), async () => {
      this.map.overworld.startMap(window.OverworldMaps[this.event.map]);
      await utils.wait(500);
      resolve();
      killScreen.fadeOut();
    });
  }

  wait(resolve) {
    return new Promise((res) => {
      setTimeout(() => {
        console.log("Wait complete");
        res(); // Resolve the wait promise
        resolve(); // Resolve the outer promise
      }, this.event.length);
    });
  }

  async consoleTimeRotarAnimation(resolve) {
    const consoleObject = this.map.gameObjects[this.event.who];

    // Set the initial animation
    consoleObject.sprite.setAnimation("time-rotor-1");

    // Await a delay of 500ms
    await new Promise((res) => setTimeout(res, 200));

    // Set the next animation
    consoleObject.sprite.setAnimation("time-rotor-2");

    // Await a delay of 500ms
    await new Promise((res) => setTimeout(res, 600));

    // Set the next animation
    consoleObject.sprite.setAnimation("time-rotor-1");

    // Await another 500ms delay
    await new Promise((res) => setTimeout(res, 200));

    // Reset the animation to start
    consoleObject.sprite.setAnimation("start");

    // Await another 500ms delay
    await new Promise((res) => setTimeout(res, 200));

    // Reset the animation to start
    consoleObject.sprite.setAnimation("time-rotor-bottom1");

    // Await another 500ms delay
    await new Promise((res) => setTimeout(res, 200));

    // Reset the animation to start
    consoleObject.sprite.setAnimation("time-rotor-bottom2");

    // Await another 500ms delay
    await new Promise((res) => setTimeout(res, 600));

    // Reset the animation to start
    consoleObject.sprite.setAnimation("time-rotor-bottom1");

    // Await another 500ms delay
    await new Promise((res) => setTimeout(res, 200));

    // Reset the animation to start
    consoleObject.sprite.setAnimation("start");

    // // Await another 500ms delay
    // await new Promise((res) => setTimeout(res, 400));

    // // Reset the animation to start
    // consoleObject.sprite.setAnimation("start");

    // Await another 500ms delay
    await new Promise((res) => setTimeout(res, 200));

    resolve();
  }

  init() {
    return new Promise((resolve) => {
      if (this.event.required) {
        if (window.playerState.storyFlags[this.event.required]) {
          // if stroy flag has happend then call event
          this[this.event.type](resolve);
        } else {
          // else resolve after 100 ms
          setTimeout(resolve, 100);
        }
      } else {
        this[this.event.type](resolve);
      }
    });
  }

  // init() {
  //   //window.playerState.storyFlags[this.event.required] = true;
  //   console.log("window.playerState.storyFlags", window.playerState.storyFlags);
  //   return new Promise((resolve, reject) => {
  //     // Check if the event has a required story flag
  //     if (this.event.required) {
  //       console.log("event required")
  //       // If the required flag is active, trigger the event
  //       if (window.playerState.storyFlags[this.event.required]) {
  //         this[this.event.type](resolve);
  //       } else {
  //         // Log a message and resolve the promise without triggering the event
  //         console.log(
  //           "Story flag not active",
  //           window.playerState.storyFlags,
  //           this.event
  //         );
  //         resolve(); // Resolve immediately, nothing to do
  //       }
  //     } else {
  //       // If no story flag is required, simply trigger the event
  //       this[this.event.type](resolve);
  //     }
  //   });
  // }
}
