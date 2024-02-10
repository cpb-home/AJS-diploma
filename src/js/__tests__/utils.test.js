import { calcTileType } from '../utils';

test.each([
  ['top-left', 0, 8],
  ['top-right', 7, 8],
  ['top', 5, 8],
  ['bottom-left', 56, 8],
  ['bottom-right', 63, 8],
  ['bottom', 60, 8],
  ['right', 15, 8],
  ['left', 8, 8],
  ['center', 46, 8]
])(
  ('Tests for %s field'),
  (reply, index, boardSize) => {
    
    expect(calcTileType(index, boardSize)).toEqual(reply);
  }
)