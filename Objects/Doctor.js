class Doctor extends GameObject {
  constructor(config) {
    //console.log("new doctor", config);
    super(config, "doctor");
    this.movingProgressRemaining = 0;
    this.isStanding = false;

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.speedMultiplier = 1.5;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };
    this.isDoctor = this.sprite.image.src.includes("doctor-11.png");
    this.sonicProjectiles = [];

    // move to invatory ?? maybe
    this.sonicScrewdriver = new SonicScrewdriver(this);

    this.isAlive = null;

    // Bind methods to be called by projectile
    this.kill = this.kill.bind(this);

    this.projectilePerceptibles = [
      { name: "Focused Photon Beam", effect: this.kill },
    ];

    // this.invatory = [
    //   { type: "tool", name: "Sonic Screwdriver" },
    //   { type: "collectable", name: "Titanium Scrap", quantity: 5 },
    //   { type: "collectable", name: "Darlek Metal Scrap", quantity: 2 },
    // ];

    // this.invatory = [
    //   new Titanium({ quantity: 6 }),
    //   new Copper({ quantity: 3 }),
    //   //new CircuitBoard({ quantity: 3 }),
    //   new Battery({ quantity: 3 }),
    //   //new Wires({ quantity: 3 }),
    //   this.sonicScrewdriver,
    // ];
    this.invatory = [
      //{ type: "titanium", quantity: 5 },
      //{ type: "copper", quantity: 1 },
      //{ type: "battery", quantity: 1 },
    ];
  }

  kill() {
    if (!this.isAlive) return; // Prevent re-killing the doctor

    console.log("doctor killed", this);
    this.isAlive = false;

    let event = [];
    //   {
    //     type: "heroKilled",
    //     map: "Tardis",
    //   },
    // ];

    if (this.map.id === "DemoLevel") {
      event = [
        {
          type: "heroKilled",
          map: "DemoLevel",
        },
      ];
    } else {
      event = [
        {
          type: "heroKilled",
          map: "Tardis",
        },
      ];
    }

    console.log("doctor killed map:", event, this.map);
    this.map.startCutscene(event);

    // const killevent = new OverworldEvent({
    //   map: this.map,
    //   event: { type: "heroKilled" },
    //   direction: this.direction,
    // });

    // killevent.init();
  }

  deMount() {
    super.deMount();
    //console.log("Doctor done called: ", this);
    this.sonicScrewdriver.done();
  }

  mount(map) {
    super.mount(map);
    this.isAlive = true;
    // Remove Hud if map change + remove old sonic
    if (this.map.overworld.hud) {
      this.map.overworld.hud.done();
    }

    this.sonicScrewdriver.init();

    this.createHud();
  }

  // waitForMount() {
  //   const intervalId = setInterval(() => {
  //     //console.log("creating interval");
  //     if (this.isMounted) {
  //       this.createHud();
  //       clearInterval(intervalId); // Stop checking once mounted
  //       //console.log("interval destryoed");
  //     }
  //   }, 100); // Check every 100ms
  // }

  createHud() {
    //console.log("new hud");
    this.map.overworld.hud = new HudUI(this, "/images/ui/doctor-11-head.png");
    this.map.overworld.hud.init();
  }

  update(state) {
    //console.log("Doctor update !!: ", this, state);
    if (!this.map.stopObjects) {
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

      // Update all projectiles
      this.sonicProjectiles.forEach((projectile) => projectile.update());

      // // Remove inactive projectiles
      this.sonicProjectiles = this.sonicProjectiles.filter(
        (projectile) => projectile.isActive
      );
    } else {
      console.log("stopping objects");
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

  updateSprite() {
    //console.log("updating doctor sprite: ", this.direction, this);
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      return;
    }
    if (this.sonicScrewdriver.sonicActive) {
      this.sprite.setAnimation("sonic-" + this.direction);
    } else {
      this.sprite.setAnimation("idle-" + this.direction);
    }
  }
}
