export const timeTrackingApi = {
  async getTimeEntries(workspaceId: string) {
    return [] as any[]
  },
  async getTotalTime(cardId: string) {
    return 0
  },
  async getRunningTimer() {
    return null
  },
  async startTimer(cardId: string, description?: string) {
    return null
  },
  async stopTimer(entryId: string) {
    return null
  },
  async deleteTimeEntry(entryId: string) {
    return null
  },
  async createTimeEntry(data: any) {
    return null
  }
}
