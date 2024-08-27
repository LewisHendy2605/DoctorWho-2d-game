const utils = {
  withGrid(n) {
    return n * 16;
  },
  asGridCoord(x, y) {
    return `${x * 16},${y * 16}`;
  },
  tardisCoordsOffset(x, y) {
    return { x: x + this.withGrid(2), y: y + this.withGrid(4) };
  },
  getMapCoordsFromMouse(hero, event) {
    const canvas = document.getElementById("gameCanvas");
    const rect = canvas.getBoundingClientRect();

    // Step 1: Get mouse coordinates relative to the canvas
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Step 2: Calculate scaling factor
    const scaleFactor = 3; // The scaling factor applied to the canvas

    // Adjust for scaling to get the true canvas coordinates
    const unscaledMouseX = mouseX / scaleFactor;
    const unscaledMouseY = mouseY / scaleFactor;

    // Step 3: Get hero position in unscaled canvas coordinates
    // The hero's position in the canvas needs to be adjusted based on scaling
    const heroCanvasX = canvas.width / 2;
    const heroCanvasY = canvas.height / 2;

    // Step 4: Calculate relative mouse position compared to hero
    const relativeX = unscaledMouseX - heroCanvasX;
    const relativeY = unscaledMouseY - heroCanvasY;

    // Step 5: Adjust for any drawing offsets
    const heroDrawOffsetX = 8; // Example offset
    const heroDrawOffsetY = 18; // Example offset

    const mapX = hero.x + relativeX + heroDrawOffsetX;
    const mapY = hero.y + relativeY + heroDrawOffsetY;

    // Step 6: Convert to grid coordinates (16x16 pixels per grid cell)
    const gridSize = 16;
    const mouseGridX = Math.floor(mapX / gridSize);
    const mouseGridY = Math.floor(mapY / gridSize);

    return { mouseGridX, mouseGridY };
  },

  nextPosition(initialX, initialY, direction) {
    let x = initialX;
    let y = initialY;
    const size = 16;
    if (direction === "left") {
      x -= size;
    } else if (direction === "right") {
      x += size;
    } else if (direction === "up") {
      y -= size;
    } else if (direction === "down") {
      y += size;
    }
    return { x, y };
  },
  setDynamicPath(src) {
    const basePath =
      window.location.hostname.includes("localhost") ||
      window.location.hostname.includes("127.0.0.1")
        ? ""
        : "/DoctorWho-2d-game";

    src = basePath + src;

    return src;
  },

  oppositeDirection(direction) {
    if (direction === "left") {
      return "right";
    }
    if (direction === "right") {
      return "left";
    }
    if (direction === "up") {
      return "down";
    }
    return "up";
  },

  // Faces obj1 towards obj2
  faceObjToOtherObj(obj1, obj2) {
    const { x: x1, y: y1 } = obj1;
    const { x: x2, y: y2 } = obj2;

    const deltaX = x2 - x1;
    const deltaY = y2 - y1;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      obj1.direction = deltaX > 0 ? "right" : "left";
    } else {
      obj1.direction = deltaY > 0 ? "down" : "up";
    }

    //console.log(`obj1 is now facing ${obj1.direction}`);
  },

  wait(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  },

  randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  emitEvent(name, detail) {
    const event = new CustomEvent(name, {
      detail,
    });
    document.dispatchEvent(event);
  },
};
