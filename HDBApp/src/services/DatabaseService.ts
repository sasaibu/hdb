import SQLite from 'react-native-sqlite-2';

export interface VitalDataRecord {
  id?: number;
  type: string;
  value: number;
  unit: string;
  systolic?: number;
  diastolic?: number;
  recorded_date: string;
  created_at?: string;
}

export class DatabaseService {
  private db: any = null;
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initDatabase(): Promise<void> {
    try {
      this.db = SQLite.openDatabase('health_data.db', '1.0', '', 1);
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const createVitalDataTable = `
      CREATE TABLE IF NOT EXISTS vital_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        systolic INTEGER,
        diastolic INTEGER,
        recorded_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createTargetsTable = `
      CREATE TABLE IF NOT EXISTS targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT UNIQUE NOT NULL,
        target_value REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx: any) => {
        tx.executeSql(
          createVitalDataTable,
          [],
          () => {
            tx.executeSql(
              createTargetsTable,
              [],
              () => {
                console.log('Tables created successfully');
                resolve();
              },
              (_: any, error: any) => {
                console.error('Error creating targets table:', error);
                reject(error);
                return false;
              }
            );
          },
          (_: any, error: any) => {
            console.error('Error creating vital_data table:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async insertVitalData(data: VitalDataRecord): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `
        INSERT INTO vital_data (type, value, unit, systolic, diastolic, recorded_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          [data.type, data.value, data.unit, data.systolic || null, data.diastolic || null, data.recorded_date],
          (_: any, result: any) => {
            console.log('Data inserted successfully, ID:', result.insertId);
            resolve(result.insertId);
          },
          (_: any, error: any) => {
            console.error('Error inserting data:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getVitalDataByType(type: string, limit?: number): Promise<VitalDataRecord[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      let sql = `
        SELECT * FROM vital_data 
        WHERE type = ? 
        ORDER BY recorded_date DESC
      `;

      if (limit) {
        sql += ` LIMIT ?`;
      }

      const params = limit ? [type, limit] : [type];

      this.db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          params,
          (_: any, result: any) => {
            const data: VitalDataRecord[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              data.push(result.rows.item(i));
            }
            console.log(`Retrieved ${data.length} records for type: ${type}`);
            resolve(data);
          },
          (_: any, error: any) => {
            console.error('Error retrieving data:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async updateVitalData(id: number, value: number, systolic?: number, diastolic?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `
        UPDATE vital_data 
        SET value = ?, systolic = ?, diastolic = ?
        WHERE id = ?
      `;

      this.db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          [value, systolic || null, diastolic || null, id],
          () => {
            console.log('Data updated successfully, ID:', id);
            resolve();
          },
          (_: any, error: any) => {
            console.error('Error updating data:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async deleteVitalData(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = 'DELETE FROM vital_data WHERE id = ?';

      this.db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          [id],
          () => {
            console.log('Data deleted successfully, ID:', id);
            resolve();
          },
          (_: any, error: any) => {
            console.error('Error deleting data:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async setTarget(type: string, targetValue: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `
        INSERT OR REPLACE INTO targets (type, target_value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `;

      this.db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          [type, targetValue],
          () => {
            console.log('Target set successfully for type:', type);
            resolve();
          },
          (_: any, error: any) => {
            console.error('Error setting target:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getTarget(type: string): Promise<number | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = 'SELECT target_value FROM targets WHERE type = ?';

      this.db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          [type],
          (_: any, result: any) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0).target_value);
            } else {
              resolve(null);
            }
          },
          (_: any, error: any) => {
            console.error('Error getting target:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async initializeDefaultTargets(): Promise<void> {
    const defaultTargets = [
      { type: '歩数', value: 10000 },
      { type: '体重', value: 65.0 },
      { type: '体温', value: 36.5 },
      { type: '血圧', value: 120 }, // 収縮期血圧の目標値
    ];

    try {
      for (const target of defaultTargets) {
        const existingTarget = await this.getTarget(target.type);
        if (existingTarget === null) {
          await this.setTarget(target.type, target.value);
        }
      }
      console.log('Default targets initialized');
    } catch (error) {
      console.error('Error initializing default targets:', error);
      throw error;
    }
  }
}
