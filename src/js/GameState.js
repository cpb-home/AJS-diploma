export default class GameState {
  constructor() {
    this.gameLevel = 1;
    this.playerTeam = [];   // {char, position};
    this.compTeam = [];     // {char, position};
    this.selectedChar = {};
    this.turn = 'player';
    this.playerScore = 0;
    this.compScpre = 0;
  }

  static from(object) {
    // TODO: create object
    return null;
  }
}
