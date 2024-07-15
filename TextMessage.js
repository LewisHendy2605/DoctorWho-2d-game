class TextMessage {
  constructor({ text, onComplete }) {
    this.text = text;
    this.onComplete = onComplete;
    this.element = null;
    this.interrupted = false; // Flag to indicate if the event was interrupted
  }

  createElement() {
    // Create the element
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");

    this.element.innerHTML = `
    <p class="TextMessage_p">${this.text}</p>
    <button class="TextMessage_button">Next</button>
  `;

    this.element.querySelector("button").addEventListener("click", () => {
      this.done();
    });

    this.actionListener = new KeyPressListener("Enter", () => {
      this.actionListener.unbind();
      this.done();
    });

    // Cancel if walk away
    const handlePersonStartWalk = () => {
      document.removeEventListener("PersonStartWalk", handlePersonStartWalk);
      this.interrupted = true; // Set the interrupted flag
      this.done();
    };

    document.addEventListener("PersonStartWalk", handlePersonStartWalk);
  }

  done() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.onComplete(this.interrupted); // Pass the interrupted flag to the callback
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
  }
}
