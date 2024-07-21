window.Actions = {
  damage1: {
    name: "Whomp!",
    sucsess: [
      { type: "textMessage", text: "{CASTER} uses {ACTION} !!" },
      { type: "animation", animation: "spin" },
      { type: "stateChange", damage: 10 },
    ],
  },
};
