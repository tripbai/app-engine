import { Container } from "inversify";
import { AbstractEventManagerProvider } from "../../core/providers/event/event-manager.provider";
import { StoreCreatedEvent, StoreUpdatedEvent } from "../stores/store.events";
import { StoreIndexer } from "../stores/event-listeners/store-indexer";

export const TripbaiEvents = (
  container: Container
) => {
  const abstractEventManager = container.get(AbstractEventManagerProvider)

  // Register event listeners for store events
  const storeIndexer = container.get(StoreIndexer)
  abstractEventManager.listen(new StoreCreatedEvent, async (...args) => {
    await storeIndexer.execute(...args)
  })
  abstractEventManager.listen(new StoreUpdatedEvent, async (...args) => {
    await storeIndexer.execute(...args)
  })
}