class Titanium {
  // extends collectable
  constructor(config) {
    this.name = "Titanium";
    this.quantity = config.quantity;
    //this.imageSrc = utils.setDynamicPath("/images/objects/collectables/titanium.png")
    console.log("new titanium: ", config);
  }
}
