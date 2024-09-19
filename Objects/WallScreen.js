class WallScreen extends GameObject {
  constructor(config) {
    super(config, "wall-screen");
    this.name = "Wall Screen";
    this.movingProgressRemaining = 0;
    this.isStanding = false;
    this.isOpen = false;

    this.showInteractiveOptionBool = true;
    this.electricalSystemsAcessible = true;

    this.isPlayerControlled = false;

    this.speedMultiplier = 1;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };

    this.data = [
      { type: "Type", data: "Door" },
      { type: "Composition", data: "Darlekium, Zinc, Titanium, Copper, Gold" },
      { type: "Description", data: "Door inside darlek base" },
      { type: "Electrical Systems", data: "Active" },
      { type: "Status", data: this.isOpen ? "Open" : "Closed" },
      { type: "Lock Status", data: "Locked" },
      {
        type: "Perceptible to",
        data: "Sonic field pulse to override lock system",
      },
    ];

    this.interactiveOptions = [
      {
        label:
          "Scan Results from " +
          utils.capitalizeFirstLetter(utils.removeNumbersFromString(this.type)),
        class: "choose-dest",
        handler: () => {
          // // Close menu scrren
          // this.map.sonicMenu.end();

          //console.log(this);

          this.map.sonicMenu.showData(this.data);
        },
      },
      {
        label: "Open Door / Close Door ",
        class: "choose-dest",
        handler: () => {
          // open or close door
          this.toggleOpenOrCloseDoor();

          // Close menu scrren
          this.map.sonicMenu.end();
        },
      },
      {
        label: "Disable Electrical Systems",
        class: "choose-dest",
        handler: () => {
          // Close menu scrren
          this.map.sonicMenu.end();
        },
      },
      {
        label: "Magnitise",
        class: "choose-dest",
        handler: () => {
          // Close menu scrren
          this.map.sonicMenu.end();
        },
      },
    ];

    this.invatory = [
      new CircuitBoard({ quantity: 1 }),
      new Wires({ quantity: 1 }),
    ];
  }

  hasAllElectricalComponents() {
    let hasWires = this.invatory.some((item) => item.name === "Wires");
    let hasCircuitBoard = this.invatory.some(
      (item) => item.name === "CircuitBoard"
    );

    return hasWires && hasCircuitBoard;
  }

  toggleOpenOrCloseDoor() {
    // Toggle the door state
    this.isOpen = !this.isOpen;

    // Update the animation based on the new state
    if (this.isOpen) {
      this.sprite.setAnimation("open");
      // remove walls to walkthrough
      this.map.removeWall(this.x + utils.withGrid(1), this.y);
      this.map.removeWall(
        this.x + utils.withGrid(1),
        this.y + utils.withGrid(1)
      );
      this.map.removeWall(
        this.x + utils.withGrid(1),
        this.y + utils.withGrid(2)
      );
    } else {
      this.sprite.setAnimation("closed");
      // re add waalls
      this.map.addWall(this.x + utils.withGrid(1), this.y);
      this.map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(1));
      this.map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(2));
    }

    // Update the "Status" field in the data dynamically
    this.data = this.data.map((item) => {
      if (item.type === "Status") {
        return {
          ...item,
          data: this.isOpen ? "Open" : "Closed",
        };
      }
      return item;
    });
  }

  mount(map) {
    super.mount(map);
    console.log("Mounting wall screen", this);

    // left hoizonal side
    // map.addWall(this.x, this.y + utils.withGrid(1));
    // map.addWall(this.x, this.y + utils.withGrid(2));

    // middle horizontal
    // map.addWall(this.x + utils.withGrid(1), this.y);
    // map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(1));
    // map.addWall(this.x + utils.withGrid(1), this.y + utils.withGrid(2));

    // right horizontal side
    // map.addWall(this.x + utils.withGrid(2), this.y);
    // map.addWall(this.x + utils.withGrid(2), this.y + utils.withGrid(1));
    // map.addWall(this.x + utils.withGrid(2), this.y + utils.withGrid(2));
  }

  deMount() {
    super.deMount();
  }

  update(state) {
    //console.log("Wall screen updated: ", state.map);
    const gameObject = state.map.gameObjects["hero"];
    //console.log(gameObject, this);
    if (this.electricalSystemsAcessible) {
      // if player is standing infront open box
      // add direction chek too (&& gameObject.direction === this.direction)
      if (gameObject.x === this.x + 0 && gameObject.y === this.y + 16) {
        if (this.showInteractiveOptionBool) {
          this.showInteractiveOption();
        }
      } else if (gameObject.x !== this.x + 0 || gameObject.y !== this.y + 16) {
        // console.log(
        //   "close box ",
        //   gameObject.x,
        //   gameObject.y,
        //   " this; ",
        //   this.x,
        //   this.y,
        //   this.isOpen
        // );
        this.closeAllScreens();
        // reset ineravtivity option
        this.showInteractiveOptionBool = true;
      }
    }
  }

  closeAllScreens() {
    this.closeInteractiveOption();
    this.closeElectronicsScreen();
  }

  showInteractiveOption() {
    if (!this.interacvtiveOption) {
      this.gameContainer = document.querySelector(".game-container");

      // creaet box to ask user if they wan to acces inside the panel
      this.interacvtiveOption = document.createElement("div");
      this.interacvtiveOption.classList.add("InteractiveOptionBox");
      this.interacvtiveOption.innerText = "Access Wall Panel Electronics?";

      this.buttonContainer = document.createElement("div");
      this.buttonContainer.classList.add("buttonContainer");

      // no point shwoing no as it shos aagin when standing there
      //   this.noButton = document.createElement("div");
      //   this.noButton.classList.add("menuButton", "red");
      //   this.noButton.innerText = "No";
      //   this.noButton.addEventListener("click", () => {
      //     console.log("no clicked");
      //     this.closeInteractiveOption();
      //   });
      //   this.buttonContainer.appendChild(this.noButton);

      this.yesButton = document.createElement("div");
      this.yesButton.classList.add("menuButton", "green");
      this.yesButton.innerText = "Yes";
      this.yesButton.addEventListener("click", () =>
        this.showElectronicsScreen()
      );
      this.buttonContainer.appendChild(this.yesButton);

      this.interacvtiveOption.appendChild(this.buttonContainer);

      this.gameContainer.appendChild(this.interacvtiveOption);
    }
  }

  closeInteractiveOption() {
    if (this.interacvtiveOption) {
      this.interacvtiveOption.remove();
      this.interacvtiveOption = null;
      this.showInteractiveOptionBool = false;
    }
  }

  closeElectronicsScreen() {
    if (this.eletronicsScreen) {
      this.eletronicsScreen.remove();
      this.eletronicsScreen = null;
    }
  }

  showElectronicsScreen() {
    this.closeInteractiveOption();

    // creaet box to ask user if they wan to acces inside the panel
    this.eletronicsScreen = document.createElement("div");
    this.eletronicsScreen.classList.add("EletronicsScreen");
    //this.eletronicsScreen.innerText = "Access Wall Panel Electronics?";

    this.eletronicsContainer = document.createElement("div");
    this.eletronicsContainer.classList.add("eletronicsContainer");

    // Loop through each item in the inventory
    this.invatory.forEach((item) => {
      // Create grid element
      const element = document.createElement("div");
      element.classList.add("grid-item");

      // Create img element
      const img = document.createElement("img");
      img.classList.add("eletronicsImg");
      img.src = utils.setDynamicPath(item.imageSrc); // Use dynamic path from the item
      element.appendChild(img);

      // Create text element
      const textElement = document.createElement("p");
      textElement.classList.add("eletronicsText");
      textElement.innerText = item.name; // Set the text from the item
      element.appendChild(textElement);

      // add event listener to add to show add to invatory button
      element.addEventListener("click", () =>
        this.showAddToInvButton(item, element)
      ); // or passing item

      // Append the created element to the container
      this.eletronicsContainer.appendChild(element);
    });

    // this.yesButton = document.createElement("div");
    // this.yesButton.classList.add("menuButton", "green");
    // this.yesButton.innerText = "Yes";
    // this.yesButton.addEventListener("click", () => this.showElectronicsScreen())
    // this.buttonContainer.appendChild(this.yesButton);

    this.eletronicsScreen.appendChild(this.eletronicsContainer);

    this.gameContainer.appendChild(this.eletronicsScreen);
  }

  showAddToInvButton(item, divElement) {
    console.log(item, divElement);

    if (!item) {
      console.error("Item is null or undefined.");
      return;
    }

    const addScreen = document.createElement("div");
    addScreen.classList.add("InvatoryScreen_addScreen");
    addScreen.innerText = "Add To Your Inventory?";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");

    // No Button
    const noButton = document.createElement("div");
    noButton.classList.add("InvatoryScreen_noButton");
    noButton.innerText = "No";
    noButton.addEventListener("click", () => {
      addScreen.remove();
    });
    buttonContainer.appendChild(noButton);

    // Add Button
    const addButton = document.createElement("div");
    addButton.classList.add("InvatoryScreen_addButton");
    addButton.innerText = "Add";
    addButton.addEventListener("click", () => {
      addScreen.remove();

      // Find index of the item in the inventory
      const itemIndex = this.invatory.indexOf(item);

      if (itemIndex !== -1) {
        // Remove item from inventory using splice
        this.invatory.splice(itemIndex, 1);

        // Add item to hero's inventory
        const hero = this.map.gameObjects["hero"];
        hero.invatory.push(item);

        console.log("moved object", hero.invatory, this.invatory, item);

        // Update UI
        this.closeAllScreens(); //  resets the current screen
        this.showElectronicsScreen();
      } else {
        console.error("Item not found in inventory.");
      }
    });
    buttonContainer.appendChild(addButton);

    // Append button container to screen
    addScreen.appendChild(buttonContainer);

    // Append addScreen to the provided element
    this.eletronicsScreen.appendChild(addScreen);
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
    this[property] += change * this.speedMultiplier;
    this.movingProgressRemaining -= this.speedMultiplier;

    if (this.movingProgressRemaining === 0) {
      // We finished the walk
      utils.emitEvent("PersonWalkComplete", {
        whoId: this.id,
      });
    }
  }

  updateSprite() {
    //this.sprite.setAnimation("closed");
  }
}

// Sprite Class

class WallScreenSprite {
  constructor(config) {
    this.testVariable = "hello";
    // Set up the image
    this.image = new Image();
    this.image.src = utils.setDynamicPath(config.src);
    this.image.onload = () => {
      this.isLoaded = true;
    };

    //Shadow
    // this.shadow = new Image();
    // this.useShadow = true; //config.useShadow || fasle
    // if (this.useShadow) {
    //   this.shadow.src = utils.setDynamicPath("/images/characters/shadow.png");
    // }

    // this.shadow.onload = () => {
    //   this.isShadowLoaded = true;
    // };

    // Configure Animation and initial state
    //console.log("config a: ", config.animations);
    this.animations = config.animations || {
      off: [[0, 0]],
      on: [[1, 0]],
    };
    //console.log("this.a: ", this.animations);
    //console.log(this.animations[this.currentAnimation]);
    //this.currentAnimation = config.currentAnimation || "idle-down";
    this.currentAnimation = "on";
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

  // this is getting called and set to ideldown, dont know where
  // it gets called in the overworl draew function but i cant see whats wrong
  setAnimation(key) {
    //console.log("Setting tardis animations:", key);
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
                  x,
                  y,
                  32,
                  32
                );
            }
                */

    this.isLoaded &&
      ctx.drawImage(this.image, frameX * 32, frameY * 16, 32, 16, x, y, 32, 16);

    this.updateAnimationProgress();
  }
}
