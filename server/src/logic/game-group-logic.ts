// Logic level classes
import {Logic} from './logic';

// Model level classes
import {GameGroupModelManager, IGameGroupInstance} from '../model/game-group-model-manager';

export class GameGroupLogic extends Logic<IGameGroupInstance> {
  private static theInstance: GameGroupLogic;

  public static instanceOf(): GameGroupLogic {
    if (!GameGroupLogic.theInstance) {
      GameGroupLogic.theInstance = new GameGroupLogic();
    }
    return GameGroupLogic.theInstance;
  }

  constructor() {
    super(GameGroupModelManager.gameGroupModel);
  }
}
