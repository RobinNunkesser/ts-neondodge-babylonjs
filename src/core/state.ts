export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type GameEvent = 'START' | 'TOGGLE_PAUSE' | 'COLLISION' | 'RESTART';

export class GameStateMachine {
  private currentState: GameState = 'MENU';

  constructor(initialState: GameState = 'MENU') {
    this.currentState = initialState;
  }

  public getState(): GameState {
    return this.currentState;
  }

  public transition(event: GameEvent): boolean {
    switch (this.currentState) {
      case 'MENU':
        if (event === 'START') {
          this.currentState = 'PLAYING';
          return true;
        }
        return false;

      case 'PLAYING':
        if (event === 'TOGGLE_PAUSE') {
          this.currentState = 'PAUSED';
          return true;
        }
        if (event === 'COLLISION') {
          this.currentState = 'GAME_OVER';
          return true;
        }
        return false;

      case 'PAUSED':
        if (event === 'TOGGLE_PAUSE') {
          this.currentState = 'PLAYING';
          return true;
        }
        return false;

      case 'GAME_OVER':
        if (event === 'RESTART' || event === 'START') {
          this.currentState = 'PLAYING';
          return true;
        }
        return false;

      default:
        return false;
    }
  }

  public reset(): void {
    this.currentState = 'MENU';
  }
}
