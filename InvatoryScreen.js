class InvatoryScreen {
  constructor({ map, invatory }) {
    if (map.gameObjects["hero"]) {
      this.hero = map.gameObjects["hero"];
    }

    this.map = map;
    this.invatory = invatory;
  }

  createElement() {
    this.parentElement = document.createElement("div");
    this.parentElement.classList.add("ParentInvatoryDiv");

    // Create HUD HTML with CSS classes
    this.element = document.createElement("div");
    this.element.classList.add("InvatoryScreen", "boxInvatory-cream");

    // Define the number of slots (e.g., 12 slots for a 3x4 grid)
    const maxSlots = 12;
    let slotElement = null;

    // Loop to create each grid slot
    for (let i = 0; i < maxSlots; i++) {
      // Create a container div for the slot
      slotElement = document.createElement("div");
      slotElement.classList.add("grid-item");

      // Add event listeners for drag and drop functionality
      slotElement.addEventListener("drop", utils.drop);
      slotElement.addEventListener("dragover", utils.allowDrop);

      // Check if there is an item to place in the slot
      if (i < this.invatory.length) {
        console.log("creating invatory, item: ", this.invatory[i], this);
        let item = this.invatory[i];

        if (item) {
          // Create a div to contain the item
          let itemDiv = document.createElement("div");
          itemDiv.classList.add("InvatoryScreen_item");
          itemDiv.setAttribute("draggable", "true"); // Make item draggable
          itemDiv.setAttribute("id", `item-${i}`); // Set unique ID for dragging

          itemDiv.addEventListener("dragstart", (event) => {
            // Store the item's ID
            event.dataTransfer.setData("text/plain", event.currentTarget.id);
          });

          const itemData = window.Items[item.type];

          // Append item image if available
          let imageElement = document.createElement("img");
          imageElement.src = utils.setDynamicPath(itemData.imageSrc);
          imageElement.classList.add("InvatoryScreen_item_img");
          itemDiv.appendChild(imageElement);

          // Append item text (e.g., name and quantity)
          let textElement = document.createElement("p");
          textElement.classList.add("InvatoryScreen_item_text");
          textElement.innerText = item.quantity
            ? item.name + ` - ×${item.quantity}`
            : item.name;
          itemDiv.appendChild(textElement);

          // Add the item div to the slot
          slotElement.appendChild(itemDiv);

          // add event listener to add to show add to invatory button
          slotElement.addEventListener("click", () =>
            this.showAddToInvButton(i, item, itemDiv)
          ); // or passing item
        }
      }

      // Append the slot element to the container
      this.element.appendChild(slotElement);
    }

    // after craeting box invatory, create player inv to transfer items to
    this.createPlayerInvatoryBox();

    // add both invatorys to parent element to be added to game screen
    this.parentElement.appendChild(this.element);
    this.parentElement.appendChild(this.playerInvatoryElement);
  }

  createPlayerInvatoryBox() {
    this.playerInvatoryElement = document.createElement("div");
    this.playerInvatoryElement.classList.add("InvatoryScreen_playerInv");

    // Define the number of slots (e.g., 12 slots for a 3x4 grid)
    const maxSlots = 12;
    let slotElement = null;

    // Loop to create each grid slot
    for (let i = 0; i < maxSlots; i++) {
      // Create a container div for the slot
      slotElement = document.createElement("div");
      slotElement.classList.add("grid-item");

      // Add event listeners for drag and drop functionality
      slotElement.addEventListener("drop", utils.drop);
      slotElement.addEventListener("dragover", utils.allowDrop);

      // Check if there is an item to place in the slot
      if (i < this.hero.invatory.length) {
        let item = this.hero.invatory[i];

        // Create a div to contain the item
        let itemDiv = document.createElement("div");
        itemDiv.classList.add("InvatoryScreen_item");
        itemDiv.setAttribute("draggable", "true"); // Make item draggable
        itemDiv.setAttribute("id", `item-${i}`); // Set unique ID for dragging

        itemDiv.addEventListener("dragstart", (event) => {
          // Store the item's ID
          event.dataTransfer.setData("text/plain", event.currentTarget.id);
        });

        const itemData = window.Items[item.type];

        // Append item image

        let imageElement = document.createElement("img");
        imageElement.src = utils.setDynamicPath(itemData.imageSrc);
        imageElement.classList.add("InvatoryScreen_item_img");
        itemDiv.appendChild(imageElement);

        // Append item text (e.g., name and quantity)
        let textElement = document.createElement("p");
        textElement.classList.add("InvatoryScreen_item_text");
        textElement.innerText = item.quantity ? ` - ×${item.quantity}` : "";
        itemDiv.appendChild(textElement);

        // Add the item div to the slot
        slotElement.appendChild(itemDiv);
      }

      // Append the slot element to the container
      this.playerInvatoryElement.appendChild(slotElement);
    }
  }

  showAddToInvButton(i, item, divElement) {
    console.log(i, item, divElement);
    const addScreen = document.createElement("div");
    addScreen.classList.add("InvatoryScreen_addScreen");
    addScreen.innerText = "Add To Your Invatory ?";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");

    const noButton = document.createElement("div");
    noButton.classList.add("InvatoryScreen_noButton");
    noButton.innerText = "No";
    noButton.addEventListener("click", () => {
      addScreen.remove();
    });
    buttonContainer.appendChild(noButton);

    const addButton = document.createElement("div");
    addButton.classList.add("InvatoryScreen_addButton");
    addButton.innerText = "Add";
    addButton.addEventListener("click", () => {
      addScreen.remove();
      // swap item to hero or user
      //this.invatory[i] = null;
      // Remove item from inventory using splice
      this.invatory.splice(i, 1);
      this.hero.invatory.push(item);
      // this.hero.addInvatorItem(item)
      // reset screen
      this.done();
      this.createElement();
      this.container.appendChild(this.parentElement);
    });
    buttonContainer.appendChild(addButton);

    /// add utton conaienr to screen
    addScreen.appendChild(buttonContainer);

    this.element.appendChild(addScreen);
  }

  done() {
    this.parentElement.remove();
  }

  addFonts() {
    const doctorWhoFontUrl = utils.setDynamicPath("/fonts/Drwho42.ttf");
    const doctorWho2FontUrl = utils.setDynamicPath("/fonts/dr2.ttf");

    const style = document.createElement("style");
    style.innerHTML = `
            @font-face {
              font-family: "DoctorWho";
              src: url(${doctorWhoFontUrl}) format("truetype");
            }
            @font-face {
              font-family: "DoctorWho2";
              src: url(${doctorWho2FontUrl}) format("truetype");
            }
            .ConsoleScreen {
              font-family: "DoctorWho";
            }
          `;
    document.head.appendChild(style);
  }

  init(container) {
    this.container = container;
    this.addFonts();
    this.createElement();
    //this.createElementCanvas();

    //console.log("adding to screen", this.element, container);
    container.appendChild(this.parentElement);
  }
}
