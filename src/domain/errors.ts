export class MaxItemsReachedError extends Error {
  constructor() {
    super('Maximum number of items reached')
    this.name = 'MaxItemsReachedError'
  }
}
