class Menu {
  constructor(config = {}) {
    this.options = []; // Options array
    this.title = config.title || ""; // Title of the menu
    this.element = null;
  }

  setOptions(options) {
    this.options = options;
    this.renderOptions();
  }

  renderOptions() {
    // Render the title and options
    this.element.innerHTML = `
        <h3 class="menu-title">${this.title}</h3>
        ${this.options
          .map((option, index) => {
            const disabledAttr = option.disabled ? "disabled" : "";
            const className = option.class
              ? `class="${option.class} optionButton"`
              : "";
            return `
              <div class="option">
                  <button ${className} ${disabledAttr} data-button="${index}">
                      ${option.label}
                  </button>
                  <span class="right">${
                    option.right ? option.right() : ""
                  }</span>
              </div>`;
          })
          .join("")}
      `;

    // Add event listeners to buttons
    this.element.querySelectorAll("button").forEach((button) => {
      // Handle button clicks
      button.addEventListener("click", () => {
        const chosenOption = this.options[Number(button.dataset.button)];
        chosenOption.handler();
      });
    });
  }

  setDataElement(data, backButtonFunc) {
    // this.element.innerHTML = `
    //     <p>${data}</p>
    //   `;

    ///<h3 class="menu-title">Title</h3>

    // TO DO make back button go back
    this.element.innerHTML = `
      <div class="sonic-menu-data-header">
        <button class="sonic-menu-data-header-backBtn">Back</button>
        <h3 class="menu-data-title">Scan Results</h3>
      </div>
      <div class="sonic-menu-data-container">
      ${data
        .map((option, index) => {
          return `
            <div class="sonicDataElement">
               <p>${option.type}: ${option.data}</p>
            </div>`;
        })
        .join("")}
        </div>
    `;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("Menu");
  }

  hide() {
    this.element.style.display = "none";
  }
  unhide() {
    this.element.style.display = "block";
  }

  end() {
    // Remove the menu element
    this.element.remove();
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.renderOptions();
  }
}
