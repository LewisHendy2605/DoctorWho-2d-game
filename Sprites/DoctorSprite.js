class DoctorSprite {
  constructor(config) {
    // Set up the image
    this.image = new Image();
    this.image.src = utils.setDynamicPath(config.src);
    this.image.onload = () => {
      this.isLoaded = true;
    };

    this.hide = false;

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
      "idle-down": [[0, 0]],
      "idle-right": [[0, 1]],
      "idle-up": [[0, 2]],
      "idle-left": [[0, 3]],

      "sonic-down": [[4, 0]],
      "sonic-right": [[4, 1]],
      "sonic-up": [[4, 2]],
      "sonic-left": [[4, 3]],

      "walk-down": [
        [1, 0],
        [0, 0],
        [3, 0],
        [0, 0],
      ],
      // "walk-right": [
      //   [1, 1],
      //   [0, 1],
      //   [3, 1],
      //   [0, 1],
      // ],
      "walk-right": [
        [4, 1],
        [3, 1],
        [0, 1],
        [2, 1],
        [1, 1],
      ],
      // "walk-up": [
      //   [1, 2],
      //   [0, 2],
      //   [3, 2],
      //   [0, 2],
      // ],
      "walk-up": [
        [2, 2],
        [1, 2],
        [3, 2],
        [0, 2],
      ],
      // "walk-left": [
      //   [1, 3],
      //   [0, 3],
      //   [3, 3],
      //   [0, 3],
      // ],
      "walk-left": [
        [1, 3],
        [2, 3],
        [2, 3],
        [1, 3],
      ],
    };
    this.currentAnimation = config.currentAnimation || "idle-down";
    //this.currentAnimation = "idle-right";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 8;
    this.animationFrameProgress = this.animationFrameLimit;

    // Referance the game object
    this.gameObject = config.gameObject;
  }

  get frame() {
    //console.log("get frame called: ", this.currentAnimationFrame, this);
    return this.animations[this.currentAnimation][this.currentAnimationFrame];
  }

  setAnimation(key) {
    if (this.currentAnimation !== key) {
      //console.log("seeing animation to :", key, this);
      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  // setAnimation(key) {
  //   if (this.currentAnimation !== key) {
  //     this.currentAnimation = key;
  //     this.currentAnimationFrame = 0;
  //     // Change frame limit based on walking or idle animation
  //     this.animationFrameLimit = key.startsWith("walk")
  //       ? this.walkFrameLimit
  //       : 12; // Slow down walk more than idle
  //     this.animationFrameProgress = this.animationFrameLimit;
  //   }
  // }

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

    if (!this.hide) {
      this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);
    }

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

    if (!this.hide) {
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

    this.updateAnimationProgress();

    //console.log("Drawing Projetiles: ", this.gameObject);
    if (this.gameObject.sonicProjectiles) {
      // Draw all active projectiles
      this.gameObject.sonicProjectiles.forEach((projectile) =>
        projectile.draw(ctx, cameraPerson)
      );
    }
  }
}
