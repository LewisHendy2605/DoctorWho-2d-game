class Console {
  constructor(config) {
    // Set up the image
    this.image = new Image();
    this.image.src = utils.setDynamicPath(config.src);
    this.image.onload = () => {
      this.isLoaded = true;
    };

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
      "cirleLever-down": [[1, 0]],
    };
    //this.currentAnimation = config.currentAnimation || "idle-down";
    this.currentAnimation = "cirleLever-down";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 8;
    this.animationFrameProgress = this.animationFrameLimit;

    // Referance the game object
    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame];
  }

  setAnimation(key) {
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

  draw(ctx, cameraPerson) {
    const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraPerson.x;
    const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y;

    this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

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
            x,
            y,
            32,
            32
          );
      }
          */

    this.isLoaded &&
      ctx.drawImage(
        this.image,
        frameX * 100,
        frameY * 100,
        100,
        100,
        x,
        y,
        100,
        100
      );

    this.updateAnimationProgress();
  }
}
