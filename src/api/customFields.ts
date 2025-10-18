export const customFieldsApi = {
  async checkTableSchema() {
    // noop for CI
    return true
  },
  async getCustomFields(_workspaceId: string) {
    return []
  },
  async createCustomField(_data: any) {
    return null
  },
  async updateCustomField(_id: string, _data: any) {
    return null
  },
  async deleteCustomField(_id: string) {
    return null
  },
  async getCustomFieldValues(_cardId: string) {
    return []
  },
  async setCustomFieldValue(_cardId: string, _fieldId: string, _value: any) {
    return null
  }
}
