import assert from 'node:assert/strict';
import {
  CONFIG,
  state,
  initGame,
  calculateRoundScore,
  getRoundTime
} from '../grd-bag-game/src/js/core/state.js';

const mockItems = [
  { id: 'water', name: 'Agua', category: 'water' },
  { id: 'food', name: 'Comida', category: 'energy' },
  { id: 'flashlight', name: 'Linterna', category: 'energy' },
  { id: 'batteries', name: 'Pilas', category: 'energy' },
  { id: 'laptop', name: 'Laptop', category: 'none' }
];

const mockScenario = {
  id: 'test',
  name: 'Test Escenario',
  essentialItems: ['water', 'food', 'flashlight', 'batteries'],
  recommendedItems: [],
  forbiddenItems: ['laptop']
};

function resetState() {
  initGame('challenge', mockItems, [mockScenario], []);
  state.items = mockItems;
  state.currentScenario = mockScenario;
  state.bag = [];
  state.level = 1;
  state.carriedOverTime = 0;
}

function testMinRoundTimeClamp() {
  resetState();
  state.level = 80; // Force extremely high level
  const roundTime = getRoundTime();
  assert.equal(roundTime, CONFIG.TIME.MIN_ROUND_TIME, 'Round time should not go below configured minimum');
}

function testScoringPassFail() {
  resetState();
  state.bag = ['water', 'food', 'flashlight', 'batteries'];
  const passResult = calculateRoundScore();
  assert.equal(passResult.passed, true, 'Should pass with enough essentials');

  resetState();
  state.bag = ['water'];
  const failResult = calculateRoundScore();
  assert.equal(failResult.passed, false, 'Should fail with insufficient essentials');
}

function run() {
  testMinRoundTimeClamp();
  testScoringPassFail();
  console.log('All state tests passed.');
}

run();
