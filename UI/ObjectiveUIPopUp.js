class ObjectiveUIPopUp {
  constructor(container) {
    this.container = container;
  }

  async createElement(objectiveName) {
    const element = document.createElement("div");
    element.classList.add("ObjectivePopUp-container");

    const header = document.createElement("h2");
    header.classList.add("ObjectivePopUp-header");
    header.innerText = "New Objective !!!";

    const objective = document.createElement("p");
    objective.classList.add("ObjectivePopUp-name");
    objective.innerText = objectiveName;

    element.appendChild(header);
    element.appendChild(objective);

    this.container.appendChild(element);

    // show pop up fro a second
    await utils.wait(1000);

    // after element appenmd, slowly start to fade it out
    let opacity = 1;
    for (let i = 0; i < 10; i++) {
      await utils.wait(200);
      opacity -= 0.1;
      element.style.opacity = opacity;
    }

    // then remove
    element.remove();
  }

  init(objective) {
    this.createElement(objective.name);
  }
}
