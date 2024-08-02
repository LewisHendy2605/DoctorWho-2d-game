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
  }

  startGameLoop() {
    const step = () => {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Establish the camera person
      const cameraPerson = this.flyTardis
        ? this.map.gameObjects.tardis
        : this.map.gameObjects.hero;

      // if (this.flyTardis) {
      //   console.log(this.map.gameObjects.hero);
      // }

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
          //console.log("Drawing: ", object);
          object.sprite.draw(this.ctx, cameraPerson);
        });

      // Draw Upper Layer
      this.map.drawUpperImage(this.ctx, cameraPerson);

      if (!this.map.isPaused) {
        requestAnimationFrame(() => {
          step();
        });
      }
    };
    step();
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
      pauseButton.addEventListener("touchstart", (event) => {
        console.log("pressded pause");
        event.preventDefault(); // Prevent default touch action
        if (!this.map.isCutscenePlaying) {
          this.map.startCutscene([{ type: "pause" }]);
        }
      });
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

  startMap(mapConfig, heroInitialState = null) {
    this.map = new OverWorldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();

    if (heroInitialState) {
      const { hero } = this.map.gameObjects;
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

  init() {
    // Craete a new progress tracker
    this.progress = new Progress();

    //Potentially load saved data
    let initialHeroState = null;
    const saveFile = this.progress.getSaveFile();
    if (saveFile) {
      // this.progress.load();
      // initialHeroState = {
      //   x: this.progress.startingHeroX,
      //   y: this.progress.startingHeroY,
      //   direction: this.progress.startingHeroDirection,
      // };
    }

    // Load the hud
    this.hud = new Hud();
    this.hud.init(document.querySelector(".game-container"));

    // this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);
    this.startMap(window.OverworldMaps.Tardis, initialHeroState);

    // Create COntrols
    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    // Kick off the game
    this.startGameLoop();

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
