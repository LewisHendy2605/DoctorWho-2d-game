class CircuitBoard {
  // extends collectable
  constructor({ quantity }) {
    this.name = "CircuitBoard";
    this.type = "collectable";
    this.quantity = quantity;
    this.imageSrc = utils.setDynamicPath("/images/objects/circuitboard.png");
  }
}
