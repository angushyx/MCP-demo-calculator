import axios from 'axios';

const instance = axios.create({ 
  baseURL: '/api/notion',
  timeout: 30000
});

export const notion = {
  async searchPages(query: string, limit: number = 10) {
    const { data } = await instance.get('/search', {
      params: { query, limit }
    });
    return data;
  },
  
  async createPage(title: string, content: string, databaseId?: string) {
    const { data } = await instance.post('/pages', {
      title,
      content,
      databaseId
    });
    return data;
  },
  
  async updatePage(pageId: string, content: string) {
    const { data } = await instance.put(`/pages/${pageId}`, {
      content
    });
    return data;
  },
  
  async getDatabaseItems(databaseId: string, filter?: any, limit: number = 10) {
    const { data } = await instance.get(`/databases/${databaseId}/items`, {
      params: { filter, limit }
    });
    return data;
  },
  
  async createDatabaseItem(databaseId: string, properties: any) {
    const { data } = await instance.post(`/databases/${databaseId}/items`, {
      properties
    });
    return data;
  }
};
