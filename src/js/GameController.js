import themes from "./themes";
import PositionedCharacter from "./PositionedCharacter";
import Bowman from "./characters/Bowman";
import Daemon from "./characters/Daemon";
import Swordsman from "./characters/Swordsman";
import Magician from "./characters/Magician";
import Undead from "./characters/Undead";
import Vampire from "./characters/Vampire";
import GameState from "./GameState";
//import GameStateService from './GameStateService';
import { generateTeam } from "./generators";

const gameState = new GameState();

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.places;
    this.messageTimeout = 0;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.gamePlay.drawUi(themes[this.theamSelect()]);
    const teams = this.createTeams(); // команды
    this.places = this.placeCharacters(teams); // позиции персонажей в массиве {character, position}

    this.gamePlay.redrawPositions(this.places);
    this.updateScores();

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
        //GamePlay.showError("Надо выбрать своего персонажа");
        this.showMessage('Надо выбрать своего персонажа', 'white');
      }
    } else {                                                                                          // если есть текущий персонаж
      this.playerTurn(index, playerChar, compChar);
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
      const allowedToTurn = this.findAllowedToTurn(gameState.selectedChar.position, gameState.selectedChar.character.type);
      const allowedToAttack = this.findAllowedToAttack(gameState.selectedChar.position, gameState.selectedChar.character.type);
      if (playerTeam) {                                                                                 // если навёл на своего
        this.gamePlay.setCursor("pointer");
      } else if (compTeam) {                                                                            // если навёл не на своего
        if (allowedToAttack.includes(index)) {
          this.gamePlay.setCursor("crosshair");
        } else {
          this.gamePlay.setCursor("not-allowed");
        }
      } else {                                                                                          // если навёл на пуст
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

    const playerTeam = generateTeam(playerTypes, gameState.gameLevel, gameState.gameLevel + 1 - gameState.playerTeam.length);
    if (gameState.playerTeam.length !== 0) {
      gameState.playerTeam.forEach(el => playerTeam.characters.push(el.character));
    }

    const pcTeam = generateTeam(pcTypes, gameState.gameLevel, gameState.gameLevel + 1 - gameState.compTeam.length);
    if (gameState.compTeam.length !== 0) {
      gameState.compTeam.forEach(el => pcTeam.characters.push(el.character));
    }

    gameState.playerTeam = [];
    gameState.compTeam = [];

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

    let newCell, currentPlayerCell, currentPCCell;
    for (let i = 0; i < teams.playerTeam.characters.length; i++) {
      if (gameState.playerTeam.length === 0) {
        currentPlayerCell = this.getRandomCell(playerFields);
      } else {
        let flag = false;
        do {
          newCell = this.getRandomCell(playerFields);
          flag = gameState.playerTeam.every(el => el.position !== newCell);
        } while (!flag);
        currentPlayerCell = newCell;
      }
      const charWithPlace = new PositionedCharacter(
        teams.playerTeam.characters[i],
        currentPlayerCell
      );
      gameState.playerTeam.push(charWithPlace);
      listOfCharacters.push(charWithPlace);
    }

    for (let i = 0; i < teams.pcTeam.characters.length; i++) {
      if (gameState.compTeam.length === 0) {
        currentPCCell = this.getRandomCell(pcFields);
      } else {
        let flag = false;
        do {
          newCell = this.getRandomCell(pcFields);
          flag = gameState.compTeam.every(el => el.position !== newCell);
        } while (!flag);
        currentPCCell = newCell;
      }
      const charWithPlace = new PositionedCharacter(
        teams.pcTeam.characters[i],
        currentPCCell
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

  findAllowedToAttack(position, type) {
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

    const searched = this.findTurns(position, turns);
    return searched;
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
        this.removeDiedChars();
      }

      let flag = false;
      if (gameState.turn === 'player') {
        gameState.playerScore += damage;
        flag = true;
      } else {
        gameState.compScore += damage;
      }
      gameState.turn = gameState.turn === 'comp' ? 'player' : 'comp';
      this.updateScores();
      this.gamePlay.redrawPositions(this.places);

      if (gameState.playerTeam.length === 0 || gameState.compTeam.length === 0) {     // если одна из команд пустая
        this.upStageGame();
      } else {                                                                        // если обе команды не пустые
        if (flag) {
          flag = false;
          this.compTurn();
        }
      }
    }); 
  }

  removeDiedChars() {
    const playerQuantity = gameState.playerTeam.length;
    const playerTeam = gameState.playerTeam.filter(el => el.character.health !== 0);
    gameState.playerTeam = [...playerTeam];
    if (playerQuantity !== gameState.playerTeam.length) {
      this.showMessage('Ваш персонаж был убит', 'red');
    }

    const compQuantity = gameState.compTeam.length;
    const compTeam = gameState.compTeam.filter(el => el.character.health !== 0);
    gameState.compTeam = [...compTeam];
    const forPlaces = this.places.filter(el => el.character.health !== 0);
    if (compQuantity !== gameState.compTeam.length) {
      this.showMessage('Персонаж компьютера был убит', 'orange');
    }

    this.places = [...forPlaces];
  }

  updateScores() {
    const playerScore = document.querySelector('.playerScore');
    const compScore = document.querySelector('.compScore');
    const hiScore = document.querySelector('.hiScore');
    playerScore.textContent = gameState.playerScore;
    compScore.textContent = gameState.compScore;
    hiScore.textContent = gameState.hiScore;
  }

  playerTurn(index, playerChar, compChar) { // ВЫБРАН СВОЙ ПЕРС
    gameState.turn = 'player';
    const allowedToTurn = this.findAllowedToTurn(gameState.selectedChar.position, gameState.selectedChar.character.type);
    const allowedToAttack = this.findAllowedToAttack(gameState.selectedChar.position, gameState.selectedChar.character.type);
    
    if (allowedToTurn.includes(index) || allowedToAttack.includes(index)) {                   // если на пути хода или атаки
      if (playerChar) {                                                                       // если ткнул в своего
        this.gamePlay.deselectCell(gameState.selectedChar.position);
        this.gamePlay.selectCell(index);
        gameState.selectedChar.character = playerChar.character;
        gameState.selectedChar.position = playerChar.position;
      } else if (compChar) {                                                                            // если ткнул в компа
        if (allowedToAttack.includes(index)) {
          this.attackRival(index, gameState.selectedChar.character, compChar.character);
          this.gamePlay.deselectCell(gameState.selectedChar.position);
          this.gamePlay.deselectCell(index);
          //this.gamePlay.redrawPositions(newTurns);
          gameState.selectedChar = {};
          this.showMessage('Вы успешно атаковали', 'yellow');
        }
      } else {                                                                                          // если ткнул в пустую клетку
        if (allowedToTurn.includes(index)) {
          const newTurns = [];
          newTurns.push({character: gameState.selectedChar.character, position: index});
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

          this.gamePlay.deselectCell(gameState.selectedChar.position);
          this.gamePlay.deselectCell(index);
          this.gamePlay.redrawPositions(newTurns);
          gameState.selectedChar = {};
          this.showMessage('Вы успешно сходили', 'rgba(117, 241, 148, 0.623)');
          this.compTurn();
        }
      }
    } else {                                                                                            // если НЕ на пути хода или атаки
      if (playerChar) {                                                                       // если ткнул в своего
        this.gamePlay.deselectCell(gameState.selectedChar.position);
        this.gamePlay.selectCell(index);
        gameState.selectedChar.character = playerChar.character;
        gameState.selectedChar.position = playerChar.position;
      }
    }
  }

  compTurn() {
    gameState.turn = 'comp';

    let subAttacker = null;
    let subTarget = null;
    gameState.compTeam.forEach(char => {          // перебираем каждого компа, есть ли в пределах видимость атакуемый
      const allowedToAttack = this.findAllowedToAttack(char.position, char.character.type);
      allowedToAttack.forEach(turn => {
        gameState.playerTeam.forEach(el => {
          if (el.position === turn) {
            subAttacker = char;
            subTarget = el;
            gameState.selectedChar.character = char.character;
            gameState.selectedChar.position = char.position;
          }
        });
      });
    });

    if (subAttacker !== null && subTarget !== null) { // проводим атаку, если нашли цель для атакие
      this.attackRival(subTarget.position, subAttacker.character, subTarget.character);
      gameState.selectedChar.character = subAttacker.character;
      gameState.selectedChar.position = subAttacker.position;
      this.gamePlay.deselectCell(gameState.selectedChar.position);
      this.gamePlay.deselectCell(subTarget.position);
      gameState.selectedChar = {};
    } else {                                          // раз не нашли цель для атаки, то ходим к ближайшему позорнику
      
      gameState.playerTeam.sort((a, b) => {   // выбираем с меньшей жизнью, а если равны, то с меньшим уровнем.
        if (a.character.health === b.character.health){
          return a.character.level - b.character.level;
        }
        return a.character.health - b.character.health;
      });
      const target = gameState.playerTeam[0];
  
      let attacker = null;
      gameState.compTeam.forEach(el => {
        if ((el.position - target.position) > 0) { // если элемент минус цель больше нуля
          if (attacker === null) {    // если нет аттакера
            attacker = el;
          } else {                    // если аттакер есть
            if (attacker.position > el.position) {
              attacker = el;
            }
          }
        } else {                                    // если элемент минус цель меньше нуля
          if (attacker === null) {    // если нет аттакера
            attacker = el;
          } else {                    // если аттакер есть
            if (attacker.position < el.position) {
              attacker = el;
            }
          }
        }
      });

      gameState.selectedChar.character = attacker.character;
      gameState.selectedChar.position = attacker.position;
      
      const allowedToTurn = this.findAllowedToTurn(gameState.selectedChar.position, gameState.selectedChar.character.type);
      
      let goTo;
      let compNotCompare = false;
      let playerNotCompare = false;
      do {
        goTo = Math.floor(Math.random()*allowedToTurn.length);
        compNotCompare = gameState.compTeam.every(el => el.position !== allowedToTurn[goTo]);
        playerNotCompare = gameState.playerTeam.every(el => el.position !== allowedToTurn[goTo]);
      } while ((compNotCompare === false) || (playerNotCompare === false));

      const newTurns = [];
      newTurns.push({character: gameState.selectedChar.character, position: allowedToTurn[goTo]});
      gameState.playerTeam.forEach(el => newTurns.push({character: el.character, position: el.position}));  // отправляем данные персов игрока
      
      gameState.compTeam.forEach(el => {                                                            // отправляем данные персов компа
        if (el.position !== gameState.selectedChar.position) {
          newTurns.push({character: el.character, position: el.position});
        } else {
          el.position = allowedToTurn[goTo];
        }
      });

      gameState.selectedChar.position = attacker.position;
      this.gamePlay.deselectCell(gameState.selectedChar.position);
      this.gamePlay.deselectCell(target.position);
      this.gamePlay.redrawPositions(newTurns);
      gameState.selectedChar = {};
    }







/*
    if (allowedToAttack.includes(target.position)) {                                // если можно атаковать, то атакуем
      
      
      this.attackRival(target.position, attacker.character, target.character);
      this.gamePlay.deselectCell(gameState.selectedChar.position);
      this.gamePlay.deselectCell(target.position);
      gameState.selectedChar = {};
    } else {                                                                        // если нельзя атаковать, ходим
      console.log('комп пропускает ход ' + target.position);
    }
      if (!allowedToTurn.includes(target.position)) {
        
        let index;
        let compNotCompare = false;
        let playerNotCompare = false;
console.log(allowedToTurn, gameState.compTeam);
        do {
          index = Math.floor(Math.random()*allowedToTurn.length); console.log('index = ' + index);
          compNotCompare = gameState.compTeam.every(el => el.position !== allowedToTurn[index]); console.log('allnotcompate =' + compNotCompare);
          playerNotCompare = gameState.playerTeam.every(el => el.position !== allowedToTurn[index]);
        } while ((compNotCompare === false) || (playerNotCompare === false));
        
        const newTurns = [];
        newTurns.push({character: gameState.selectedChar.character, position: allowedToTurn[index]});
        gameState.playerTeam.forEach(el => newTurns.push({character: el.character, position: el.position}));  // отправляем данные персов игрока
        
        gameState.compTeam.forEach(el => {                                                            // отправляем данные персов игрока
          if (el.position !== gameState.selectedChar.position) {
            newTurns.push({character: el.character, position: el.position});
          }
        });
        this.gamePlay.deselectCell(gameState.selectedChar.position);
        this.gamePlay.deselectCell(gameState.selectedChar.position);
        this.gamePlay.redrawPositions(newTurns);
        gameState.selectedChar = {};
      }
    }
*/

    //console.log(target, attacker);
  }

  showMessage(message, color = 'red') {
    const messageBox = document.querySelector('.messageBox');

    clearTimeout(this.messageTimeout);
    messageBox.style.color = color;
    messageBox.textContent = message;

    this.messageTimeout = setTimeout(() => messageBox.textContent = '', 2000);
  }

  upStageGame() {console.log(gameState.gameLevel);
    if (gameState.gameLevel < 4) {                                            // если уровень игры < 4, то повышаемся и играем дальше
      gameState.gameLevel++;

      this.gamePlay.drawUi(themes[this.theamSelect()]);
      const teams = this.createTeams();                                       // добираем команды
      this.places = this.placeCharacters(teams);                              // создаём позиции для персонажей
      this.gamePlay.redrawPositions(this.places);                             // размещаем всех на поле
/*
      this.updateScores();*/
    } else {                                                                  // если уровень игры 4 и выше, то конец игры
      this.finishTheGame();
    }
  }

  theamSelect() {
    switch (gameState.gameLevel) {
      case 1: 
        return 'prairie';
      case 2: 
        return 'desert';
      case 3:
        return 'arctic';
      case 4:
        return 'mountain';
    }
  }

  finishTheGame() {
    console.log("Игра окончена.");
  }
}