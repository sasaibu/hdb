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
  source?: string;
}

export class DatabaseService {
  private db: any = null;
  private static instance: DatabaseService;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initDatabase(): Promise<void> {
    try {
      this.db = SQLite.openDatabase('hdb.db', '1.0', 'HDB Database', 5 * 1024 * 1024);
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        source TEXT DEFAULT 'manual',
        sync_status TEXT DEFAULT 'pending',
        synced_at DATETIME
      );
    `;

    const createTargetsTable = `
      CREATE TABLE IF NOT EXISTS targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT UNIQUE NOT NULL,
        target_value REAL NOT NULL,
        unit TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 新仕様対応: 1日の心拍データテーブル
    const createDailyHeartRateTable = `
      CREATE TABLE IF NOT EXISTS daily_heart_rate (
        date TEXT NOT NULL,
        user_no INTEGER DEFAULT 1,
        data_source_no INTEGER DEFAULT 1,
        min_value INTEGER NOT NULL,
        max_value INTEGER NOT NULL,
        sync_status TEXT DEFAULT 'pending',
        synced_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (date, user_no, data_source_no)
      );
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_vital_data_type_date 
      ON vital_data(type, recorded_date);
    `;

    const createDailyHeartRateIndexes = `
      CREATE INDEX IF NOT EXISTS idx_daily_heart_rate_date 
      ON daily_heart_rate(date);
    `;

    await this.executeSql(createVitalDataTable);
    await this.executeSql(createTargetsTable);
    await this.executeSql(createDailyHeartRateTable);
    await this.executeSql(createIndexes);
    await this.executeSql(createDailyHeartRateIndexes);
  }

  executeSql(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          params,
          (_: any, result: any) => resolve(result),
          (_: any, error: any) => {
            console.error('SQL Error:', error);
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
        INSERT INTO vital_data (type, value, unit, systolic, diastolic, recorded_date, source)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          [data.type, data.value, data.unit, data.systolic || null, data.diastolic || null, data.recorded_date, data.source || 'manual'],
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
            resolve(data);
          },
          (_: any, error: any) => {
            console.error('Error fetching data:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getVitalDataByTypeAndDate(type: string, date: string): Promise<VitalDataRecord[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `
        SELECT * FROM vital_data 
        WHERE type = ? AND recorded_date = ?
        ORDER BY created_at DESC
      `;

      this.db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          [type, date],
          (_: any, result: any) => {
            const data: VitalDataRecord[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              data.push(result.rows.item(i));
            }
            resolve(data);
          },
          (_: any, error: any) => {
            console.error('Error fetching data:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getVitalDataByDateRange(type: string, startDate: string, endDate: string): Promise<VitalDataRecord[]> {
    const sql = `
      SELECT * FROM vital_data 
      WHERE type = ? AND recorded_date BETWEEN ? AND ?
      ORDER BY recorded_date DESC
    `;
    
    const result = await this.executeSql(sql, [type, startDate, endDate]);
    const data: VitalDataRecord[] = [];
    
    for (let i = 0; i < result.rows.length; i++) {
      data.push(result.rows.item(i));
    }
    
    return data;
  }

  async updateVitalData(id: number, value: number, systolic?: number, diastolic?: number): Promise<void> {
    const sql = `
      UPDATE vital_data 
      SET value = ?, systolic = ?, diastolic = ?
      WHERE id = ?
    `;
    
    await this.executeSql(sql, [value, systolic || null, diastolic || null, id]);
  }

  async deleteVitalData(id: number): Promise<void> {
    const sql = `DELETE FROM vital_data WHERE id = ?`;
    await this.executeSql(sql, [id]);
  }

  async insertOrUpdateTarget(type: string, targetValue: number, unit: string): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO targets (type, target_value, unit, updated_at)
      VALUES (?, ?, ?, datetime('now'))
    `;
    
    await this.executeSql(sql, [type, targetValue, unit]);
  }

  async getTarget(type: string): Promise<any> {
    const sql = `SELECT * FROM targets WHERE type = ?`;
    const result = await this.executeSql(sql, [type]);
    
    if (result.rows.length > 0) {
      return result.rows.item(0);
    }
    return null;
  }

  async initializeDefaultTargets(): Promise<void> {
    const defaultTargets = [
      { type: '歩数', value: 8000, unit: '歩' },
      { type: '体重', value: 65, unit: 'kg' },
      { type: '体温', value: 36.5, unit: '℃' },
      { type: '血圧', value: 120, unit: 'mmHg' },
    ];

    for (const target of defaultTargets) {
      const existing = await this.getTarget(target.type);
      if (!existing) {
        await this.insertOrUpdateTarget(target.type, target.value, target.unit);
      }
    }
  }

  async getAllData(): Promise<any[]> {
    const sql = `SELECT * FROM vital_data ORDER BY recorded_date DESC`;
    const result = await this.executeSql(sql);
    
    const data: any[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      data.push(result.rows.item(i));
    }
    
    return data;
  }

  // 新仕様対応: 1日の心拍データ管理
  async insertOrUpdateDailyHeartRate(date: string, minValue: number, maxValue: number, userNo: number = 1, dataSourceNo: number = 1): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO daily_heart_rate (date, user_no, data_source_no, min_value, max_value)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await this.executeSql(sql, [date, userNo, dataSourceNo, minValue, maxValue]);
  }

  async getDailyHeartRate(date: string, userNo: number = 1, dataSourceNo: number = 1): Promise<any> {
    const sql = `
      SELECT * FROM daily_heart_rate 
      WHERE date = ? AND user_no = ? AND data_source_no = ?
    `;
    
    const result = await this.executeSql(sql, [date, userNo, dataSourceNo]);
    
    if (result.rows.length > 0) {
      return result.rows.item(0);
    }
    return null;
  }

  async getDailyHeartRateByDateRange(startDate: string, endDate: string, userNo: number = 1): Promise<any[]> {
    const sql = `
      SELECT * FROM daily_heart_rate 
      WHERE date BETWEEN ? AND ? AND user_no = ?
      ORDER BY date DESC
    `;
    
    const result = await this.executeSql(sql, [startDate, endDate, userNo]);
    const data: any[] = [];
    
    for (let i = 0; i < result.rows.length; i++) {
      data.push(result.rows.item(i));
    }
    
    return data;
  }

  async getUnsyncedDailyHeartRate(): Promise<any[]> {
    const sql = `
      SELECT * FROM daily_heart_rate 
      WHERE sync_status IS NULL OR sync_status = 'pending'
      ORDER BY date DESC
    `;
    
    const result = await this.executeSql(sql);
    const data: any[] = [];
    
    for (let i = 0; i < result.rows.length; i++) {
      data.push(result.rows.item(i));
    }
    
    return data;
  }

  async markDailyHeartRateAsSynced(date: string, userNo: number = 1, dataSourceNo: number = 1): Promise<void> {
    const sql = `
      UPDATE daily_heart_rate 
      SET sync_status = 'synced', synced_at = datetime('now')
      WHERE date = ? AND user_no = ? AND data_source_no = ?
    `;
    
    await this.executeSql(sql, [date, userNo, dataSourceNo]);
  }

  async clearAllData(): Promise<void> {
    await this.executeSql('DELETE FROM vital_data');
    await this.executeSql('DELETE FROM targets');
    await this.executeSql('DELETE FROM daily_heart_rate');
    console.log('All data cleared');
  }

  closeDatabase(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
