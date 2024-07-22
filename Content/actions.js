window.Actions = {
  damage1: {
    name: "Whomp!",
    sucsess: [
      { type: "textMessage", text: "{CASTER} uses {ACTION} !!" },
      { type: "animation", animation: "spin" },
      { type: "stateChange", damage: 10 },
    ],
  },
  saucyStatus: {
    name: "Tomato Squeeze",
    targetType: "friendly",
    sucsess: [
      { type: "textMessage", text: "{CASTER} uses {ACTION} !!" },
      { type: "stateChange", status: { type: "saucy", expresIn: 3 } },
    ],
  },
  clumsyStatus: {
    name: "Olive oil",
    sucsess: [
      { type: "textMessage", text: "{CASTER} uses {ACTION} !!" },
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "clumsy", expresIn: 3 } },
      { type: "textMessage", text: "{TARGET} is slipping all around!!" },
    ],
  },

  // Items
  item_recoverStatus: {
    name: "Heating Lamp",
    description: "Feeling fresh and warm",
    targetType: "friendly",
    sucsess: [
      { type: "textMessage", text: "{CASTER} uses a {ACTION}!!" },
      { type: "stateChange", status: null },
      { type: "textMessage", text: "Feeling fresh!" },
    ],
  },
  item_recoverHp: {
    name: "Parmesan",
    targetType: "friendly",
    sucsess: [
      { type: "textMessage", text: "{CASTER} sprinkles on some {ACTION}!!" },
      { type: "stateChange", recover: 10 },
      { type: "textMessage", text: "{CASTER} recovers HP!" },
    ],
  },
};
