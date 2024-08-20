class Console extends GameObject {
  constructor(config) {
    super(config, "console");
    this.movingProgressRemaining = 0;
    this.isStanding = false;

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };

    this.data = [
      { type: "Type", data: "Tardis Console" },
      { type: "Age", data: "99999999" },
      { type: "Origin", data: "Galifray" },
      { type: "Description", data: "Tardis MK1, " },
      { type: "Magnatism Field Strength", data: "987892 H" },
      { type: "Electromagnatism Field Strength", data: "756 H" },
      { type: "Radiation", data: "5000J Bqv" },
      { type: "Temporal Field", data: "Very Active" },
      { type: "Temporal Radiation", data: "Low" },
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
      {
        label: "Land / Take Off",
        class: "choose-dest",
        handler: () => {
          // Close menu scrren
          this.map.sonicMenu.end();

          // Initiate tardis event
          const event = new OverworldEvent({
            map: this.map,
            event: { type: "tardisLandOrFly" },
          });
          event.init();
        },
      },
      {
        label: "Use Console Screen -- ",
        class: "choose-dest",
        handler: () => {
          // Close menu scrren
          this.map.sonicMenu.end();

          const event = new OverworldEvent({
            map: this.map,
            event: {
              type: "useConsoleScreen",
            },
          });
          event.init();
        },
      },
    ];
  }

  update(state) {
    // TODO: add screen animation
    // called each game tick
  }

  startBehavior(state, behavior) {
    this.updateSprite(behavior.type);
  }

  updatePosition() {
    // Dont need i think
  }

  updateSprite(type) {
    this.sprite.setAnimation(type);
  }
}
