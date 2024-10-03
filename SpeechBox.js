class SpeechBox {
  constructor({ text, who, onComplete, fontSize, responseOptions }) {
    this.text = text;
    this.who = who;
    this.onComplete = onComplete;
    this.fontSize = fontSize;
    this.responseOptions = responseOptions;
    this.element = null;
    this.interrupted = false; // Flag to indicate if the event was interrupted

    this.done = this.done.bind(this);
  }

  createElement() {
    // Create the element
    this.element = document.createElement("div");
    this.element.classList.add("SpeechBox");

    // create image for speeck box
    // this.imageElement = document.createElement("img");
    // this.imageElement.classList.add("SpeechBox_img");
    // this.imageElement.src = utils.setDynamicPath(
    //   "/images/ui/UI_Hologram_Button_Large_Lock_02a2.png"
    // );
    // this.element.appendChild(this.imageElement);
    // console.log("appended image eleemnt", this.element, this.imageElement);

    //this.element.style.backgroundImage = `url("/images/ui/UI_Hologram_Button_Large_Lock_02a2.png")`;
    // if (this.fontSize) {
    //   this.element.style.fontSize = this.fontSize;
    // }

    this.element.innerHTML = `
        <img src ="${utils.setDynamicPath(
          "/images/ui/UI_Hologram_Button_Large_Lock_02a2.png"
        )}" class="SpeechBox_img">
        <div class="SpeechBox_container">
          <p class="SpeechBox_p">${utils.capitalizeFirstLetter(this.who)}: </p>
        </div>
    `;

    if (this.fontSize) {
      this.pElement = this.element.querySelector(".SpeechBox_p");
      this.pElement.style.fontSize = this.fontSize;
    }

    // Init the typewriter effect
    this.revealingText = new RevealingText({
      element: this.element.querySelector(".SpeechBox_p"),
      text: this.text,
    });
  }

  doneResolve() {
    // Finish type writing
    if (!this.revealingText.isDone) {
      this.revealingText.warpToDone();
    }

    // Remove element and resove event with callback
    if (this.element) {
      this.element.remove();
      this.element = null;
      //this.actionListener.unbind();
    }
    this.onComplete();
  }

  done() {
    console.log("done called:");
    // Finish type writing
    if (!this.revealingText.isDone) {
      this.revealingText.warpToDone();
    }

    // Remove element and resove event with callback
    if (this.element) {
      this.element.remove();
      this.element = null;
      //this.actionListener.unbind();
    }
    //this.onComplete();
  }

  async init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();
    return this.done;

    // Show text for 1 seconfd then close
    // await utils.wait(1000);

    // this.done();
  }
}
