class TurnCycle {
  constructor({ battle, onNewEvent }) {
    this.battle = battle;
    this.onNewEvent = onNewEvent;
    this.currentTeam = "player"; // or enemy
  }

  async turn() {
    // get the caster
    const casterId = this.battle.activeCombatants[this.currentTeam];
    const caster = this.battle.combatants[casterId];
    // Get the enemy
    const enemyId =
      this.battle.activeCombatants[
        this.currentTeam === "player" ? "enemy" : "player"
      ];
    const enemy = this.battle.combatants[enemyId];

    const submission = await this.onNewEvent({
      type: "submissionMenu",
      caster,
      enemy,
    });
    const resultingEvent = submission.action.sucsess;
    for (let i = 0; i < resultingEvent.length; i++) {
      const event = {
        ...resultingEvent[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };

      await this.onNewEvent(event);
    }

    this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
    this.turn();
  }

  async init() {
    await this.onNewEvent({
      type: "textMessage",
      text: "The battle is starting",
    });

    // Start the first turn
    this.turn();
  }
}
