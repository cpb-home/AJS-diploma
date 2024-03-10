import Bowman from '../Bowman';

test('creating bowerman', () => {
  const result = new Bowman(1);
  
  expect(result).toEqual({health: 100, level: 1, attack: 25, defence: 25, type: 'bowman'});
});