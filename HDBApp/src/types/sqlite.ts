// SQLite型定義
export interface SQLiteDatabase {
  transaction(fn: (tx: SQLiteTransaction) => void): void;
}

export interface SQLiteTransaction {
  executeSql(
    sql: string,
    params?: any[],
    successCallback?: (tx: SQLiteTransaction, result: SQLiteResultSet) => void,
    errorCallback?: (tx: SQLiteTransaction, error: SQLiteError) => boolean
  ): void;
}

export interface SQLiteResultSet {
  insertId: number;
  rowsAffected: number;
  rows: SQLiteResultSetRowList;
}

export interface SQLiteResultSetRowList {
  length: number;
  item(index: number): any;
}

export interface SQLiteError {
  code: number;
  message: string;
}

declare module 'react-native-sqlite-2' {
  export function openDatabase(
    name: string,
    version: string,
    displayName: string,
    estimatedSize: number
  ): SQLiteDatabase;
}
