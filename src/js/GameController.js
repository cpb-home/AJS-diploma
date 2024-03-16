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
    const playerChar = gameState.playerTeam.find((el) => el.position === index);
    const compChar = gameState.compTeam.find((el) => el.position === index);

    if (Object.keys(gameState.selectedChar).length === 0) {                                           // если нет текущего персонажа
      if (playerChar) {                                                                                 // если ткнул в своего персонажа
        this.gamePlay.selectCell(index);
        gameState.selectedChar.character = playerChar.character;
        gameState.selectedChar.position = playerChar.position;
      } else {                                                                                          // если ткнул не в своего
        GamePlay.showError("Надо выбрать своего персонажа");
      }
    } else {                                                                                          // если есть текущий персонаж
      const allowedToTurn = this.findAllowedToTurn(gameState.selectedChar.position, gameState.selectedChar.character.type);
      if (allowedToTurn.includes(index)) {
        if (playerChar) {                                                                                 // если ткнул в своего
          this.gamePlay.deselectCell(gameState.selectedChar.position);
          this.gamePlay.selectCell(index);
          gameState.selectedChar.character = playerChar.character;
          gameState.selectedChar.position = playerChar.position;
        } else if (compChar) {                                                                            // если ткнул в компа
          this.attackRival(index, gameState.selectedChar.character, compChar.character);
          this.gamePlay.deselectCell(gameState.selectedChar.position);
          this.gamePlay.deselectCell(index);
          //this.gamePlay.redrawPositions(newTurns);
          gameState.selectedChar = {};
        } else {                                                                                          // если ткнул в пустую клетку
          const newTurns = [];
          newTurns.push({character: gameState.selectedChar.character, position: index});
          //console.log(gameState.compTeam, gameState.playerChar);
          gameState.compTeam.forEach(el => {                                                              // отправляем данные персов компа
            if (el.position !== gameState.selectedChar.position) {
              newTurns.push({character: el.character, position: el.position});
            } else {
              el.position = index;
            }
          });
          gameState.playerTeam.forEach(el => {                                                            // отправляем данные персов игрока
            if (el.position !== gameState.selectedChar.position) {
              newTurns.push({character: el.character, position: el.position});
            } else {
              el.position = index;
            }
          });
          //gameState.selectedChar.position = index;
          //console.log(gameState.selectedChar.position, index);
          this.gamePlay.deselectCell(gameState.selectedChar.position);
          this.gamePlay.deselectCell(index);
          this.gamePlay.redrawPositions(newTurns);
          gameState.selectedChar = {};
        }
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
        // если атакуемая клетка в списке доступных для атаки
        this.gamePlay.setCursor("crosshair");
      } else {                                                                                          // если навёл на пустое поле
        // если наведенная клетка в списке доступных для перехода
        const allowedToTurn = this.findAllowedToTurn(gameState.selectedChar.position, gameState.selectedChar.character.type);
        if (allowedToTurn.includes(index)) {
          this.gamePlay.setCursor("pointer");
          this.gamePlay.selectCell(index, "green");
        } else {
          this.gamePlay.setCursor("not-allowed");
        }
      }
    }
  }

  onCellLeave(index) {
    const playerTeam = gameState.playerTeam.find((el) => el.position === index);
    this.gamePlay.hideCellTooltip(index);
    if (!playerTeam) {
      this.gamePlay.deselectCell(index);
    }
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

  findAllowedToTurn(position, type) {
    let turns;
    switch (type) {
      case 'swordsman':
      case 'undead':
        turns = 4;
        break;
      case 'bowman':
      case 'vampire':
        turns = 2;
        break;
      case 'magician':
      case 'daemon':
        turns = 1;
    }

    const searched = this.findTurns(position, turns);
    return searched;
  }

  findAllowedToAttack(index, type) {
    let turns;
    switch (type) {
      case 'swordsman':
      case 'undead':
        turns = 1;
        break;
      case 'bowman':
      case 'vampire':
        turns = 2;
        break;
      case 'magician':
      case 'daemon':
        turns = 4;
    }

    this.findTurns(index, turns);

    return [];
  }

  findTurns(position, turns) {
    const currentRow = (this.getFieldRows().find(array => array.includes(position))).sort((a, b) => a - b);
    const elRowPosition = currentRow.findIndex(e => e === position);
    const currentCol = (this.getFieldCols().find(array => array.includes(position))).sort((a, b) => a - b);
    const elColPosition = currentCol.findIndex(e => e === position);
    const currentRigthToLeftDiag = (this.getRightToLeftDiag().find(array => array.includes(position))).sort((a, b) => a - b);
    const elRigthToLeftDiagPosition = currentRigthToLeftDiag.findIndex(e => e === position);
    const currentLeftToRightDiag = (this.getLeftToRightDiag().find(array => array.includes(position))).sort((a, b) => a - b);
    const elLeftToRightDiagPosition = currentLeftToRightDiag.findIndex(e => e === position);

    const turnTop = [];
    const turnTopRight = [];
    const turnRight = [];
    const turnBottomRight = [];
    const turnBottom = [];
    const turnBottomLeft = [];
    const turnLeft = [];
    const turnTopLeft = [];

    for (let i = 1; i <= turns; i++) {
      if ((elColPosition - i) >= 0) {
        turnTop.push(position - i*8);
      }
      if ((elColPosition + i) < currentCol.length) {
        turnBottom.push(position + i*8);
      }
      if ((elRowPosition + i) < currentRow.length) {
        turnRight.push(position + i);
      }
      if ((elRowPosition - i) >= 0) {
        turnLeft.push(position - i);
      }
      if ((elRigthToLeftDiagPosition - i) >= 0) {
        turnTopRight.push(currentRigthToLeftDiag[elRigthToLeftDiagPosition - i]);
      }
      if ((elRigthToLeftDiagPosition + i) < currentRigthToLeftDiag.length) {
        turnBottomLeft.push(currentRigthToLeftDiag[elRigthToLeftDiagPosition + i]);
      }
      if ((elLeftToRightDiagPosition - i) >= 0) {
        turnTopLeft.push(currentLeftToRightDiag[elLeftToRightDiagPosition - i]);
      }
      if ((elLeftToRightDiagPosition + i) < currentLeftToRightDiag.length) {
        turnBottomRight.push(currentLeftToRightDiag[elLeftToRightDiagPosition + i]);
      }
    }

    return [].concat(turnTop, turnTopRight, turnRight, turnBottomRight, turnBottom, turnBottomLeft, turnLeft, turnTopLeft);
  }

  getFieldRows() {
    const rows = [];

    let rowsArr = [];
    for (let i = 0; i < this.gamePlay.boardSize**2; i++) {
      if (rowsArr.length == this.gamePlay.boardSize) {
        rows.push(rowsArr);
        rowsArr = [];
        rowsArr.push(i);
      } else if (i == (this.gamePlay.boardSize**2 - 1)) {
        rowsArr.push(i);
        rows.push(rowsArr);
      } else {
        rowsArr.push(i);
      }
    }

    return rows;
  }

  getFieldCols() {
    let colsArr = [];

    for (let i = 0; i < this.gamePlay.boardSize; i++) {
      colsArr.push([]);
    }
    let j = 0;
    for (let i = 0; i < this.gamePlay.boardSize**2; i++) {
      if (j < this.gamePlay.boardSize) {
        colsArr[j].push(i);
        j++;
      } else {
        j = 0;
        colsArr[j].push(i);
        j++;
      }
    }

    return colsArr;
  }

  getRightToLeftDiag() {
    const rows = this.getFieldRows();
    const diags = [];
  
    for (let i = 0; i < (this.gamePlay.boardSize * 2 - 1); i++) {
      diags.push([]);
    }
    
    for (let i = 0; i < this.gamePlay.boardSize; i++) {
      for (let j = 0; j < (i + 1); j++) {
        diags[i].push(rows[j][i-j]);
      }
    }
  
    for (let i = 1; i < (this.gamePlay.boardSize); i++) {
      for (let j = (this.gamePlay.boardSize - 1); j > (i - 1); j--) {
        diags[i + this.gamePlay.boardSize - 1].push(rows[j][this.gamePlay.boardSize - 1 + i - j]);
      }
    }

    return diags;
  }

  getLeftToRightDiag() {
    const rows = this.getFieldRows();
    const diags = [];
    
    for (let i = 0; i < (this.gamePlay.boardSize * 2 - 1); i++) {
      diags.push([]);
    }
    
    for (let i = 0; i < this.gamePlay.boardSize; i++) {
      for (let j = 0; j < (i + 1); j++) {
        diags[i].push(rows[this.gamePlay.boardSize - 1 - j][i - j]);
      }
    }
  
    for (let i = 1; i < this.gamePlay.boardSize; i++) {
      for (let j = 0; j < (this.gamePlay.boardSize - i); j++) {
        diags[i + this.gamePlay.boardSize - 1].push(rows[j][i + j]);
      }
    }
  
    return diags;
  }

  attackRival(index, attacker, target) {
    const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
    this.gamePlay.showDamage(index, damage).then(() => {
      if ((target.health - damage) > 0) {
        target.health -= damage;
      } else {
        target.health = 0;
        gameState.compTeam.splice(gameState.compTeam.findIndex(el => el.character.health === 0), 1);
        gameState.playerTeam.splice(gameState.playerTeam.findIndex(el => el.character.health === 0), 1);
        this.places.splice(this.places.findIndex(el => el.character.health === 0), 1);
      }
      //this.places = this.placeCharacters(teams);
      this.gamePlay.redrawPositions(this.places);
    });
    
  }
}