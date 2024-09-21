class CraftingState {
  constructor() {
    this.craftingOptions = {
      circuitboard: {
        name: "Circuit Board",
        type: "circuitBoard",
        levelRequired: 1,
        recipe: ["copper", "wires"],
      },
      wires: {
        name: "Wires",
        type: "wires",
        levelRequired: 1,
        recipe: ["copper"],
      },
      battery: {
        name: "Battery",
        type: "battery",
        levelRequired: 2,
        recipe: ["copper", "wires", "circuitBoard"],
      },
    };
    this.lineup = ["p1"];
    this.items = [
      { actionId: "item_recoverHp", instanceId: "item1" },
      { actionId: "item_recoverHp", instanceId: "item2" },
      { actionId: "item_recoverHp", instanceId: "item3" },
    ];
    this.storyFlags = {
      //"DID_SOMTHING": true,
      //TALKED_TO_ERIO: true,
    };
  }

  addPizza(pizzaId) {
    const newId = `p${Date.now()}` + Math.floor(Math.floor() * 99999);
    this.pizzas[newId] = {
      pizzaId,
      hp: 50,
      maxHp: 50,
      xp: 0,
      maxXp: 100,
      level: 1,
      status: null,
    };
    if (this.lineup.length < 3) {
      this.lineup.push(newId);
    }
    utils.emitEvent("LineupChanged");
    console.log(this);
  }

  swapLineup(oldId, incomingId) {
    const oldIndex = this.lineup.indexOf(oldId);
    this.lineup[oldIndex] = incomingId;
    utils.emitEvent("LineupChanged");
  }

  moveToFront(futureFrontId) {
    this.lineup = this.lineup.filter((id) => id !== futureFrontId);
    this.lineup.unshift(futureFrontId);
    utils.emitEvent("LineupChanged");
  }
}

window.crafting = new CraftingState();
