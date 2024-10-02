class TardisState {
  constructor() {
    this.landed = false;
    this.destination = "Earth_Town";
    this.oldDestination = null;
    this.heroX;
    this.heroY;
    //   this.lineup = ["p1"];
    //   this.items = [
    //     { actionId: "item_recoverHp", instanceId: "item1" },
    //     { actionId: "item_recoverHp", instanceId: "item2" },
    //     { actionId: "item_recoverHp", instanceId: "item3" },
    //   ];
    //   this.storyFlags = {
    //     //"DID_SOMTHING": true,
    //     //TALKED_TO_ERIO: true,
    //   };
  }

  updateDestination(newDestination) {
    this.oldDestination = this.destination;
    this.destination = newDestination;
  }

  updateLanded() {
    if (this.landed === false) {
      this.landed = true;
    } else {
      this.landed = false;
    }
  }
}

window.tardisState = new TardisState();
