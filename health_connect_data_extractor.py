#!/usr/bin/env python3
"""
Health Connect 生データ取得スクリプト

このスクリプトはADBコマンドを使用してAndroidデバイスから
Health Connectの生データを直接取得します。

使用方法:
python health_connect_data_extractor.py

前提条件:
- Android端末がUSBデバッグモードで接続されている
- ADBがインストールされている
- Health Connectアプリがインストールされている
"""

import subprocess
import json
import datetime
import sys
import os
from typing import Dict, List, Any, Optional

class HealthConnectExtractor:
    def __init__(self):
        self.device_id = None
        self.supported_data_types = [
            'Steps',
            'HeartRate', 
            'BloodPressure',
            'Weight',
            'Height',
            'BodyFat',
            'SleepSession',
            'ExerciseSession',
            'Distance',
            'TotalCaloriesBurned',
            'ActiveCaloriesBurned',
            'RestingHeartRate',
            'BloodGlucose',
            'OxygenSaturation',
            'BodyTemperature'
        ]
    
    def check_adb_connection(self) -> bool:
        """ADB接続を確認"""
        try:
            result = subprocess.run(['adb', 'devices'], 
                                  capture_output=True, text=True, check=True)
            devices = result.stdout.strip().split('\n')[1:]  # ヘッダーを除く
            
            if not devices or all(not line.strip() for line in devices):
                print("❌ Androidデバイスが接続されていません")
                print("USBデバッグを有効にしてデバイスを接続してください")
                return False
            
            # 最初のデバイスを使用
            self.device_id = devices[0].split('\t')[0]
            print(f"✅ デバイス接続確認: {self.device_id}")
            return True
            
        except subprocess.CalledProcessError:
            print("❌ ADBコマンドが見つかりません")
            print("Android SDK Platform Toolsをインストールしてください")
            return False
        except FileNotFoundError:
            print("❌ ADBコマンドが見つかりません")
            print("Android SDK Platform Toolsをインストールしてください")
            return False
    
    def check_health_connect(self) -> bool:
        """Health Connectアプリの存在確認"""
        try:
            cmd = ['adb', '-s', self.device_id, 'shell', 'pm', 'list', 'packages', 'com.google.android.apps.healthdata']
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            if 'com.google.android.apps.healthdata' in result.stdout:
                print("✅ Health Connectアプリが見つかりました")
                return True
            else:
                print("❌ Health Connectアプリがインストールされていません")
                print("Google Play StoreからHealth Connectをインストールしてください")
                return False
                
        except subprocess.CalledProcessError as e:
            print(f"❌ Health Connectチェックエラー: {e}")
            return False
    
    def get_health_connect_data(self, data_type: str, days_back: int = 30) -> List[Dict[str, Any]]:
        """指定されたデータタイプの生データを取得"""
        print(f"🔍 {data_type}データを取得中...")
        
        # 日付範囲を計算（ミリ秒）
        end_time = datetime.datetime.now()
        start_time = end_time - datetime.timedelta(days=days_back)
        start_timestamp = int(start_time.timestamp() * 1000)
        end_timestamp = int(end_time.timestamp() * 1000)
        
        try:
            # Health Connect Content Providerへのクエリ
            uri = f"content://com.google.android.apps.healthdata.provider/records/{data_type}"
            
            cmd = [
                'adb', '-s', self.device_id, 'shell', 'content', 'query',
                '--uri', uri,
                '--where', 'start_time >= ? AND end_time <= ?',
                '--bind', str(start_timestamp),
                '--bind', str(end_timestamp)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0 and result.stdout.strip():
                # 結果をパース
                raw_data = self.parse_content_provider_output(result.stdout, data_type)
                print(f"✅ {data_type}: {len(raw_data)}件のデータを取得")
                return raw_data
            else:
                print(f"⚠️ {data_type}: データなし または アクセス権限なし")
                return []
                
        except subprocess.TimeoutExpired:
            print(f"⏰ {data_type}: タイムアウト")
            return []
        except subprocess.CalledProcessError as e:
            print(f"❌ {data_type}: エラー - {e}")
            return []
    
    def parse_content_provider_output(self, output: str, data_type: str) -> List[Dict[str, Any]]:
        """Content Providerの出力をパース"""
        records = []
        lines = output.strip().split('\n')
        
        for line in lines:
            if not line.strip() or line.startswith('Row:'):
                continue
                
            try:
                # Content Providerの出力形式をパース
                # 例: "column1=value1, column2=value2, ..."
                record = {}
                parts = line.split(', ')
                
                for part in parts:
                    if '=' in part:
                        key, value = part.split('=', 1)
                        record[key.strip()] = value.strip()
                
                if record:
                    # 標準形式に変換
                    formatted_record = self.format_health_record(record, data_type)
                    records.append(formatted_record)
                    
            except Exception as e:
                print(f"⚠️ レコードパースエラー: {e}")
                continue
        
        return records
    
    def format_health_record(self, raw_record: Dict[str, str], data_type: str) -> Dict[str, Any]:
        """生データを標準形式にフォーマット"""
        formatted = {
            'dataType': data_type,
            'timestamp': raw_record.get('start_time', raw_record.get('time', '')),
            'rawData': raw_record,
            'source': 'HEALTH_CONNECT_DIRECT',
            'extractedAt': datetime.datetime.now().isoformat(),
            'metadata': {
                'extractionMethod': 'ADB_CONTENT_PROVIDER',
                'isRealData': True
            }
        }
        
        # データタイプ別の値抽出
        if data_type == 'Steps':
            formatted['value'] = {
                'count': int(raw_record.get('count', 0)),
                'startTime': raw_record.get('start_time', ''),
                'endTime': raw_record.get('end_time', '')
            }
        elif data_type == 'HeartRate':
            formatted['value'] = {
                'beatsPerMinute': int(raw_record.get('bpm', 0)),
                'measurementMethod': raw_record.get('measurement_method', 'UNKNOWN')
            }
        elif data_type == 'Weight':
            formatted['value'] = {
                'mass': float(raw_record.get('weight', 0)),
                'unit': 'KILOGRAM'
            }
        else:
            # その他のデータタイプは生データをそのまま
            formatted['value'] = raw_record
        
        return formatted
    
    def extract_all_data(self, days_back: int = 30) -> Dict[str, List[Dict[str, Any]]]:
        """全データタイプの生データを取得"""
        print(f"🔥 Health Connect生データ取得開始 (過去{days_back}日間)")
        print("=" * 50)
        
        all_data = {}
        total_records = 0
        
        for data_type in self.supported_data_types:
            data = self.get_health_connect_data(data_type, days_back)
            all_data[data_type] = data
            total_records += len(data)
        
        print("=" * 50)
        print(f"📊 取得完了: {len(self.supported_data_types)}種類のデータタイプ")
        print(f"📊 総レコード数: {total_records}件")
        
        return all_data
    
    def save_data_to_file(self, data: Dict[str, List[Dict[str, Any]]], filename: Optional[str] = None):
        """データをJSONファイルに保存"""
        if filename is None:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"health_connect_raw_data_{timestamp}.json"
        
        # 統計情報を追加
        report = {
            'extractionInfo': {
                'timestamp': datetime.datetime.now().isoformat(),
                'deviceId': self.device_id,
                'extractionMethod': 'ADB_CONTENT_PROVIDER',
                'dataTypes': list(data.keys()),
                'totalRecords': sum(len(records) for records in data.values())
            },
            'statistics': {
                dataType: {
                    'count': len(records),
                    'hasData': len(records) > 0,
                    'dateRange': {
                        'earliest': min([r['timestamp'] for r in records]) if records else None,
                        'latest': max([r['timestamp'] for r in records]) if records else None
                    }
                }
                for dataType, records in data.items()
            },
            'rawData': data
        }
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            
            print(f"💾 データを保存しました: {filename}")
            print(f"📁 ファイルサイズ: {os.path.getsize(filename)} bytes")
            
        except Exception as e:
            print(f"❌ ファイル保存エラー: {e}")
    
    def print_summary(self, data: Dict[str, List[Dict[str, Any]]]):
        """データサマリーを表示"""
        print("\n" + "=" * 60)
        print("📋 Health Connect 生データ取得サマリー")
        print("=" * 60)
        
        for data_type, records in data.items():
            if records:
                print(f"✅ {data_type}: {len(records)}件")
                # 最新のレコードを1件表示
                latest = max(records, key=lambda x: x['timestamp'])
                print(f"   最新データ: {latest['timestamp']}")
                print(f"   値: {latest['value']}")
            else:
                print(f"⚠️ {data_type}: データなし")
        
        total_records = sum(len(records) for records in data.values())
        successful_types = len([records for records in data.values() if records])
        
        print("-" * 60)
        print(f"📊 総計: {successful_types}/{len(data)}種類のデータタイプで{total_records}件取得")
        print("=" * 60)

def main():
    print("🔥 Health Connect 生データ抽出ツール")
    print("=" * 50)
    
    extractor = HealthConnectExtractor()
    
    # 前提条件チェック
    if not extractor.check_adb_connection():
        sys.exit(1)
    
    if not extractor.check_health_connect():
        sys.exit(1)
    
    # データ取得期間を指定
    try:
        days = int(input("取得期間を日数で入力してください (デフォルト: 30): ") or "30")
    except ValueError:
        days = 30
    
    # 生データ取得実行
    try:
        all_data = extractor.extract_all_data(days)
        
        # 結果表示
        extractor.print_summary(all_data)
        
        # ファイル保存
        extractor.save_data_to_file(all_data)
        
        print("\n🎉 Health Connect生データ取得完了！")
        
    except KeyboardInterrupt:
        print("\n⏹️ ユーザーによって中断されました")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 予期しないエラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
