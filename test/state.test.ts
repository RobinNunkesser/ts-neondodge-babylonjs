import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateMachine } from '../src/core/state';

describe('GameStateMachine (docs/gdd/04_state_machine.md)', () => {
  let fsm: GameStateMachine;

  beforeEach(() => {
    fsm = new GameStateMachine('MENU');
  });

  it('starts in MENU state', () => {
    expect(fsm.getState()).toBe('MENU');
  });

  it('transitions from MENU to PLAYING on START', () => {
    const success = fsm.transition('START');
    expect(success).toBe(true);
    expect(fsm.getState()).toBe('PLAYING');
  });

  it('rejects invalid transitions from MENU', () => {
    expect(fsm.transition('TOGGLE_PAUSE')).toBe(false);
    expect(fsm.transition('COLLISION')).toBe(false);
    expect(fsm.getState()).toBe('MENU');
  });

  it('handles pause and resume lifecycle', () => {
    fsm.transition('START');
    expect(fsm.getState()).toBe('PLAYING');

    expect(fsm.transition('TOGGLE_PAUSE')).toBe(true);
    expect(fsm.getState()).toBe('PAUSED');

    expect(fsm.transition('TOGGLE_PAUSE')).toBe(true);
    expect(fsm.getState()).toBe('PLAYING');
  });

  it('transitions to GAME_OVER on COLLISION', () => {
    fsm.transition('START');
    expect(fsm.transition('COLLISION')).toBe(true);
    expect(fsm.getState()).toBe('GAME_OVER');
  });

  it('allows RESTART from GAME_OVER back to PLAYING', () => {
    fsm.transition('START');
    fsm.transition('COLLISION');
    expect(fsm.getState()).toBe('GAME_OVER');

    expect(fsm.transition('RESTART')).toBe(true);
    expect(fsm.getState()).toBe('PLAYING');
  });
});
