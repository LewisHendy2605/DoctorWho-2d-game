class Npc extends GameObject {
  constructor(config) {
    super(config, "npc");
    this.movingProgressRemaining = 0;
    this.isStanding = false;

    this.key = config.key;

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.speedMultiplier = 0.5;

    this.isSpeechBoxActive = false;

    this.behaviorLoop = [
      { type: "walkSteps", direction: "right", steps: 40 },
      // idle movement
      { type: "stand", direction: "right", time: 800 },
      { type: "stand", direction: "down", time: 3000 },
      { type: "stand", direction: "left", time: 3000 },
      { type: "stand", direction: "down", time: 3000 },
      { type: "stand", direction: "right", time: 800 },
      { type: "stand", direction: "down", time: 3000 },
      { type: "stand", direction: "left", time: 3000 },
      { type: "stand", direction: "down", time: 3000 },
      { type: "stand", direction: "right", time: 800 },
      { type: "stand", direction: "down", time: 3000 },
      { type: "stand", direction: "left", time: 3000 },
      { type: "stand", direction: "down", time: 3000 },
      //{ type: "walkSteps", direction: "right", steps: 20 },
      //{ type: "stand", direction: "right", time: 1500 },
      { type: "walkSteps", direction: "left", steps: 20 },
      //{ type: "stand", direction: "left", time: 1100 },
      //   { type: "walk", direction: "down" },
      //   { type: "walk", direction: "left" },
      //   { type: "walk", direction: "up" },
    ];

    this.dialogues = {
      initial: {
        text: "Hey there stranger.",
        options: [
          { text: "Go away", nextEvent: null },
          { text: "Hello, what's this place like?", nextEvent: "placeInfo" },
          {
            text: "Anything interesting around here?",
            nextEvent: "placeInfo",
          },
        ],
      },
      placeInfo: {
        text: "This is a small town, everyone is frindly. Theres not alot around tho.",
        options: [
          { text: "Thanks, bye.", nextEvent: null },
          {
            text: "Anything unordinary ever happen around here ?",
            nextEvent: "interesting",
          },
        ],
      },
      interesting: {
        text: "The power went out a few nights ago, my electrics haven't been the same since",
        options: [
          { text: "Goodbye.", nextEvent: null },
          {
            text: "Where is the power station ?",
            nextEvent: "wherePowStation",
          },
          {
            text: "Whats been differnt with the power ?",
            nextEvent: "whatsUpWithPower",
          },
        ],
      },
      wherePowStation: {
        text: "Up North, past the woods. Theres not alot around there",
        options: [
          { text: "Thanks.", nextEvent: null },
          {
            text: "I'll Look into it",
            nextEvent: null,
            objective: "Investigate Power Station",
          },
        ],
      },
      whatsUpWithPower: {
        text: "Well the night it went off all my fuses blew, but ever since then the power has been so weak I can barly run my tv",
        options: [
          { text: "Thanks for the info!", nextEvent: null },
          {
            text: "I'll Look into it",
            nextEvent: null,
            objective: "Investigate Power Station",
          },
        ],
      },
    };

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };
  }

  stopBehavior() {}

  restartBehavior() {}

  update(state) {
    // handle any interactivity
    const hero = this.map.gameObjects["hero"];

    if (
      hero.x >= this.x - 16 &&
      hero.x <= this.x + 16 &&
      hero.y >= this.y - 16 &&
      hero.y <= this.y + 16
    ) {
      if (!this.isSpeechBoxActive) {
        this.isSpeechBoxActive = true;
        //this.stopBehavior();
        this.isPaused = true;
        this.doInteractivity();
      }
    } else {
      if (this.isSpeechBoxActive) {
        this.isSpeechBoxActive = false;

        if (this.isPaused) {
          this.isPaused = false;
        }
      }
    }

    if (this.movingProgressRemaining > 0) {
      // handle walking
      this.updatePosition();
    } else {
      // More cases for starting to walk will come here
      //
      //

      // Case: Were keyboard ready and have an arrow presed
      if (
        !state.map.isCutScenePlaying &&
        this.isPlayerControlled &&
        state.arrow
      ) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow,
        });
      }
      this.updateSprite(state);
    }
  }

  async doInteractivity() {
    await this.startSpeechEvent.call(this, "initial");
  }

  async startSpeechEvent(eventKey) {
    //console.log("start speech called:", eventKey);
    const dialogue = this.dialogues[eventKey];

    // Ensure the dialogue exists
    if (!dialogue) {
      console.error("Invalid dialogue event key:", eventKey);
      return;
    }

    // Create the speech event based on the current dialogue object
    const speechEvent = new OverworldEvent({
      map: this.map,
      event: {
        type: "speechBox",
        who: this.key,
        text: dialogue.text,
        responseOptions: dialogue.options,
      },
    });

    const { done, messageBox } = await speechEvent.init();
    this.finishSpeechBoxResult = done;

    let isSpeechInterrupted = false;

    const stopInteraction = new Promise((resolve) => {
      const checkForWalkAway = setInterval(() => {
        if (this.isSpeechBoxActive === false) {
          clearInterval(checkForWalkAway);
          isSpeechInterrupted = true;
          resolve("Player walked away");
        }
      }, 100);
    });

    try {
      const playerResponse = await Promise.race([
        messageBox.awaitResults(),
        stopInteraction,
      ]);

      if (isSpeechInterrupted) {
        //console.log("Player left the interaction zone, stopping interaction.");
        this.finishSpeechBoxResult();
        return;
      }

      this.finishSpeechBoxResult();
      // Find the next event based on the player's response
      const selectedOption = dialogue.options.find(
        (option) => option.text === playerResponse
      );
      //console.log("dialoge next event: ", selectedOption);

      if (selectedOption && selectedOption.nextEvent) {
        await this.startSpeechEvent(selectedOption.nextEvent);
      }
      if (selectedOption && selectedOption.objective) {
        // get hero
        const hero = this.map.gameObjects["hero"];
        // if response has objective add it to player
        hero.addObjective(selectedOption.objective);
      }
    } catch (e) {
      console.error("An error occurred during the interaction:", e);
    }
  }

  startBehavior(state, behavior) {
    // Setting character direction to whatever behavior has
    this.direction = behavior.direction;

    if (behavior.type === "walk") {
      // Stop here if space is not free
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
        behavior.retry &&
          setTimeout(() => {
            this.startBehavior(state, behavior);
          }, 10);
        return;
      }

      // Ready to walk
      state.map.moveWall(this.x, this.y, this.direction);
      utils.emitEvent("PersonStartWalk", {
        whoId: this.id,
      });
      this.movingProgressRemaining = 16;
      // Adjust progress remaining based on speed multiplier
      //this.movingProgressRemaining = 16 / this.speedMultiplier; // Lower the steps per frame if speedMultiplier > 1
      this.updateSprite(state);
    }

    if (behavior.type === "stand") {
      this.isStanding = true;
      setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id,
        });
        this.isStanding = false;
      }, behavior.time);
    }
  }

  updatePosition() {
    //console.log("update position called");
    const [property, change] = this.directionUpdate[this.direction];
    // this[property] += change;
    // Adjust the speed of movement by applying speedMultiplier
    this[property] += change * this.speedMultiplier;
    this.movingProgressRemaining -= 1 * this.speedMultiplier;

    if (this.movingProgressRemaining === 0) {
      // We finished the walk
      //console.log("emiting: PersonWalkComplete ");
      utils.emitEvent("PersonWalkComplete", {
        whoId: this.id,
      });
    }
  }

  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      return;
    }
    this.sprite.setAnimation("idle-" + this.direction);
  }
}
