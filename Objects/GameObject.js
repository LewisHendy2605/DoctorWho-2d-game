class GameObject {
  constructor(config, type) {
    this.id = null;
    this.isMounted = false;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.direction = config.direction || "down";

    this.imageSrc = config.src || "/images/characters/people/hero.png";

    this.isConsole = config.isConsole || false;
    this.type = type || null;

    this.setSprite(config);

    this.behaviorLoop = config.behaviorLoop || [];
    this.behaviorLoopIndex = 0;

    this.talking = config.talking || [];

    // store map for sonic behaviour
    this.map = null;
  }

  setSprite(config) {
    if (this.type === "console") {
      this.sprite = new ConsoleSprite({
        gameObject: this,
        src: config.src || "/images/characters/people/hero.png",
      });
    } else if (this.type === "tardis") {
      this.sprite = new TardisSprite({
        gameObject: this,
        src: config.src || "/images/characters/people/hero.png",
      });
    } else if (this.type === "doctor") {
      console.log("setting doctor sprite:", config, this);
      this.sprite = new DoctorSprite({
        gameObject: this,
        src: config.src || "/images/characters/people/hero.png",
      });
    } else if (this.type === "darlek") {
      this.sprite = new DarlekSprite({
        gameObject: this,
        src: config.src || "/images/characters/people/hero.png",
      });
    } else {
      this.sprite = new Sprite({
        gameObject: this,
        src: config.src || "/images/characters/people/hero.png",
      });
    }
  }

  deMount() {
    this.map.removeWall(this.x, this.y);
  }

  mount(map) {
    console.log("mounted: ", this);
    this.isMounted = true;
    map.addWall(this.x, this.y);

    this.map = map;

    // If we have a behaiior, kick off after a short delay
    setTimeout(() => {
      this.deBehaviorEvent(map);
    }, 10);
  }

  update() {}

  // Dont do anything if there is a more important cutscene or idont have config to do anything
  async deBehaviorEvent(map) {
    if (
      map.isCutScenePlaying ||
      this.behaviorLoop.length === 0 ||
      this.isStanding
    ) {
      // console.log("stoppign behavior loop", this);
      // console.log(
      //   map.isCutScenePlaying,
      //   this.behaviorLoop.length,
      //   this.isStanding
      // );
      return;
    }

    //console.log("doing object behavior", this);
    //Setting up out event with relevant info
    let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.who = this.id;

    // Create an event instance out of our next event config
    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init();

    // Setting the next event to fire
    this.behaviorLoopIndex += 1;
    if (this.behaviorLoopIndex === this.behaviorLoop.length) {
      this.behaviorLoopIndex = 0;
    }

    // Do it again
    this.deBehaviorEvent(map);
  }
}
