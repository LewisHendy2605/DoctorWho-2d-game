class OverWorld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
    this.flyTardis = false;
    this.escapeListener = null;
    this.touchStartHandler = null;
    this.clickHandler = null;
    this.hud = null;
    this.isGameRunning = true;
  }

  startGameLoop() {
    const step = () => {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Establish the camera person
      const cameraPerson = this.flyTardis
        ? this.map.gameObjects.tardis
        : this.map.gameObjects.hero;

      // Update all objects
      Object.values(this.map.gameObjects).forEach((object) => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        });
      });

      // Draw Lower Layer
      this.map.drawLowerImage(this.ctx, cameraPerson);

      // Draw Game Objects
      Object.values(this.map.gameObjects)
        .sort((a, b) => {
          return a.y - b.y;
        })
        .forEach((object) => {
          // Skip drawing the hero if flying the Tardis
          if (this.flyTardis && object === this.map.gameObjects.hero) {
            return;
          }
          object.sprite.draw(this.ctx, cameraPerson);
        });

      // Draw Upper Layer
      this.map.drawUpperImage(this.ctx, cameraPerson);

      // Continue the loop if the game is not paused
      if (!this.map.isPaused) {
        requestAnimationFrame(step);
      }
    };

    step();
  }

  stopGameLoop() {
    this.isGameRunning = false;
  }

  bindActionInput() {
    // Check if on mobile
    if (document.body.classList.contains("mobile-device")) {
    } else {
      new KeyPressListener("Enter", () => {
        // Is there a person here to talk to ?
        this.map.checkForActionCutscene();
      });

      new KeyPressListener("Escape", () => {
        if (!this.map.isCutscenePlaying) {
          this.map.startCutscene([{ type: "pause" }]);
        }
      });
    }

    console.log("MOBILE LISTERNERS BEING SET");
    // Touch event listeners for mobile
    //const actionButton = document.getElementById("actionButton");
    const pauseButton = document.getElementById("pauseButton");

    // if (actionButton) {
    //   actionButton.addEventListener("touchstart", (event) => {
    //     event.preventDefault(); // Prevent default touch action
    //     this.map.checkForActionCutscene();
    //   });
    // }

    if (pauseButton) {
      //console.log("setting pausebutton", pauseButton);
      // pauseButton.addEventListener("touchstart", (event) => {
      //   console.log("pressded pause");
      //   event.preventDefault(); // Prevent default touch action
      //   if (!this.map.isCutscenePlaying) {
      //     this.map.startCutscene([{ type: "pause" }]);
      //   }
      // });
      pauseButton.addEventListener("click", (event) => {
        console.log("pressded pause, click");
        event.preventDefault(); // Prevent default touch action
        if (!this.map.isCutscenePlaying) {
          this.map.startCutscene([{ type: "pause" }]);
        }
      });
    }
  }

  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkComplete", (e) => {
      if (e.detail.whoId == "hero") {
        // Heros position has chaged
        this.map.checkForFootstepCutscene();
        this.map.checkForFootstepInteractive();
        this.map.checkForFootstepEnterTardis();
      }
    });
  }

  stopMap() {
    // if map is being changed, then call objects done func
    // mainly this is to complete sonic lifecysle between maps for consistent hud updates
    if (this.map) {
      console.log("demonting objects", this.map.gameObjects);
      this.map.demountObjects();
      //this.map = null;
    }
  }

  startMap(mapConfig, heroInitialState = null, sonicInitialState = null) {
    // stop previous map if there is one
    this.stopMap();

    // update state variabels befoer mounting objects
    if (sonicInitialState) {
      const { sonicState } = window;
      sonicState.isSonicEquipped = sonicInitialState.isSonicEquipped;
      sonicState.activeMode = sonicInitialState.activeMode;
    }

    // Start new map + mount objects
    this.map = new OverWorldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();

    console.log("start map:  ", mapConfig, this.progress, this.map);

    if (heroInitialState) {
      const { hero } = this.map.gameObjects;
      //console.log("start map hero state change", hero, heroInitialState);
      this.map.removeWall(hero.x, hero.y);
      this.map.gameObjects.hero.x = heroInitialState.x;
      this.map.gameObjects.hero.y = heroInitialState.y;
      this.map.gameObjects.hero.direction = heroInitialState.direction;
      this.map.addWall(hero.x, hero.y);
    }

    this.progress.mapId = mapConfig.id;
    this.progress.startingHeroX = this.map.gameObjects.hero.x;
    this.progress.startingHeroY = this.map.gameObjects.hero.y;
    this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
    //console.log("setting progress values", this.progress);
  }

  unbindMobileListeners(actionButton) {
    if (this.touchStartHandler && this.clickHandler) {
      actionButton.removeEventListener("touchstart", this.touchStartHandler);
      actionButton.removeEventListener("click", this.clickHandler);
      this.touchStartHandler = null;
      this.clickHandler = null;
    }
  }

  startMapAsFlyTardis(newMapConfig, oldMapConfig, heroInitialState = null) {
    this.map = new OverWorldMap(newMapConfig);
    this.map.overworld = this;
    this.map.mountObjects();
    this.flyTardis = true;
    this.map.gameObjects.tardis.isPlayerControlled = true;
    this.map.gameObjects.hero.isPlayerControlled = false;

    // Add a button to escape
    if (document.body.classList.contains("mobile-device")) {
      const actionButton = document.getElementById("actionButton");
      actionButton.innerText = "Exit Flying";

      if (actionButton) {
        this.touchStartHandler = (event) => {
          this.flyTardis = false;
          this.map.gameObjects.tardis.isPlayerControlled = false;
          this.map.gameObjects.hero.isPlayerControlled = true;
          this.startMap(oldMapConfig);
          actionButton.innerText = "Action";
          this.unbindMobileListeners(actionButton);
        };

        this.clickHandler = (event) => {
          this.flyTardis = false;
          this.map.gameObjects.tardis.isPlayerControlled = false;
          this.map.gameObjects.hero.isPlayerControlled = true;
          this.startMap(oldMapConfig);
          this.unbindMobileListeners(actionButton);
        };

        actionButton.addEventListener("touchstart", this.touchStartHandler);
        actionButton.addEventListener("click", this.clickHandler);
      }
    } else {
      this.escapeListener = new KeyPressListener("KeyE", () => {
        this.flyTardis = false;
        this.map.gameObjects.tardis.isPlayerControlled = false;
        this.map.gameObjects.hero.isPlayerControlled = true;
        this.startMap(oldMapConfig);
        this.escapeListener.unbind();
      });
    }
  }

  hideSonicMobileButtons() {
    if (!document.body.classList.contains("mobile-device")) {
      // Grab buttons for the sonic use on mobile
      this.actionButton = document.getElementById("actionButton");
      this.sonicButton = document.querySelector(".sonicButton");
      this.sonicShootButton = document.querySelector(".sonicShootButton");

      // Hide buttons if desktop
      this.actionButton.style.display = "none";
      this.sonicButton.style.display = "none";
      this.sonicShootButton.style.display = "none";
    }
  }

  async showTitleScreen() {
    // stop previous map if there is one
    //this.stopGameLoop();
    //this.stopMap();
    this.map.isCutScenePlaying = true;

    console.log("title screeen: ", this.progress, this.map);

    const container = document.querySelector(".game-container");

    //Show the title screen
    this.titleScreen = new TitleScreen({ progress: this.progress });
    const { progress, level } = await this.titleScreen.init(container);

    //Potentially load saved data
    let initialHeroState = null;
    let initialSonicState = null;
    // if progress is returned then start with last saved
    // else start with level
    if (progress) {
      this.progress.load();
      initialHeroState = {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection,
      };
      initialSonicState = {
        isSonicEquipped: this.progress.sonicState.isSonicEquipped,
        activeMode: this.progress.sonicState.activeMode,
      };
      this.startMap(
        window.OverworldMaps[this.progress.mapId],
        initialHeroState,
        initialSonicState
      );
    }
    if (level) {
      this.startMap(window.OverworldMaps[level.id]);
    } else {
      this.startMap(window.OverworldMaps.Tardis);
    }

    // after resume objects behavuor
    this.map.isCutScenePlaying = false;
  }

  async init() {
    const container = document.querySelector(".game-container");
    this.hideSonicMobileButtons();

    // Craete a new progress tracker
    this.progress = new Progress();

    //Show the title screen
    this.titleScreen = new TitleScreen({ progress: this.progress });
    const { progress, level } = await this.titleScreen.init(container);

    console.log("savefie, demolevel: ", progress, level);
    //Potentially load saved data
    let initialHeroState = null;
    let initialSonicState = null;
    // if progress is returned then start with last saved
    // else start with level
    if (progress) {
      this.progress.load();
      initialHeroState = {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection,
      };
      initialSonicState = {
        isSonicEquipped: this.progress.sonicState.isSonicEquipped,
        activeMode: this.progress.sonicState.activeMode,
      };
      this.startMap(
        window.OverworldMaps[this.progress.mapId],
        initialHeroState,
        initialSonicState
      );
    }
    if (level) {
      this.startMap(window.OverworldMaps[level.id]);
    } else {
      this.startMap(window.OverworldMaps.Tardis);
    }

    // Load the hud
    // this.hud = new Hud();
    // this.hud.init(document.querySelector(".game-container"));

    //this.startMap(window.OverworldMaps.Tardis, initialHeroState);

    // Create COntrols
    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    // Kick off the game
    this.startGameLoop();

    this.map.checkForStartEvent();

    this.map.startCutscene([
      //{ type: "changeTardisDest", map: "DemoRoom" },
      //{ type: "battle", enemyId: "beth" },
      //{ type: "useConsoleScreen" },
      //{ type: "useChangeDestScreen" },
      //{ type: "changeMap", map: "DemoRoom" },
      //{ type: "textMessage", text: "Hello Buddy, your in the kitchen now !!" },
    ]);
  }
}
