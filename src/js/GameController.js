import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import { generateTeam } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.prairie);

    const teams = this.createTeams();

    this.gamePlay.redrawPositions(this.placeCharacters(teams));
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }

  createTeams() {
    const playerTypes = [Bowman, Swordsman, Magician];
    const pcTypes = [Undead, Vampire, Daemon];
    const playerTeam = generateTeam(playerTypes, 4, 2);
    const pcTeam = generateTeam(pcTypes, 4, 2);
    return {playerTeam, pcTeam};
  }

  placeCharacters(teams) {
    const playerFields = [];
    const pcFields = [];

    playerFields.push(...this.getStartPositionsArray(0));
    playerFields.push(...this.getStartPositionsArray(1));
    pcFields.push(...this.getStartPositionsArray(6));
    pcFields.push(...this.getStartPositionsArray(7));

    const listOfCharacters = [];

    let lastPlayerCell, lastPCCell, currentPlayerCell, currentPCCell;
    for (let i = 0; i < teams.playerTeam.characters.length; i++) {
      currentPlayerCell = this.getRandomCell(playerFields);
      while (currentPlayerCell === lastPlayerCell) {
        currentPlayerCell = this.getRandomCell(playerFields);
      }
      lastPlayerCell = currentPlayerCell;
      listOfCharacters.push(new PositionedCharacter(teams.playerTeam.characters[i], lastPlayerCell));
    }

    for (let i = 0; i < teams.pcTeam.characters.length; i++) {
      currentPCCell = this.getRandomCell(pcFields);
      while (currentPCCell === lastPCCell) {
        currentPCCell = this.getRandomCell(pcFields);
      }
      lastPCCell = currentPCCell;
      listOfCharacters.push(new PositionedCharacter(teams.pcTeam.characters[i], lastPCCell));
    }

    return listOfCharacters;
  }

  getStartPositionsArray(start) {
    const array = [];
    for (let i = start; i < 64; i+=8) {
      array.push(i);
    }
    return array;
  }

  getRandomCell(cells) {
    return cells[Math.floor(Math.random() * cells.length)];
  }
}
