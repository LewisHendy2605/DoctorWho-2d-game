class TextMessage {
  constructor({ text, fontSize = null, height = null, onComplete }) {
    this.text = text;
    this.fontSize = fontSize;
    this.height = height;
    this.onComplete = onComplete;
    this.element = null;
    this.interrupted = false; // Flag to indicate if the event was interrupted
  }

  createElement() {
    // Create the element
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");

    this.element.innerHTML = `
    <p class="TextMessage_p"></p>
    <button class="TextMessage_button">Next</button>
  `;

    // dynamc adjusting of font from event
    if (this.fontSize) {
      const pElement = this.element.querySelector(".TextMessage_p");
      pElement.style.fontSize = this.fontSize;
    }

    if (this.height) {
      console.log("height adjusted", this.fontSize);
      this.element.style.height = this.height;
    }

    // Init the typewriter effect
    this.revealingText = new RevealingText({
      element: this.element.querySelector(".TextMessage_p"),
      text: this.text,
    });

    this.element.querySelector("button").addEventListener("click", () => {
      // Close the text message
      this.done();
    });

    this.actionListener = new KeyPressListener("Enter", () => {
      this.done();
    });

    // Cancel if walk away
    const handlePersonStartWalk = () => {
      console.log("person walked daway");
      document.removeEventListener("PersonStartWalk", handlePersonStartWalk);
      this.interrupted = true; // Set the interrupted flag
      this.revealingText.warpToDone();
      this.done();
    };

    document.addEventListener("PersonStartWalk", handlePersonStartWalk);
  }

  done() {
    if (this.revealingText.isDone) {
      if (this.element) {
        this.element.remove();
        this.element = null;
        this.actionListener.unbind();
      }
      this.onComplete(this.interrupted); // Pass the interrupted flag to the callback
    } else {
      this.revealingText.warpToDone();
    }
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();
  }
}
