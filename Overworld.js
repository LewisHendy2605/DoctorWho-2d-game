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
      }
    });
  }

  startMap(mapConfig) {
    this.map = new OverWorldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();
  }

  init() {
    //this.hud = new Hud();
    //this.hud.init(document.querySelector(".game-container"));

    this.startMap(window.OverworldMaps.Tardis);

    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();
    //this.directionInput.direction;
    this.startGameLoop();

    this.map.startCutscene([
      //{ type: "changeTardisDest", map: "DemoRoom" },
      //{ type: "battle", enemyId: "beth" },
      //{ type: "useConsoleScreen" },
      //{ type: "changeMap", map: "DemoRoom" },
      //{ type: "textMessage", text: "Hello Buddy, your in the kitchen now !!" },
    ]);
  }
}
