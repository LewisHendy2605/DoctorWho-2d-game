class Projectile {
  constructor({ x, y, user, type, direction, speed, imageSrc }) {
    this.x = x;
    this.y = y;
    this.user = user;
    this.type = type;
    this.direction = direction;
    this.speed = speed;
    this.image = new Image();
    this.image.src = imageSrc;
    this.width = 16; // Assuming the projectile is 16x16 pixels
    this.height = 16;
    this.isActive = true;

    //console.log("making projectile: ", x, " ", y);
    //console.log("Projectile type: ", this.type, this.user);

    // Animations
    this.animations = {
      right: [[0, 0]],
      left: [[0, 0]],
      up: [[1, 0]],
      down: [[1, 0]],
    };
  }

  update() {
    switch (this.direction) {
      case "up":
        this.y -= this.speed;
        break;
      case "down":
        this.y += this.speed;
        break;
      case "left":
        this.x -= this.speed;
        break;
      case "right":
        this.x += this.speed;
        break;
    }

    // Check if projectile has collided with a object
    // Precompute and cache gameObjects to avoid looking up values multiple times
    const gameObjects = Object.values(this.user.map.gameObjects).filter(
      (obj) => obj.type !== this.user.type
    );
    // Find the matching object within the current coordinates
    const match = gameObjects.find(
      (obj) => obj.x === this.x && obj.y === this.y
    );

    if (match) {
      //console.log("Hitt somthing", match, this);
      if (match.projectilePerceptibles) {
        (obj) => obj.name === this.activeMode;
        // Check if any object in the array has a name that matches the active mode
        const matchingObjects = match.projectilePerceptibles.filter(
          (obj) => obj.name === this.type.name
        );
        if (matchingObjects.length > 0) {
          const match = matchingObjects[0];

          if (typeof match.effect === "function") {
            match.effect(); // Call the function
          } else {
            console.log("The effect is not a function:", match.effect);
            // Handle cases where effect is not a function, if needed
          }
        }
      }
    }

    // // TO DO: Redo check for canvas boundry with camera person offest
    // // Deactivate the projectile if it goes off screen (example for an 800x600 game area)
    if (this.x < 0 || this.x > 1500 || this.y < 0 || this.y > 1500) {
      this.isActive = false;
    }
  }

  //   draw(ctx) {
  //     if (this.isActive) {
  //       console.log("drawing projectile ", this);
  //       c
  //       //ctx.drawImage(this.image, 16, 16, 16, 16, this.x, this.y, 16, 16);
  //     }
  //   }

  get frame() {}

  draw(ctx, cameraPerson) {
    if (this.isActive) {
      // Get laser depending on what directon its firing
      const [frameX, frameY] = this.animations[this.direction][0];
      // offeset coordinates
      const x = this.x - 8 + utils.withGrid(10.5) - cameraPerson.x;
      const y = this.y - 18 + utils.withGrid(6) - cameraPerson.y;

      // ctx.drawImage(this.image, x, y, this.width, this.height);

      // draw projectile to canvas
      ctx.drawImage(this.image, frameX * 16, frameY * 16, 16, 16, x, y, 16, 16);

      //console.log("Drawinmg projectile: ", ctx);
      //ctx.fillStyle = "red"; // Use a noticeable color
      //ctx.fillRect(x, y, 16, 16);
    }
  }
}
