class Copper {
  // extends collectable
  constructor({ quantity }) {
    this.name = "Copper";
    this.type = "collectable";
    this.quantity = quantity;
    this.imageSrc = utils.setDynamicPath("/images/objects/Copper.png");
  }
}
