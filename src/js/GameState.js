export default class GameState {
  constructor() {
    this.gameLevel = 1;
    this.playerTeam = [];   // {char, position};
    this.compTeam = [];     // {char, position};
    this.selectedChar = -1;      // int
    this.selectedChar = {};
  }

  static from(object) {
    // TODO: create object
    return null;
  }
}
