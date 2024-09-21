class CircuitBoard {
  // extends collectable
  constructor({ quantity }) {
    this.type = "circuitBoard";
    this.item = window.Items[this.type];
    if (this.item) {
      this.name = this.item.name;
      this.quantity = quantity;
      this.imageSrc = utils.setDynamicPath(this.item.imageSrc);
    }
  }
}
