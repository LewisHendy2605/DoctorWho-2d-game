class ConsoleSprite {
  constructor(config) {
    // Set up the image
    this.image = new Image();
    this.image.src = utils.setDynamicPath(config.src);
    this.image.onload = () => {
      this.isLoaded = true;
    };

    // panel animations
    this.panelSheet = new Image();
    this.panelSheet.src = utils.setDynamicPath(
      "/images/tardis/console-animations.png"
    );

    //Shadow
    this.shadow = new Image();
    this.useShadow = true; //config.useShadow || fasle
    if (this.useShadow) {
      this.shadow.src = utils.setDynamicPath("/images/characters/shadow.png");
    }

    this.shadow.onload = () => {
      this.isShadowLoaded = true;
    };

    // Configure Animation and initial state
    this.animations = config.animations || {
      start: [[0, 0]],
      "time-rotor-1": [[1, 0]],
      "time-rotor-2": [[2, 0]],
      "time-rotor-bottom1": [[3, 0]],
      "time-rotor-bottom2": [[4, 0]],
      // "take-off-one": [[1, 0]],
      // "take-off-two": [[2, 0]],
      // "take-off-three": [[0, 1]],
      // "take-off-four": [[1, 1]],
      // "take-off-five": [[2, 1]],
    };
    //this.currentAnimation = config.currentAnimation || "idle-down";
    this.currentAnimation = "start";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 8;
    this.animationFrameProgress = this.animationFrameLimit;

    // Referance the game object
    this.gameObject = config.gameObject;
  }

  get frame() {
    //console.log(this.currentAnimation);
    //console.log(this.animations[this.currentAnimation]);
    //console.log(this.currentAnimationFrame);
    return this.animations[this.currentAnimation][this.currentAnimationFrame];
  }

  setAnimation(key) {
    //console.log("setting animtion:", key);
    if (this.currentAnimation !== key) {
      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationProgress() {
    // Downtick frame progress
    if (this.animationFrameProgress > 0) {
      this.animationFrameProgress -= 1;
      return;
    }

    //Reset the counter
    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame += 1;

    if (this.frame === undefined) {
      this.currentAnimationFrame = 0;
    }
  }

  drawLeftPanel(ctx, x, y) {
    if (this.gameObject.takeOffActivated) {
      ctx.drawImage(this.panelSheet, 32 * 1, 0, 32, 49, x + 6, y + 4, 32, 49);
    } else {
      ctx.drawImage(this.panelSheet, 0, 0, 32, 49, x + 6, y + 4, 32, 49);
    }
  }

  drawConsole(ctx, x, y) {
    if (this.gameObject.takeOffActivated) {
      //ctx.drawImage(this.image, 96 * 2, 0, 96, 250, x, y - 140, 96, 250);
      ctx.drawImage(this.image, 0, 0, 96, 250, x, y - 140, 96, 250);
    } else ctx.drawImage(this.image, 0, 0, 96, 250, x, y - 140, 96, 250);
  }

  draw(ctx, cameraPerson) {
    const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraPerson.x;
    const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y;

    //this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

    const [frameX, frameY] = this.frame;

    /*
      if (this.image.src.includes("characters-doctor-who")) {
        this.isLoaded &&
          ctx.drawImage(this.image, 0, 0, 128, 128, x + 4, y + 4, 32, 32);
      } else {
        this.isLoaded &&
          ctx.drawImage(
            this.image,
            frameX * 32,
            frameY * 32,
            32,
            32,
            x,a
            y,
            32,
            32
          );
      }
          */

    //console.log(frameX, this);

    // draw console
    this.isLoaded &&
      ctx.drawImage(this.image, 96 * frameX, 0, 96, 250, x, y - 140, 96, 250);

    // draw panels
    this.drawLeftPanel(ctx, x, y);

    this.updateAnimationProgress();
  }
}
