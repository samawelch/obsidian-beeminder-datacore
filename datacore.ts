// datacore.ts ----
// Interface with Datacore plugin to execute queries
import { App } from 'obsidian';

export class DatacoreAPI {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  // Check if Datacore is available
  isDatacoreAvailable(): boolean {
    // @ts-ignore - Datacore adds this to the global app object
    return this.app.plugins.plugins.datacore !== undefined;
  }

  // Execute a Datacore query and return results
  async executeQuery(queryString: string): Promise<any[]> {
    if (!this.isDatacoreAvailable()) {
      throw new Error('Datacore plugin is not enabled');
    }

    try {
      // @ts-ignore - Access Datacore API
      const api = this.app.plugins.plugins.datacore.api;
      
      // Execute the query with the proper syntax
      return await api.query(queryString);
    } catch (error) {
      console.error('Error executing Datacore query:', error);
      throw error;
    }
  }

  // Test a query and return the count only
  async testQuery(queryString: string): Promise<number> {
    try {
      const results = await this.executeQuery(queryString);
      return Array.isArray(results) ? results.length : 0;
    } catch (error) {
      console.error('Error testing query:', error);
      throw error;
    }
  }
}
