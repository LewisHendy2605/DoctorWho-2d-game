class Battery {
  // extends collectable
  constructor({ quantity }) {
    this.name = "Battery";
    this.type = "collectable";
    this.quantity = quantity;
    this.imageSrc = utils.setDynamicPath("/images/objects/battery.png");
  }
}
