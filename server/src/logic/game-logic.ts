// Logic level classes
import {Logic} from './logic';

// Model level classes
import {GameModelManager, IGameInstance} from '../model/game-model-manager';

export class GameLogic extends Logic<IGameInstance> {
  private static theInstance: GameLogic;

  public static instanceOf(): GameLogic {
    if (!GameLogic.theInstance) {
      GameLogic.theInstance = new GameLogic();
    }
    return GameLogic.theInstance;
  }

  constructor() {
    super(GameModelManager.gameModel);
  }
}
