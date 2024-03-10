import themes from "./themes";
import PositionedCharacter from "./PositionedCharacter";
import Bowman from "./characters/Bowman";
import Daemon from "./characters/Daemon";
import Swordsman from "./characters/Swordsman";
import Magician from "./characters/Magician";
import Undead from "./characters/Undead";
import Vampire from "./characters/Vampire";
import GameState from "./GameState";
import GamePlay from "./GamePlay";
//import GameStateService from './GameStateService';
import { generateTeam } from "./generators";

const gameState = new GameState();

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.places;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.gamePlay.drawUi(themes.prairie);
    const teams = this.createTeams(); // команды
    this.places = this.placeCharacters(teams); // позиции персонажей в массиве {character, position}

    this.gamePlay.redrawPositions(this.places);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    const playerTeam = gameState.playerTeam.find((el) => el.position === index);
    const compTeam = gameState.compTeam.find((el) => el.position === index);

    if (Object.keys(gameState.selectedChar).length === 0) {                                           // если нет текущего персонажа
      if (playerTeam) {                                                                                 // если ткнул в своего персонажа
        this.gamePlay.selectCell(index);
        gameState.selectedChar.character = playerTeam.character;
        gameState.selectedChar.position = playerTeam.position;
      } else {                                                                                          // если ткнул не в своего
        GamePlay.showError("Надо выбрать своего персонажа");
      }
    } else {                                                                                          // если есть текущий персонаж
      if (playerTeam) {                                                                                 // если ткнул в своего
        this.gamePlay.deselectCell(gameState.selectedChar.position);
        this.gamePlay.selectCell(index);
        gameState.selectedChar.character = playerTeam.character;
        gameState.selectedChar.position = playerTeam.position;
      } else if (compTeam) {                                                                            // если ткнул в компа   
        
      } else {                                                                                          // если ткнул ни в кого

      }
    }
  }

  onCellEnter(index) {
    const playerTeam = gameState.playerTeam.find((el) => el.position === index);
    const compTeam = gameState.compTeam.find((el) => el.position === index);

    if (playerTeam || compTeam) {
      this.gamePlay.showCellTooltip(this.getCharInfo(index), index);
    }

    if (Object.keys(gameState.selectedChar).length === 0) {                                           // если нет текущего персонажа
      if (playerTeam) {                                                                                 // если навёл на своего
        this.gamePlay.setCursor("pointer");
      } else {                                                                                          // если навёл не на своего
        this.gamePlay.setCursor("not-allowed");
      }
    } else {                                                                                          // если есть текущий персонаж
      if (playerTeam) {                                                                                 // если навёл на своего
        this.gamePlay.setCursor("pointer");
      } else if (compTeam) {                                                                            // если навёл не на своего
        this.gamePlay.setCursor("crosshair");
      } else {                                                                                          // если навёл на пустое поле
        this.gamePlay.setCursor("not-allowed");
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }

  createTeams() {
    const playerTypes = [Bowman, Swordsman, Magician];
    const pcTypes = [Undead, Vampire, Daemon];
    const playerTeam = generateTeam(playerTypes, 4, 2);
    const pcTeam = generateTeam(pcTypes, 4, 2);
    return { playerTeam, pcTeam };
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
      const charWithPlace = new PositionedCharacter(
        teams.playerTeam.characters[i],
        lastPlayerCell
      );
      gameState.playerTeam.push(charWithPlace);
      listOfCharacters.push(charWithPlace);
    }

    for (let i = 0; i < teams.pcTeam.characters.length; i++) {
      currentPCCell = this.getRandomCell(pcFields);
      while (currentPCCell === lastPCCell) {
        currentPCCell = this.getRandomCell(pcFields);
      }
      lastPCCell = currentPCCell;
      const charWithPlace = new PositionedCharacter(
        teams.pcTeam.characters[i],
        lastPCCell
      );
      gameState.compTeam.push(charWithPlace);
      listOfCharacters.push(charWithPlace);
    }

    return listOfCharacters;
  }

  getStartPositionsArray(start) {
    const array = [];
    for (let i = start; i < 64; i += 8) {
      array.push(i);
    }
    return array;
  }

  getRandomCell(cells) {
    return cells[Math.floor(Math.random() * cells.length)];
  }

  getCharInfo(index) {
    const char =
      gameState.compTeam.find((el) => el.position === index) ||
      gameState.playerTeam.find((el) => el.position === index);
    if (char) {
      return `\u{1F396}${char.character.level} \u{2694}${char.character.attack} \u{1F6E1}${char.character.defence} \u{2764}${char.character.health}`;
    }
  }
}
