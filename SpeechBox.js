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
    this.imageElement = document.createElement("img");
    this.imageElement.classList.add("SpeechBox_img");
    this.imageElement.src = utils.setDynamicPath(
      "/images/ui/UI_Hologram_Button_Large_Lock_02a2.png"
    );
    this.element.appendChild(this.imageElement);

    // create speech elemnt
    this.speechContainer = document.createElement("div");
    this.speechContainer.classList.add("SpeechBox_container");
    this.speech = document.createElement("p");
    this.speech.innerText = `${utils.capitalizeFirstLetter(this.who)}: `;
    this.speech.classList.add("SpeechBox_p");

    this.speechContainer.appendChild(this.speech);
    this.element.appendChild(this.speechContainer);

    console.log("response options: ", this.responseOptions);

    // this.element.appendChild(this.responseContainer);

    // this.element.innerHTML = `
    //     <img src ="${utils.setDynamicPath(
    //       "/images/ui/UI_Hologram_Button_Large_Lock_02a2.png"
    //     )}" class="SpeechBox_img">
    //     <div class="SpeechBox_container">
    //       <p class="SpeechBox_p">${utils.capitalizeFirstLetter(this.who)}: </p>
    //     </div>
    // `;

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

  // createResponseElement() {
  //   if (this.responseOptions.length > 0) {
  //     for (let i = 0; i < this.responseOptions.length; i++) {
  //       // for (let i = 0; i < 2; i++) {
  //       let response = document.createElement("div");
  //       response.classList.add("response");

  //       let responseImg = document.createElement("img");
  //       responseImg.classList.add("response_img");
  //       responseImg.src = utils.setDynamicPath(
  //         "/images/ui/UI_Hologram_Banner_03a.png"
  //       );
  //       response.appendChild(responseImg);

  //       let responseText = document.createElement("p");
  //       responseText.classList.add("response_p");
  //       responseText.innerText = `"${this.responseOptions[i].text}"`;
  //       response.appendChild(responseText);

  //       this.responseContainer.appendChild(response);

  //       // add event listerneers to response
  //       response.addEventListener("click", () => {
  //         console.log("response clicked:", this.responseOptions[i].text);
  //         this.responseFromUser = this.responseOptions[i].text;
  //         resolve(this.responseOptions[i].text);
  //       });
  //     }
  //   }
  // }

  async createResponseElement(resolve) {
    this.responseContainer = document.createElement("div");
    this.responseContainer.classList.add("responseContainer");

    if (this.responseOptions.length > 0) {
      for (let i = 0; i < this.responseOptions.length; i++) {
        // for (let i = 0; i < 2; i++) {
        let response = document.createElement("div");
        response.classList.add("response");

        let responseImg = document.createElement("img");
        responseImg.classList.add("response_img");
        responseImg.src = utils.setDynamicPath(
          "/images/ui/UI_Hologram_Banner_03a.png"
        );
        response.appendChild(responseImg);

        let responseText = document.createElement("p");
        responseText.classList.add("response_p");
        responseText.innerText = `"${this.responseOptions[i].text}"`;
        response.appendChild(responseText);

        this.responseContainer.appendChild(response);

        this.container.appendChild(this.responseContainer);

        // add event listerneers to response
        response.addEventListener("click", () => {
          console.log("response clicked:", this.responseOptions[i].text);
          this.responseFromUser = this.responseOptions[i].text;
          resolve(this.responseOptions[i].text);
        });
      }
    }
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

    if (this.responseContainer) {
      this.responseContainer.remove();
      this.responseContainer = null;
      //this.actionListener.unbind();
    }
    //this.onComplete();
  }

  init(container) {
    this.container = container;
    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();
    return this.done;
    // return { done: this.done, response: this.responseFromUser };
    // Show text for 1 seconfd then close
    // await utils.wait(1000);

    // this.done();
  }

  async awaitResults() {
    console.log("waitin for rresponse");
    const responseFromPlayer = await new Promise((res) =>
      this.createResponseElement(res)
    );

    return responseFromPlayer;
  }

  // async init(container) {
  //   this.createElement();
  //   container.appendChild(this.element);
  //   this.createResponseElement();
  //   container.appendChild(this.responseContainer);
  //   this.revealingText.init();
  //   return this.done;
  //   // return { done: this.done, response: this.responseFromUser };
  //   // Show text for 1 seconfd then close
  //   // await utils.wait(1000);

  //   // this.done();
  // }
}
