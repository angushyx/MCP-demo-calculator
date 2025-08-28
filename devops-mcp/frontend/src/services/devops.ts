import axios from 'axios';

const instance = axios.create({ 
  baseURL: '/api/devops/ai',
  timeout: 30000
});

export const devops = {
  async generatePatch(diff: string) { 
    const { data } = await instance.post('/generate-patch', { diff }); 
    return data as string; 
  },
  
  async summarize(diff: string) { 
    const { data } = await instance.post('/summarize', { diff }); 
    return data as string; 
  },
  
  async collectDiff(params: { repoDir?: string; baseRef?: string; headRef?: string }) { 
    const { data } = await instance.get('/collect-diff', { params }); 
    return data as string; 
  }
};
