import Daemon from '../Daemon';

test('creating Daemon', () => {
  const result = new Daemon(1);
  
  expect(result).toEqual({health: 100, level: 1, attack: 10, defence: 10, type: 'daemon'});
});