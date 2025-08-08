#!/usr/bin/env python3
"""
Health Connect データ構造サンプル生成スクリプト

実際のHealth Connectから取得できるデータ構造のサンプルを生成します。
これは実データではなく、Health Connect APIの仕様に基づいたサンプルデータです。
"""

import json
import datetime
import random
from typing import Dict, List, Any

class HealthConnectSampleGenerator:
    def __init__(self):
        self.current_time = datetime.datetime.now()
        
    def generate_timestamp(self, days_ago: int = 0, hours_ago: int = 0) -> str:
        """タイムスタンプ生成"""
        time = self.current_time - datetime.timedelta(days=days_ago, hours=hours_ago)
        return time.isoformat()
    
    def generate_steps_sample(self) -> List[Dict[str, Any]]:
        """歩数データのサンプル"""
        samples = []
        for day in range(7):  # 過去7日分
            for hour in range(24):
                if 6 <= hour <= 22:  # 6時〜22時のデータ
                    steps = random.randint(50, 500) if hour in [7, 12, 18] else random.randint(10, 100)
                    samples.append({
                        "id": f"steps_{day}_{hour}",
                        "dataType": "Steps",
                        "count": steps,
                        "startTime": self.generate_timestamp(days_ago=day, hours_ago=24-hour),
                        "endTime": self.generate_timestamp(days_ago=day, hours_ago=23-hour),
                        "metadata": {
                            "dataOrigin": "com.google.android.apps.fitness",
                            "device": {
                                "manufacturer": "Google",
                                "model": "Pixel 7",
                                "type": "PHONE"
                            },
                            "clientRecordId": f"client_steps_{day}_{hour}",
                            "lastModifiedTime": self.generate_timestamp(days_ago=day)
                        }
                    })
        return samples
    
    def generate_heart_rate_sample(self) -> List[Dict[str, Any]]:
        """心拍数データのサンプル"""
        samples = []
        for day in range(3):  # 過去3日分
            for measurement in range(5):  # 1日5回測定
                bpm = random.randint(60, 100)
                samples.append({
                    "id": f"heart_rate_{day}_{measurement}",
                    "dataType": "HeartRate",
                    "beatsPerMinute": bpm,
                    "time": self.generate_timestamp(days_ago=day, hours_ago=measurement*4),
                    "measurementMethod": "MEASUREMENT_METHOD_MANUAL",
                    "metadata": {
                        "dataOrigin": "com.samsung.health",
                        "device": {
                            "manufacturer": "Samsung",
                            "model": "Galaxy Watch 5",
                            "type": "WATCH"
                        },
                        "clientRecordId": f"client_hr_{day}_{measurement}",
                        "lastModifiedTime": self.generate_timestamp(days_ago=day)
                    }
                })
        return samples
    
    def generate_blood_pressure_sample(self) -> List[Dict[str, Any]]:
        """血圧データのサンプル"""
        samples = []
        for day in range(7):  # 過去7日分、朝晩2回
            for time_of_day in ["morning", "evening"]:
                systolic = random.randint(110, 130)
                diastolic = random.randint(70, 85)
                hour = 7 if time_of_day == "morning" else 19
                samples.append({
                    "id": f"bp_{day}_{time_of_day}",
                    "dataType": "BloodPressure",
                    "systolic": {
                        "value": systolic,
                        "unit": "MILLIMETER_OF_MERCURY"
                    },
                    "diastolic": {
                        "value": diastolic,
                        "unit": "MILLIMETER_OF_MERCURY"
                    },
                    "time": self.generate_timestamp(days_ago=day, hours_ago=24-hour),
                    "measurementLocation": "MEASUREMENT_LOCATION_LEFT_UPPER_ARM",
                    "bodyPosition": "BODY_POSITION_SITTING",
                    "metadata": {
                        "dataOrigin": "com.omron.connect",
                        "device": {
                            "manufacturer": "OMRON",
                            "model": "HEM-7281T",
                            "type": "UNKNOWN"
                        },
                        "clientRecordId": f"client_bp_{day}_{time_of_day}",
                        "lastModifiedTime": self.generate_timestamp(days_ago=day)
                    }
                })
        return samples
    
    def generate_weight_sample(self) -> List[Dict[str, Any]]:
        """体重データのサンプル"""
        samples = []
        base_weight = 65.0
        for day in range(14):  # 過去14日分
            weight = base_weight + random.uniform(-0.5, 0.5)
            samples.append({
                "id": f"weight_{day}",
                "dataType": "Weight",
                "weight": {
                    "value": round(weight, 1),
                    "unit": "KILOGRAM"
                },
                "time": self.generate_timestamp(days_ago=day, hours_ago=16),  # 朝8時測定
                "metadata": {
                    "dataOrigin": "com.withings.wiscale2",
                    "device": {
                        "manufacturer": "Withings",
                        "model": "Body+",
                        "type": "SCALE"
                    },
                    "clientRecordId": f"client_weight_{day}",
                    "lastModifiedTime": self.generate_timestamp(days_ago=day)
                }
            })
        return samples
    
    def generate_sleep_sample(self) -> List[Dict[str, Any]]:
        """睡眠データのサンプル"""
        samples = []
        for day in range(7):  # 過去7日分
            sleep_duration = random.randint(6, 8) * 60  # 6-8時間（分単位）
            samples.append({
                "id": f"sleep_{day}",
                "dataType": "SleepSession",
                "startTime": self.generate_timestamp(days_ago=day+1, hours_ago=7),  # 前日23時
                "endTime": self.generate_timestamp(days_ago=day, hours_ago=24-7),  # 当日7時
                "duration": sleep_duration * 60 * 1000,  # ミリ秒
                "stages": [
                    {
                        "stage": "STAGE_TYPE_AWAKE",
                        "startTime": self.generate_timestamp(days_ago=day+1, hours_ago=7),
                        "endTime": self.generate_timestamp(days_ago=day+1, hours_ago=6.9)
                    },
                    {
                        "stage": "STAGE_TYPE_LIGHT",
                        "startTime": self.generate_timestamp(days_ago=day+1, hours_ago=6.9),
                        "endTime": self.generate_timestamp(days_ago=day+1, hours_ago=5)
                    },
                    {
                        "stage": "STAGE_TYPE_DEEP",
                        "startTime": self.generate_timestamp(days_ago=day+1, hours_ago=5),
                        "endTime": self.generate_timestamp(days_ago=day+1, hours_ago=3)
                    },
                    {
                        "stage": "STAGE_TYPE_REM",
                        "startTime": self.generate_timestamp(days_ago=day+1, hours_ago=3),
                        "endTime": self.generate_timestamp(days_ago=day, hours_ago=24-7)
                    }
                ],
                "metadata": {
                    "dataOrigin": "com.google.android.apps.fitness",
                    "device": {
                        "manufacturer": "Google",
                        "model": "Pixel Watch",
                        "type": "WATCH"
                    },
                    "clientRecordId": f"client_sleep_{day}",
                    "lastModifiedTime": self.generate_timestamp(days_ago=day)
                }
            })
        return samples
    
    def generate_body_temperature_sample(self) -> List[Dict[str, Any]]:
        """体温データのサンプル"""
        samples = []
        for day in range(7):  # 過去7日分
            temp = 36.5 + random.uniform(-0.3, 0.5)
            samples.append({
                "id": f"temp_{day}",
                "dataType": "BodyTemperature",
                "temperature": {
                    "value": round(temp, 1),
                    "unit": "CELSIUS"
                },
                "time": self.generate_timestamp(days_ago=day, hours_ago=16),  # 朝8時測定
                "measurementLocation": "MEASUREMENT_LOCATION_ARMPIT",
                "metadata": {
                    "dataOrigin": "com.healthcare.thermometer",
                    "device": {
                        "manufacturer": "OMRON",
                        "model": "MC-681",
                        "type": "UNKNOWN"
                    },
                    "clientRecordId": f"client_temp_{day}",
                    "lastModifiedTime": self.generate_timestamp(days_ago=day)
                }
            })
        return samples
    
    def generate_exercise_sample(self) -> List[Dict[str, Any]]:
        """運動データのサンプル"""
        exercises = ["RUNNING", "WALKING", "CYCLING", "SWIMMING"]
        samples = []
        for day in range(5):  # 過去5日分
            exercise_type = random.choice(exercises)
            duration = random.randint(20, 60)  # 20-60分
            calories = duration * random.randint(5, 10)
            samples.append({
                "id": f"exercise_{day}",
                "dataType": "ExerciseSession",
                "exerciseType": f"EXERCISE_TYPE_{exercise_type}",
                "startTime": self.generate_timestamp(days_ago=day, hours_ago=8),
                "endTime": self.generate_timestamp(days_ago=day, hours_ago=8-duration/60),
                "duration": duration * 60 * 1000,  # ミリ秒
                "calories": calories,
                "distance": duration * 100 if exercise_type in ["RUNNING", "WALKING", "CYCLING"] else None,
                "metadata": {
                    "dataOrigin": "com.strava.app",
                    "device": {
                        "manufacturer": "Garmin",
                        "model": "Forerunner 255",
                        "type": "WATCH"
                    },
                    "clientRecordId": f"client_exercise_{day}",
                    "lastModifiedTime": self.generate_timestamp(days_ago=day)
                }
            })
        return samples
    
    def generate_all_samples(self) -> Dict[str, Any]:
        """全データタイプのサンプル生成"""
        return {
            "generatedAt": self.current_time.isoformat(),
            "description": "Health Connect API データ構造サンプル（実データではありません）",
            "dataTypes": {
                "Steps": {
                    "description": "歩数データ",
                    "samples": self.generate_steps_sample()[:3]  # 3件のサンプル
                },
                "HeartRate": {
                    "description": "心拍数データ",
                    "samples": self.generate_heart_rate_sample()[:3]
                },
                "BloodPressure": {
                    "description": "血圧データ",
                    "samples": self.generate_blood_pressure_sample()[:3]
                },
                "Weight": {
                    "description": "体重データ",
                    "samples": self.generate_weight_sample()[:3]
                },
                "SleepSession": {
                    "description": "睡眠データ",
                    "samples": self.generate_sleep_sample()[:2]
                },
                "BodyTemperature": {
                    "description": "体温データ",
                    "samples": self.generate_body_temperature_sample()[:3]
                },
                "ExerciseSession": {
                    "description": "運動データ",
                    "samples": self.generate_exercise_sample()[:2]
                }
            },
            "permissions": {
                "required": [
                    "android.permission.health.READ_STEPS",
                    "android.permission.health.READ_HEART_RATE",
                    "android.permission.health.READ_BLOOD_PRESSURE",
                    "android.permission.health.READ_WEIGHT",
                    "android.permission.health.READ_SLEEP",
                    "android.permission.health.READ_BODY_TEMPERATURE",
                    "android.permission.health.READ_EXERCISE"
                ]
            },
            "dataOrigins": {
                "description": "データ提供元アプリの例",
                "apps": [
                    "com.google.android.apps.fitness (Google Fit)",
                    "com.samsung.health (Samsung Health)",
                    "com.withings.wiscale2 (Withings)",
                    "com.omron.connect (OMRON Connect)",
                    "com.strava.app (Strava)",
                    "com.fitbit.FitbitMobile (Fitbit)"
                ]
            }
        }

def main():
    print("🔬 Health Connect データ構造サンプル生成")
    print("=" * 50)
    
    generator = HealthConnectSampleGenerator()
    samples = generator.generate_all_samples()
    
    # ファイル保存
    filename = f"health_connect_sample_data_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(samples, f, indent=2, ensure_ascii=False)
    
    print(f"✅ サンプルデータを生成しました: {filename}")
    
    # サマリー表示
    print("\n📊 生成されたデータタイプ:")
    for data_type, info in samples["dataTypes"].items():
        print(f"  - {data_type}: {len(info['samples'])}件のサンプル")
    
    print("\n💡 このデータは実際のHealth Connect APIのデータ構造を模したサンプルです")
    print("実際のデータ取得には適切な権限とHealth Connectアプリが必要です")

if __name__ == "__main__":
    main()