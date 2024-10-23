class HudUI {
  constructor(character, imgPath) {
    this.character = character;
    this.imgPath = utils.setDynamicPath(imgPath);
    this.sonicImgPath = utils.setDynamicPath("/images/ui/sonic-ui.png");
    this.container = document.querySelector(".game-container");

    this.isPlayerMenuActive = false;
    this.playerMenuActiveScreen = "";

    this.isSonicMenuActive = false;
    this.sonic - null;

    // crafting variables
    this.subScreenActive = false;
  }

  createElement() {
    // creaet hud HTML
    this.element = document.createElement("div");
    this.element.classList.add("HudUI");
    this.element.innerHTML = `
    <div class="HudContainer">
      <img src="${utils.setDynamicPath(
        "/images/ui/UI_Hologram_Fillbar_04a.png"
      )}" class="HudUI_Background_Img" />
    
      <div class="HudUI_Elements">
          <img src="${this.imgPath}" class="HudUI_img " />
          <div class="HudUI_sonic hidden">
          <img src="${this.sonicImgPath}" class="HudUI_sonic_img" />
          
          </div>
        </div>
      </div>
    `;

    // <div class="HudUI_sonic_mode_div">
    //         <p class="HudUI_sonic_mode_p"> Mode: ${
    //           this.character.sonicScrewdriver.activeMode.name
    //         } </p>
    //       </div>

    // <h3 class="HudUI_p_name">${utils.capitalizeFirstLetter(
    //   this.character.type
    // )}</h3>

    //<p class="HudUI_sonic_img"> Mode: ${
    //  this.character.sonicScrewdriver.activeMode.name
    // } </p>

    // Store references to the images for later manipulation
    this.image = this.element.querySelector(".HudUI_img");
    this.sonicImage = this.element.querySelector(".HudUI_sonic_img");
    this.sonicHud = this.element.querySelector(".HudUI_sonic");

    // amke sonic element interactibale
    //this.sonicElement = this.element.querySelector(".HudUI_sonic_img");
    this.sonicHud.addEventListener("click", () => this.addOrRemoveSonicHUD());

    this.image.addEventListener("click", () => this.addOrRemoveDoctorHUD());

    // Show sonic hud if we have to
    if (this.character.sonicScrewdriver.isSonicEquipped) {
      this.toggleSonicVisibility();
    }
  }
  addOrRemoveDoctorHUD() {
    console.log("Doctor clicked");
    //toggleSonic;
    // if active hide menu
    if (this.isPlayerMenuActive) {
      this.clearPlayerMenuScreen();
      // remove screen + update tracker
      this.playerHudMenu.remove();
      this.isPlayerMenuActive = false;
    } else {
      // else add it to hud
      this.playerHudMenu = document.createElement("div");
      this.playerHudMenu.classList.add("PlayerHudUI");
      this.playerHudMenu.innerHTML = `
      
      <div class="PlayerHudUI_header"> 
        <p class="PlayerHudUI_header_option invatory">Invatory</p> 
        <p class="PlayerHudUI_header_option objectives">Objectives</p> 
        <p class="PlayerHudUI_header_option skills">Skills</p> 
        <p class="PlayerHudUI_header_option crafting">Crafting</p> 
        <p class="PlayerHudUI_header_option map">Map</p> 
      </div>
      `;
      // <h3 class="PlayerHudUI_title">${"Player Menu"}</h3>
      // <p class="SonicHudUI_option"> Settings </p>

      // Add listeners to show the relevant screen when header iption is clicked
      //invatory
      this.invatoryHeaderElem = this.playerHudMenu.querySelector(
        ".PlayerHudUI_header_option.invatory"
      );
      this.invatoryHeaderElem.addEventListener("click", () =>
        this.addInvatoryScreen()
      );
      //objectives
      this.objectivesHeaderElem = this.playerHudMenu.querySelector(
        ".PlayerHudUI_header_option.objectives"
      );
      this.objectivesHeaderElem.addEventListener("click", () =>
        this.addObjectivesScreen()
      );
      //skills
      this.skillsHeaderElem = this.playerHudMenu.querySelector(
        ".PlayerHudUI_header_option.skills"
      );
      this.skillsHeaderElem.addEventListener("click", () =>
        this.addSkillsScreen()
      );
      //crafting
      this.craftingHeaderElem = this.playerHudMenu.querySelector(
        ".PlayerHudUI_header_option.crafting"
      );
      this.craftingHeaderElem.addEventListener("click", () =>
        this.addCraftingScreen()
      );
      // map
      this.mapHeaderElem = this.playerHudMenu.querySelector(
        ".PlayerHudUI_header_option.map"
      );
      this.mapHeaderElem.addEventListener("click", () => this.addMapScreen());

      // show invatory to start
      this.addInvatoryScreen();

      this.gameContainer = document.querySelector(".game-container");

      // // add elemet to game container
      this.gameContainer.appendChild(this.playerHudMenu);
      this.isPlayerMenuActive = true;
    }
  }

  clearPlayerMenuScreen() {
    this.removeInvatoryScreen();
    this.removeSkillsScreen();
    this.removeMapScreen();
    this.removeCraftingScreen();
    this.removeObjectivesScreen();
  }

  // addInvatoryScreen() {
  //   this.clearPlayerMenuScreen();
  //   console.log("invatory clicked");

  //   this.playerMenuActiveScreen = "invatory";
  //   if (!this.invatoryHeaderElem.classList.contains("active")) {
  //     this.invatoryHeaderElem.classList.add("active");
  //   }

  //   if (!this.invatoryScreen) {
  //     console.log("creating invatory");

  //     // Create invatory screen if not created
  //     this.invatoryScreen = document.createElement("div");
  //     this.invatoryScreen.classList.add("InvatoryScreen");

  //     // Add player image
  //     this.playerImg = document.createElement("img");
  //     this.playerImg.classList.add("InvatoryScreen_playerImg");
  //     this.playerImg.src = utils.setDynamicPath(
  //       "/images/characters-doctor-who/doctor-single-16-32.png"
  //     );
  //     this.invatoryScreen.appendChild(this.playerImg);

  //     // Create inventory container
  //     this.invatoryContainer = document.createElement("div");
  //     this.invatoryContainer.classList.add("inventory-box");
  //     this.invatoryScreen.appendChild(this.invatoryContainer);

  //     // Define the number of slots (e.g., 12 slots for a 3x4 grid)
  //     const maxSlots = 12;
  //     let tempElement = null;

  //     // Loop to create each grid slot
  //     for (let i = 0; i < maxSlots; i++) {
  //       tempElement = document.createElement("div");
  //       tempElement.classList.add("grid-item");

  //       // Fill in inventory items, otherwise mark as empty
  //       if (i < this.character.invatory.length) {
  //         let item = this.character.invatory[i];
  //         tempElement.classList.add("InvatoryScreen_item");
  //         tempElement.setAttribute("draggable", "true"); // Make item draggable
  //         tempElement.setAttribute("id", `item-${i}`); // Set unique ID for dragging

  //         tempElement.addEventListener("dragstart", (event) => {
  //           console.log("drag start", event.target);
  //           event.dataTransfer.setData("text/plain", event.target.id); // Store the item's ID
  //           //event.dataTransfer.setData("text/plain", event.target.class);
  //         });

  //         // Append item image if available
  //         if (item.imageSrc) {
  //           let imageElement = document.createElement("img");
  //           imageElement.src = item.imageSrc;
  //           imageElement.classList.add("InvatoryScreen_item_img");
  //           tempElement.appendChild(imageElement);
  //         }

  //         // Append item text (e.g., name and quantity)
  //         let textElement = document.createElement("p");
  //         textElement.classList.add("InvatoryScreen_item_text");
  //         textElement.innerText =
  //           item.type === "collectable"
  //             ? item.name + ` - ×${item.quantity}`
  //             : item.name;
  //         tempElement.appendChild(textElement);
  //       } else {
  //         // If there are no more items, make it an empty slot
  //         tempElement.classList.add("empty");

  //         // Set up event listeners for drop and drag over
  //         tempElement.addEventListener("drop", utils.drop);
  //         tempElement.addEventListener("dragover", utils.allowDrop);
  //       }

  //       // Append the grid item to the container
  //       this.invatoryContainer.appendChild(tempElement);
  //     }

  //     // Append the entire inventory screen to the HUD
  //     this.playerHudMenu.appendChild(this.invatoryScreen);
  //   }
  // }

  addInvatoryScreen() {
    this.clearPlayerMenuScreen();
    //console.log("invatory clicked");

    this.playerMenuActiveScreen = "invatory";
    if (!this.invatoryHeaderElem.classList.contains("active")) {
      this.invatoryHeaderElem.classList.add("active");
    }

    if (!this.invatoryScreen) {
      //console.log("creating invatory");

      // Create invatory screen if not created
      this.invatoryScreen = document.createElement("div");
      this.invatoryScreen.classList.add("InvatoryScreen");

      // Add player image
      this.playerImg = document.createElement("img");
      this.playerImg.classList.add("InvatoryScreen_playerImg");
      this.playerImg.src = utils.setDynamicPath(
        "/images/characters-doctor-who/doctor-single-16-32.png"
      );
      this.invatoryScreen.appendChild(this.playerImg);

      // Create inventory container
      this.invatoryContainer = document.createElement("div");
      this.invatoryContainer.classList.add("inventory-box");
      this.invatoryScreen.appendChild(this.invatoryContainer);

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
        if (i < this.character.invatory.length) {
          let item = this.character.invatory[i];

          // Create a div to contain the item
          let itemDiv = document.createElement("div");
          itemDiv.classList.add("InvatoryScreen_item");
          itemDiv.setAttribute("draggable", "true"); // Make item draggable
          itemDiv.setAttribute("id", `item-${i}`); // Set unique ID for dragging

          itemDiv.addEventListener("dragstart", (event) => {
            // Store the item's ID
            event.dataTransfer.setData("text/plain", event.currentTarget.id);
          });

          // get item data
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
            ? itemData.name + ` - ×${item.quantity}`
            : itemData.name;
          itemDiv.appendChild(textElement);

          // Add the item div to the slot
          slotElement.appendChild(itemDiv);
        }

        // Append the slot element to the container
        this.invatoryContainer.appendChild(slotElement);
      }

      // Append the entire inventory screen to the HUD
      this.playerHudMenu.appendChild(this.invatoryScreen);
    }
  }

  removeInvatoryScreen() {
    if (this.invatoryScreen) {
      this.invatoryScreen.remove();
    }

    if (this.invatoryHeaderElem.classList.contains("active")) {
      this.invatoryHeaderElem.classList.remove("active");
    }

    // reset menu elements
    //this.invatoryHeaderElem = null;
    this.invatoryScreen = null;
  }

  addObjectivesScreen() {
    this.clearPlayerMenuScreen();
    if (!this.objectivesHeaderElem.classList.contains("active")) {
      this.objectivesHeaderElem.classList.add("active");
    }
    if (!this.objectivesScreen) {
      // create invatory screen if not created
      this.objectivesScreen = document.createElement("div");
      this.objectivesScreen.classList.add("ObjectivesScreen");

      // Create  container
      this.objectivesContainer = document.createElement("div");
      this.objectivesContainer.classList.add("objectives-container");

      // add objevtives to container
      if (this.character.objectives.length > 0) {
        for (let i = 0; i < this.character.objectives.length; i++) {
          // craete container for objective
          let objectsivesElementContainer = document.createElement("div");
          objectsivesElementContainer.classList.add(
            "objectives-element-container"
          );

          // create objectives element
          let objectsivesElement = document.createElement("div");
          objectsivesElement.classList.add("objectives-element");
          objectsivesElement.innerText = this.character.objectives[i].name;

          console.log(this.character.objectives[i]);
          // create checkboc for eobjective
          //if (this.character.objectives[0].completed) {
          let objectiveCheckBox = document.createElement("div");
          objectiveCheckBox.classList.add("objectives-checkbox");
          //}

          // add text + box to elemt container
          objectsivesElementContainer.appendChild(objectsivesElement);
          objectsivesElementContainer.appendChild(objectiveCheckBox);

          // add elemnt to container
          this.objectivesContainer.appendChild(objectsivesElementContainer);
        }
      }

      // create map img
      // this.mapImg = document.createElement("img");
      // this.mapImg.classList.add("MapScreen_img");
      // this.mapImg.src = this.character.map.lowerImage.src;
      // // add to map screen
      // this.mapScreen.appendChild(this.mapImg);

      // add conatiner to screen
      this.objectivesScreen.appendChild(this.objectivesContainer);

      // add elemet to game container
      this.playerHudMenu.appendChild(this.objectivesScreen);
    }
  }

  removeObjectivesScreen() {
    if (this.objectivesScreen) {
      this.objectivesScreen.remove();
    }

    if (this.objectivesHeaderElem.classList.contains("active")) {
      this.objectivesHeaderElem.classList.remove("active");
    }

    // reset menu elements
    this.objectivesScreen = null;
  }

  addSkillsScreen() {
    this.clearPlayerMenuScreen();
    //console.log("skills clicked");
    this.playerMenuActiveScreen = "skills";
    if (!this.skillsHeaderElem.classList.contains("active")) {
      this.skillsHeaderElem.classList.add("active");
    }
  }

  removeSkillsScreen() {
    if (this.skillsScreen) {
      this.skillsScreen.remove();
    }

    if (this.skillsHeaderElem.classList.contains("active")) {
      this.skillsHeaderElem.classList.remove("active");
    }

    // reset menu elements
    this.skillsScreen = null;
  }

  addMapScreen() {
    this.clearPlayerMenuScreen();
    console.log("map clicked");
    if (!this.mapHeaderElem.classList.contains("active")) {
      this.mapHeaderElem.classList.add("active");
    }
    if (!this.mapScreen) {
      console.log("creating map");
      // create invatory screen if not created
      this.mapScreen = document.createElement("div");
      this.mapScreen.classList.add("MapScreen");

      // create map img
      this.mapImg = document.createElement("img");
      this.mapImg.classList.add("MapScreen_img");
      this.mapImg.src = this.character.map.lowerImage.src;
      // add to map screen
      this.mapScreen.appendChild(this.mapImg);

      // add elemet to game container
      this.playerHudMenu.appendChild(this.mapScreen);
    }
  }

  removeMapScreen() {
    if (this.mapScreen) {
      this.mapScreen.remove();
    }

    if (this.mapHeaderElem.classList.contains("active")) {
      this.mapHeaderElem.classList.remove("active");
    }

    // reset menu elements
    this.mapScreen = null;
  }

  addCraftingScreen() {
    this.clearPlayerMenuScreen();
    console.log("crafting clicked");

    this.playerMenuActiveScreen = "crafting";
    if (!this.craftingHeaderElem.classList.contains("active")) {
      this.craftingHeaderElem.classList.add("active");
    }

    if (!this.craftingScreen) {
      console.log("creating invatory");

      // Create invatory screen if not created
      this.craftingScreen = document.createElement("div");
      this.craftingScreen.classList.add("CraftingScreen");

      // Create  container
      this.craftingContainer = document.createElement("div");
      this.craftingContainer.classList.add("crafting-container");
      this.craftingScreen.appendChild(this.craftingContainer);

      // Add player image
      // this.playerImg = document.createElement("img");
      // this.playerImg.classList.add("InvatoryScreen_playerImg");
      // this.playerImg.src = utils.setDynamicPath(
      //   "/images/characters-doctor-who/doctor-single-16-32.png"
      // );
      // this.invatoryScreen.appendChild(this.playerImg);

      // // Define the number of slots (e.g., 12 slots for a 3x4 grid)
      // const maxSlots = 12;
      // let slotElement = null;

      //console.log(window.crafting);
      const craftingItems = window.crafting.craftingOptions;

      // // Loop to create each grid slot
      for (const [key, item] of Object.entries(craftingItems)) {
        console.log(item);
        // Create a container div for the slot
        let slotElement = document.createElement("div");
        slotElement.classList.add("crafting-item");

        let itemDiv = document.createElement("div");
        itemDiv.classList.add("InvatoryScreen_item");

        // Append item image if available
        let craftingItem = window.Items[item.type];
        if (craftingItem) {
          let imageElement = document.createElement("img");
          imageElement.src = utils.setDynamicPath(craftingItem.imageSrc);
          imageElement.classList.add("InvatoryScreen_item_img");
          if (
            window.playerState.level < item.levelRequired ||
            !this.canCraft(item.recipe, this.character.invatory)
          ) {
            imageElement.style.filter = "brightness(50%)"; // Darken the image
            // or use opacity
            // imageElement.style.opacity = "0.5";
          }
          itemDiv.appendChild(imageElement);
        }

        // show info + carfting button when hovered over
        slotElement.addEventListener("click", () =>
          this.toggleCraftingOption(slotElement, item)
        );

        slotElement.appendChild(itemDiv);

        this.craftingContainer.appendChild(slotElement);
      }

      // Append the entire inventory screen to the HUD
      this.playerHudMenu.appendChild(this.craftingScreen);
    }
  }

  removeCraftingScreen() {
    if (this.craftingScreen) {
      this.craftingScreen.remove();
    }

    if (this.craftingHeaderElem.classList.contains("active")) {
      this.craftingHeaderElem.classList.remove("active");
    }

    // reset menu elements
    this.craftingScreen = null;
  }

  toggleCraftingOption(slotElement, craftingItem) {
    console.log(
      "toggleCraftingOption clickd, this.subScreenActive:",
      this.subScreenActive
    );
    if (!this.subScreenActive) {
      this.subScreenActive = true;
      this.showCraftingOption(slotElement, craftingItem);
    } else {
      this.subScreenActive = false;
      this.hideCraftingOption();
    }
  }

  showCraftingOption(slotElement, craftingItem) {
    this.craftingSubScreen = document.createElement("div");
    this.craftingSubScreen.classList.add("craftingSubScreen");

    // Get the bounding rectangle of the crafting item
    const rect = slotElement.getBoundingClientRect();
    console.log("grid-item rect:", rect);

    // Scaling factor
    const scale = 3; // Adjust this based on your actual scaling factor
    const transformOffset = -50; // Adjust this based on your transform value

    // Adjust the position for scale and transform
    this.craftingSubScreen.style.left = `${
      rect.right / scale + transformOffset - 20
    }px`; // Shift left slightly
    this.craftingSubScreen.style.top = `${rect.top / scale - 70}px`; // Shift up slightly

    const title = document.createElement("h3");
    title.classList.add("craftingSubScreen_title");
    title.innerText = craftingItem.name;
    this.craftingSubScreen.appendChild(title);

    const info = document.createElement("p");
    info.classList.add("craftingSubScreen_p");
    info.innerText = "Level Required: " + craftingItem.levelRequired;
    this.craftingSubScreen.appendChild(info);

    const recipeItemContainer = document.createElement("div");
    recipeItemContainer.classList.add("recipeItemContainer");

    const recipeItemContainerText = document.createElement("p");
    recipeItemContainerText.innerText = "Recipie: ";
    recipeItemContainer.appendChild(recipeItemContainerText);

    // Loop through the recipe items and create an image for each
    craftingItem.recipe.forEach((itemType) => {
      const itemContainer = document.createElement("div");
      itemContainer.classList.add("craftingSubScreen_item_container");

      const recipeImg = document.createElement("img");
      recipeImg.classList.add("craftingSubScreen_recipeImg");
      recipeImg.src = utils.setDynamicPath(window.Items[itemType].imageSrc);
      // Append each recipe image to the container
      itemContainer.appendChild(recipeImg);

      // create text element
      const recipe = document.createElement("p");
      recipe.classList.add("craftingSubScreen_recipe");
      recipe.innerText = itemType;
      itemContainer.appendChild(recipe);

      recipeItemContainer.appendChild(itemContainer);
    });

    this.craftingSubScreen.appendChild(recipeItemContainer);

    const craftButton = document.createElement("button");
    craftButton.classList.add("craftingSubScreen_craftButton");
    if (this.canCraft(craftingItem.recipe, this.character.invatory)) {
      craftButton.innerText = "Craft Item";
      craftButton.addEventListener("click", () => this.craftItem(craftingItem));
    } else {
      craftButton.innerText = "Need resourse to craft";
    }

    this.craftingSubScreen.appendChild(craftButton);

    //slotElement.appendChild(this.craftingSubScreen);
    this.craftingContainer.appendChild(this.craftingSubScreen);
  }

  hideCraftingOption() {
    if (this.craftingSubScreen) {
      this.craftingSubScreen.remove();
    }
  }

  craftItem(craftingItem) {
    // Loop through the crafting recipe
    craftingItem.recipe.forEach((recipeItem) => {
      // Find the index of the item in the inventory
      const index = this.character.invatory.findIndex(
        (item) => item.type === recipeItem
      );
      // If the item exists in the inventory, remove one
      if (index !== -1 && this.character.invatory[index].quantity > 0) {
        this.character.invatory[index].quantity -= 1; // Decrease the quantity
        // If the quantity reaches 0, remove the item from the inventory
        if (this.character.invatory[index].quantity === 0) {
          this.character.invatory.splice(index, 1);
        }
      }
    });

    // Add the crafted item to the inventory
    const craftedItem = {
      type: craftingItem.type,
      quantity: 1,
    };
    this.character.invatory.push(craftedItem);

    // update UI
    this.toggleCraftingOption();
    this.removeCraftingScreen();
    this.addCraftingScreen();
  }

  canCraft(recipe, inventory) {
    return recipe.every(
      (recipeItem) => inventory.some((item) => item.type === recipeItem) // Adjust according to your item's property
    );
  }

  // addOrRemoveSonicHUD() {
  //   console.log("sonic clicked");
  //   //toggleSonic;
  //   // if active hide menu
  //   if (this.isSonicMenuActive) {
  //     this.sonicHudMenu.remove();
  //     this.isSonicMenuActive = false;
  //   } else {
  //     // else add it to hud
  //     this.sonicHudMenu = document.createElement("div");
  //     this.sonicHudMenu.classList.add("SonicHudUI");
  //     this.sonicHudMenu.innerHTML = `
  //     <h3 class="SonicHudUI_title">${"Sonic Modes"}</h3>

  //     `;
  //     // <p class="SonicHudUI_option"> Settings </p>

  //     // Set up conrtrols for sonic
  //     //console.log("Sonic: ", this.sonic.modes);
  //     // create sonic menu options
  //     let tempElement = null;
  //     this.character.sonicScrewdriver.modes.forEach((element) => {
  //       tempElement = document.createElement("p");
  //       tempElement.classList.add("SonicHudUI_option");
  //       tempElement.innerText = element.name;
  //       tempElement.addEventListener("click", () =>
  //         this.sonicModeOptionClicked(element)
  //       );
  //       this.sonicHudMenu.appendChild(tempElement);
  //     });

  //     // add elemet to game container
  //     this.element.appendChild(this.sonicHudMenu);
  //     this.isSonicMenuActive = true;
  //   }
  // }

  addOrRemoveSonicHUD() {
    if (this.isSonicMenuActive) {
      this.sonicMenu.end();
      this.isSonicMenuActive = false;
    } else {
      this.isSonicMenuActive = true;

      let options = [];

      for (let obj of this.character.sonicScrewdriver.modes) {
        let option = {
          label: obj.name,
          class: "choose-dest",
          handler: () => {
            this.addOrRemoveSonicHUD();

            this.sonicModeOptionClicked(obj);
          },
        };
        options.push(option);
      }

      this.sonicMenu = new SonicMenu({
        map: this.character.map,
        user: this.character,
        onComplete: () => {
          //this.sonicMenu.end();
          //resolve();
        },
        options: options,
      });
      this.sonicMenu.init(document.querySelector(".game-container"));
    }
  }
  sonicModeOptionClicked(elem) {
    //this.character.sonicScrewdriver.activeMode = elem;
    this.character.sonicScrewdriver.setActiveMode(elem);

    // Update the text of the sonic mode paragraph
    const modeParagraph = this.element.querySelector(".HudUI_sonic_mode_p");
    modeParagraph.textContent = `Mode: ${elem.name}`;

    // Close sonic menu after selection
    this.addOrRemoveSonicHUD();
  }

  toggleSonicVisibility() {
    // Toggle the 'hidden' class to show or hide the images
    //console.log(this.element.innerHTML);
    this.sonicHud.classList.toggle("hidden");
  }

  createElementCanvas() {
    // Create a new div element
    this.element = document.createElement("div");
    this.element.classList.add("HudUI");

    // Create and configure the canvas element
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Define the size of the canvas to match your image's dimensions
    const imageSize = 32; // Example size, replace with your actual image size
    canvas.width = imageSize;
    canvas.height = imageSize;

    // Set image smoothing to false
    context.imageSmoothingEnabled = false;
    context.imageSmoothingQuality = "high";

    // Create an image object
    const img = new Image();
    img.src = this.imgPath;

    // Draw the image on the canvas once it has loaded
    img.onload = () => {
      context.drawImage(img, 0, 0, 16, 16);
    };

    // Append the canvas to the div
    this.element.appendChild(canvas);

    // Optionally, add a paragraph for HUD text
    const p = document.createElement("p");
    p.classList.add("HudUI_p");
    p.textContent = "HUD";
    this.element.appendChild(p);
  }

  update() {}

  done() {
    this.element.remove();
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
    this.addFonts();
    this.createElement();
    //this.createElementCanvas();
    this.container.appendChild(this.element);
  }
}
