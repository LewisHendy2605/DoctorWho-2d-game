class Darlek extends GameObject {
  constructor(config) {
    super(config, "darlek");
    this.movingProgressRemaining = 0;
    this.isStanding = false;
    this.isAlive = true;

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.speedMultiplier = 1.5;

    this.projectiles = [];

    this.projectileModes = [
      { name: "Gamma-Ray Pulse", strength: 20 },
      { name: "Electrical Magnetic Pulse", strength: 20 },
      { name: "Electrical Field Pulse", strength: 20 },
      { name: "Sonic Field Pulse", strength: 20 },
      { name: "Magnetic Field Pulse", strength: 20 },
      { name: "X-Ray Pulse", strength: 20 },
      { name: "Gamma-Ray Pulse", strength: 20 },
    ];
    this.activeProjectileMode = this.projectileModes[0];

    // Bind the kill method to the current instance
    this.kill = this.kill.bind(this);
    this.reinstateElectricalSystems =
      this.reinstateElectricalSystems.bind(this);

    this.projectilePerceptibles = [
      { name: "Gamma-Ray Pulse", effect: this.kill }, // chaneg to method calls
      { name: "Electrical Magnetic Pulse", effect: this.kill },
      { name: "Electrical Field Pulse", effect: 20 },
      { name: "Sonic Field Pulse", effect: this.reinstateElectricalSystems },
      { name: "Magnetic Field Pulse", effect: 20 },
      { name: "X-Ray Pulse", effect: 20 },
      { name: "Gamma-Ray Pulse", effect: 20 },
    ];

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };

    this.data = [
      { type: "Type", data: "Darlek" },
      { type: "Age", data: "200" },
    ];

    this.interactiveOptions = [
      {
        label: "Scan Results from " + this.type,
        class: "choose-dest",
        handler: () => {
          // // Close menu scrren
          // this.map.sonicMenu.end();

          console.log(this);

          this.map.sonicMenu.showData(this.data);

          // Show data about object

          // Initiate tardis event
          // const event = new OverworldEvent({
          //   map: this.map,
          //   event: { type: "tardisLandOrFly" },
          // });
          // event.init();
        },
      },
    ];
  }

  kill() {
    console.log("Darlek killed", this);
    this.isAlive = false;
    //console.log(this);
  }

  reinstateElectricalSystems() {
    console.log("Darlek Alived");
    this.isAlive = true;
    //this.startBehavior();
    console.log(this);
  }

  update(state) {
    if (this.isAlive) {
      if (this.movingProgressRemaining > 0) {
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

    // Update all projectiles
    this.projectiles.forEach((projectile) => projectile.update());

    // // Remove inactive projectiles
    this.projectiles = this.projectiles.filter(
      (projectile) => projectile.isActive
    );
  }

  startBehavior(state, behavior) {
    //if (this.isAlive) {
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
    //}
  }

  updatePosition() {
    const [property, change] = this.directionUpdate[this.direction];
    this[property] += change;
    this.movingProgressRemaining -= 1;

    if (this.movingProgressRemaining === 0) {
      // We finished the walk
      utils.emitEvent("PersonWalkComplete", {
        whoId: this.id,
      });
    }
  }

  shoot() {
    if (this.isAlive) {
      let x = this.x;
      let y = this.y;

      const projectile = new Projectile({
        x,
        y,
        user: this,
        type: this.activeProjectileMode,
        direction: this.direction,
        speed: 1,
        imageSrc: utils.setDynamicPath("/images/misc/darlek-laser.png"),
      });
      this.projectiles.push(projectile);
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
