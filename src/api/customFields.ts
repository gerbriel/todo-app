export const customFieldsApi = {
  async checkTableSchema() {
    // noop for CI
    return true
  },
  async getCustomFields(workspaceId: string) {
    return []
  },
  async createCustomField(data: any) {
    return null
  },
  async updateCustomField(id: string, data: any) {
    return null
  },
  async deleteCustomField(id: string) {
    return null
  },
  async getCustomFieldValues(cardId: string) {
    return []
  },
  async setCustomFieldValue(cardId: string, fieldId: string, value: any) {
    return null
  }
}
