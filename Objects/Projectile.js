class Projectile {
  constructor({ x, y, direction, speed, imageSrc }) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.image = new Image();
    this.image.src = imageSrc;
    this.width = 16; // Assuming the projectile is 16x16 pixels
    this.height = 16;
    this.isActive = true;

    //console.log("making projectile: ", x, " ", y);

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
