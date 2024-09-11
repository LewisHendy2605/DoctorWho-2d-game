class KillScreen {
  constructor(config) {
    this.element = null;
    this.imagePath = utils.setDynamicPath(
      "/images/characters-doctor-who/doctor-regen.png"
    );
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("KillScreen");
    this.element.innerHTML = `
    <div class="KillScreen_textContainer">
    <h3 class="KillScreen_h3"> You Died </h3>
    <img src=${this.imagePath} class="KillScreen_img" />
    <p class="KillScreen_p"> Regenerating .... </p>
    </div>
    `;
  }

  fadeOut() {
    this.element.classList.add("fade-out");

    this.element.addEventListener(
      "animationend",
      () => {
        this.element.remove();
      },
      { once: true }
    );
  }

  init(container, callback) {
    this.createElement();

    container.appendChild(this.element);

    this.element.addEventListener(
      "animationend",
      () => {
        callback();
      },
      { once: true }
    );
  }
}
