class Console extends GameObject {
  constructor(config) {
    super(config, "console");
    this.movingProgressRemaining = 0;
    this.isStanding = false;

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.takeOffActivated = false;

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

  mount(map) {
    super.mount(map);

    const canvas = this.map.overworld.canvas;

    canvas.addEventListener("click", (event) => {
      if (this.isConsoleInteractiveActive) {
        // The mouse is inside the hover area and was clicked

        if (
          this.hoverElement.innerText.includes("Take Off") ||
          this.hoverElement.innerText.includes("Land")
        )
          if (this.takeOffActivated) {
            this.takeOffActivated = false;
            this.createInteractiveText();
            console.log("takeOffActivated:", this.takeOffActivated);
          } else {
            this.takeOffActivated = true;
            this.createInteractiveText();
            console.log("takeOffActivated:", this.takeOffActivated);
          }
      }
    });

    // add listener to lever
    // Track whether the mouse is hovering over the image
    // let isHovering = false;

    // // Add a mousemove listener to track the hover
    // const canvas = this.map.overworld.canvas;
    // const ctx = this.map.overworld.ctx;

    // canvas.addEventListener("mousemove", (event) => {
    //   const rect = this.map.overworld.element.getBoundingClientRect();
    //   const { mouseGridX, mouseGridY } = utils.getMapCoordsFromMouse(
    //     this.map.gameObjects["hero"],
    //     event
    //   );
    //   // Adjust mouse position relative to the canvas inside the container
    //   //const mouseGridX = (event.clientX - rect.left) / 3;
    //   //const mouseGridY = (event.clientY - rect.top) / 3;

    //   const mouseX = utils.withGrid(mouseGridX);
    //   const mouseY = utils.withGrid(mouseGridY);

    //   console.log("Mouse move event", mouseX, mouseY, this.x, this.y);
    //   // const rect = canvas.getBoundingClientRect();
    //   // const mouseX = event.clientX - rect.left;
    //   // const mouseY = event.clientY - rect.top;

    //   // Check if the mouse is inside the image area
    //   if (
    //     mouseX >= this.x - 70 &&
    //     mouseX <= this.x - 40 &&
    //     mouseY >= this.y - 0 &&
    //     mouseY <= this.y + 20
    //   ) {
    //     if (!isHovering) {
    //       isHovering = true;
    //       // Show hover text near the mouse cursor
    //       this.hoverElement = document.createElement("div");
    //       this.hoverElement.classList.add("hover_mouse_text");
    //       this.hoverElement.innerText = "Take Off";

    //       this.map.overworld.element.appendChild(this.hoverElement);

    //       //toggle sprite change
    //       //this.sprite.takeOffToggled();
    //       //this.takeOffActivated = false;
    //     }

    //     const scaleFactor = 3;
    //     // Adjust the mouse position for canvas scaling

    //     const adjustedMouseX = (event.clientX - rect.left) / scaleFactor;
    //     const adjustedMouseY = (event.clientY - rect.top) / scaleFactor;

    //     console.log(
    //       "adjusted mouse",
    //       adjustedMouseX,
    //       adjustedMouseY,
    //       "rect: ",
    //       rect.left,
    //       rect.top
    //     );

    //     // Update hover text position next to the mouse (adjust for scale)
    //     this.hoverElement.style.left = `${adjustedMouseX + 10}px`; // Offset 10px
    //     this.hoverElement.style.top = `${adjustedMouseY + 10}px`;
    //   } else {
    //     if (isHovering) {
    //       isHovering = false;
    //       console.log("Mouse left the image area");
    //       if (this.hoverElement) {
    //         this.hoverElement.remove();
    //         this.hoverElement = null;
    //       }
    //       // Reset hover action (remove hover effect)
    //       //ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    //       //ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight); // Redraw image without border
    //     }
    //   }
    // });

    // // Add a click event listener to detect clicks inside the hover area
    // a
  }

  createInteractiveText() {
    if (this.hoverElement) {
      this.hoverElement.remove();
      this.hoverElement = null;
    }
    // Show hover text near the mouse cursor
    this.hoverElement = document.createElement("div");
    this.hoverElement.classList.add("hover_mouse_text");

    if (this.takeOffActivated) {
      this.hoverElement.innerText = "Land Tardis (Click)";
    } else {
      //this.hoverElement.innerText = "Test";
      this.hoverElement.innerText = "Take Off (Click)";
      //this.hoverElement.innerText = "Land Tardis (R Key)";
    }

    this.map.overworld.element.appendChild(this.hoverElement);

    // Update hover text position next to the mouse (adjust for scale)
    this.hoverElement.style.left = `45%`; // Offset 10px
    this.hoverElement.style.top = `30%`;
  }

  update(state) {
    // TODO: add screen animation
    // called each game tick
    //console.log(this.map.gameObjects["hero"].x, this.map.gameObjects["hero"].y);

    if (
      this.map.gameObjects["hero"].x >= this.x - 30 &&
      this.map.gameObjects["hero"].x <= this.x + 10 &&
      this.map.gameObjects["hero"].y >= this.y - 20 &&
      this.map.gameObjects["hero"].y <= this.y + 20
    ) {
      //console.log("marching x, y");
      if (!this.isConsoleInteractiveActive) {
        this.isConsoleInteractiveActive = true;
        this.createInteractiveText();
      }
    } else {
      if (this.hoverElement) {
        this.hoverElement.remove();
        this.isConsoleInteractiveActive = false;
      }
    }
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
