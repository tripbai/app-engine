import { inject, injectable } from "inversify";
import { AbstractEventManagerProvider, EventInterface, GetArguments } from "../event-manager.provider";
import { NodeEmitterService } from "../../../services/events/node-emitter/node-emitter.service";


/**
 * A wrapper around node emitter
 */
@injectable()
export class SimpleNodeEmitter implements AbstractEventManagerProvider {

  constructor(
    @inject(NodeEmitterService) public readonly nodeEmitterService: NodeEmitterService
  ){}
  

  listen<T extends EventInterface>(EventInterface: T, handler: T["handler"]): void {
    this.nodeEmitterService.listen(EventInterface.id(), handler)
  }

  async dispatch<T extends EventInterface>(EventInterface: T, ...data: GetArguments<T["handler"]>): Promise<void> {
    this.nodeEmitterService.dispatch(
      EventInterface.id(), data
    )
  }

}