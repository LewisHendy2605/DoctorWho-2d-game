class PauseMenu {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
  }

  getOptions(pageKey) {
    // Case 1: Show the first page of options
    if (pageKey === "root") {
      const lineupPizzas = playerState.lineup.map((id) => {
        const { pizzaId } = playerState.pizzas[id];
        const base = Pizzas[pizzaId];
        return {
          label: base.name,
          description: base.description,
          handler: () => {
            this.keyboardMenu.setOptions(this.getOptions(id));
          },
        };
      });

      return [
        ...lineupPizzas,
        {
          label: "Save",
          description: "Save your progress",
          handler: () => {
            // Well come back to this
          },
        },
        {
          label: "Close",
          description: "Close the pause menu",
          handler: () => {
            this.close();
          },
        },
      ];
    }

    // Case 2: Show the options for just one pizza (id)
    const unequipped = Object.keys(playerState.pizzas)
      .filter((id) => {
        return playerState.lineup.indexOf(id) === -1;
      })
      .map((id) => {
        const { pizzaId } = playerState.pizzas[id];
        const base = Pizzas[pizzaId];
        return {
          label: `Swap for ${base.name}`,
          description: base.description,
          handler: () => {
            playerState.swapLineup(pageKey, id);
            this.keyboardMenu.setOptions(this.getOptions("root"));
          },
        };
      });

    return [
      ...unequipped,
      {
        label: "Move to front",
        description: "Move this pizza to the front of the list",
        handler: () => {
          playerState.moveToFront(pageKey);
          this.keyboardMenu.setOptions(this.getOptions("root"));
        },
      },
      {
        label: "Back",
        description: "Back to the root menu",
        handler: () => {
          this.keyboardMenu.setOptions(this.getOptions("root"));
        },
      },
    ];
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("PauseMenu");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = `
        <h2>Pause Menu</h2>
        

        `;
  }

  close() {
    this.esc?.unbind();
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  init(container) {
    console.log("Container: ", container);
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container,
    });
    console.log("this.element", this.element);
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions("root"));

    console.log("keyboardmenu: ", this.keyboardMenu);
    console.log("element: ", this.element);

    container.appendChild(this.element);

    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    });

    // Add touch event listener to menu options
    this.element.addEventListener("touchstart", (event) => {
      const optionElement = event.target.closest(".option-button");
      if (optionElement) {
        const index = Array.from(
          this.element.querySelectorAll(".option-button")
        ).indexOf(optionElement);
        this.keyboardMenu.selectOption(index);
      }
    });
  }
}
