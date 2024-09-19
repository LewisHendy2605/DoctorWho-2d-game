class Wires {
  // extends collectable
  constructor({ quantity }) {
    this.name = "Wires";
    this.type = "collectable";
    this.quantity = quantity;
    this.imageSrc = utils.setDynamicPath("/images/objects/wires.png");
  }
}
