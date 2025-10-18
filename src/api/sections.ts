export const sectionsApi = {
  async getSectionsForCard(_cardId: string) {
    return [] as any[]
  },
  async getSections(_cardId: string) {
    return [] as any[]
  },
  async createSection(_cardId: string, _data: any) {
    return null
  },
  async updateSection(_id: string, _updates: any) {
    return null
  },
  async deleteSection(_id: string) {
    return null
  },
  async reorderSections(_cardId: string, _order: string[]) {
    return null
  }
}
