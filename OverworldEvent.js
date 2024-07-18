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
      this.audioManager.playBackground(this.event.audioSrc);
    }
    // Resolve immediately if no further action is needed
    resolve();
  }

  changeMap(resolve) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap(window.OverworldMaps[this.event.map]);
      resolve();

      sceneTransition.fadeOut();
    });
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
