class SpeechBox {
  constructor({ text, who, onComplete }) {
    this.text = text;
    this.who = who;
    this.onComplete = onComplete;
    this.element = null;
    this.interrupted = false; // Flag to indicate if the event was interrupted
  }

  createElement() {
    // Create the element
    this.element = document.createElement("div");
    this.element.classList.add("SpeechBox");

    this.element.innerHTML = `
      <p class="SpeechBox_p">${this.who}: </p>
    `;

    // Init the typewriter effect
    this.revealingText = new RevealingText({
      element: this.element.querySelector(".SpeechBox_p"),
      text: this.text,
    });
  }

  done() {
    if (this.revealingText.isDone) {
      if (this.element) {
        this.element.remove();
        this.element = null;
        //this.actionListener.unbind();
      }
      this.onComplete(this.interrupted); // Pass the interrupted flag to the callback
    } else {
      this.revealingText.warpToDone();
    }
  }

  async init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();

    // Show text for 1 seconfd then close
    await utils.wait(1000);

    this.done();
  }
}
