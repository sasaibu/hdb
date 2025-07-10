# iOS開発環境構築手順書

## 概要
Health Data Bank (HDB) iOSアプリの開発環境を構築するための手順書です。

**注意**: iOS開発はMacでのみ可能です。

---

## Mac環境での構築手順

### 1. macOSバージョンの確認
iOS開発には以下のmacOSバージョンが必要：
- macOS 12.5（Monterey）以上推奨
- macOS 13（Ventura）以上を強く推奨

確認方法：
```bash
sw_vers
```

### 2. Homebrew のインストール
1. ターミナルを開く
2. 以下のコマンドを実行：
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

### 3. Node.js のインストール
```bash
brew install node
```
確認：
```bash
node --version  # 18.x以上
npm --version
```

### 4. Git のインストール
```bash
brew install git
```
確認：
```bash
git --version
```

### 5. Xcode のインストール
1. App Storeを開く
2. 「Xcode」を検索してインストール（約15GB）
3. インストール完了後、Xcodeを起動
4. 利用規約に同意
5. 追加コンポーネントのインストールを実行

### 6. Xcode Command Line Tools のインストール
```bash
xcode-select --install
```

確認：
```bash
xcode-select -p
# /Applications/Xcode.app/Contents/Developer が表示されることを確認
```

### 7. CocoaPods のインストール
```bash
sudo gem install cocoapods
```

確認：
```bash
pod --version
```

### 8. iOS Simulator の確認
1. Xcodeを起動
2. 「Window」→「Devices and Simulators」を開く
3. 「Simulators」タブで以下を確認：
   - iPhone 14 Pro (iOS 16.x)
   - iPhone 15 (iOS 17.x)

不足している場合は「+」ボタンから追加

### 9. プロジェクトのセットアップ
1. ターミナルでプロジェクトディレクトリに移動：
   ```bash
   cd HDBApp
   ```

2. Node.js依存関係をインストール：
   ```bash
   npm install
   ```

3. iOS依存関係をインストール：
   ```bash
   cd ios
   pod install
   cd ..
   ```

### 10. アプリの実行
以下のいずれかの方法でアプリを実行：

#### 方法1: npm scriptsを使用
```bash
npm run ios
```

#### 方法2: 特定のシミュレーターを指定
```bash
npx react-native run-ios --simulator="iPhone 15"
```

#### 方法3: Xcodeから実行
1. `HDBApp/ios/HDBApp.xcworkspace` をXcodeで開く
2. ターゲットデバイスを選択
3. 「▶️」ボタンをクリックして実行

---

## 開発者アカウントの設定（実機テスト用）

### 1. Apple Developer Programへの登録
1. [Apple Developer](https://developer.apple.com/) にアクセス
2. Apple IDでサインイン
3. Developer Programに登録（年間12,980円）

### 2. 開発者証明書の設定
1. Xcodeで `HDBApp.xcworkspace` を開く
2. プロジェクトナビゲーターでプロジェクト名をクリック
3. 「Signing & Capabilities」タブを選択
4. 「Team」で開発者アカウントを選択
5. 「Bundle Identifier」を一意の値に変更

### 3. 実機での実行
1. iPhoneをUSBケーブルでMacに接続
2. iPhone側で「このコンピュータを信頼しますか？」→「信頼」
3. Xcodeでターゲットデバイスとして実機を選択
4. 「▶️」ボタンをクリックして実行

---

## Xcodeプロジェクトの設定

### 1. プロジェクト設定の確認
- **Deployment Target**: iOS 12.4以上
- **Bundle Identifier**: com.yourcompany.hdbapp（変更推奨）
- **Version**: 1.0
- **Build**: 1

### 2. 権限設定の追加
`ios/HDBApp/Info.plist` に以下を追加：

```xml
<key>NSHealthShareUsageDescription</key>
<string>このアプリは健康データを読み取るために使用します</string>
<key>NSHealthUpdateUsageDescription</key>
<string>このアプリは健康データを更新するために使用します</string>
<key>NSCameraUsageDescription</key>
<string>プロフィール写真の撮影に使用します</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>プロフィール写真の選択に使用します</string>
```

### 3. Capabilities の設定
1. Xcodeでプロジェクトを開く
2. 「Signing & Capabilities」タブを選択
3. 「+ Capability」をクリックして以下を追加：
   - HealthKit
   - Background App Refresh（必要に応じて）

---

## トラブルシューティング

### 一般的な問題

#### 1. `pod install` でエラーが発生
```bash
cd ios
pod deintegrate
pod clean
pod install
```

#### 2. Xcodeでビルドエラー
- **Clean Build Folder**: Xcode メニュー「Product」→「Clean Build Folder」
- **Derived Data削除**: 
  ```bash
  rm -rf ~/Library/Developer/Xcode/DerivedData
  ```

#### 3. Metro bundler エラー
```bash
npx react-native start --reset-cache
```

#### 4. シミュレーターが起動しない
```bash
xcrun simctl shutdown all
xcrun simctl erase all
```

#### 5. Node modules関連エラー
```bash
rm -rf node_modules
npm install
cd ios && pod install && cd ..
```

### Apple Silicon (M1/M2) Mac特有の問題

#### 1. CocoaPods インストールエラー
```bash
sudo arch -x86_64 gem install ffi
sudo arch -x86_64 gem install cocoapods
```

#### 2. pod install でアーキテクチャエラー
```bash
cd ios
arch -x86_64 pod install
```

### Xcode関連エラー

#### 1. 「No suitable simulator found」エラー
```bash
xcrun simctl list devices
```
で利用可能なシミュレーターを確認

#### 2. 証明書エラー
1. Xcodeの「Preferences」→「Accounts」を開く
2. Apple IDを追加/再認証
3. 「Download Manual Profiles」をクリック

---

## パフォーマンス最適化

### 1. Flipper の無効化（リリースビルド時）
`ios/Podfile` で以下を確認：
```ruby
use_flipper!({'Flipper' => '0.164.0'}) if !ENV['CI']
```

### 2. Hermes エンジンの有効化
`ios/Podfile` で以下を確認：
```ruby
:hermes_enabled => true
```

### 3. リリースビルドの実行
```bash
npx react-native run-ios --configuration Release
```

---

## 参考資料

- [React Native iOS開発環境構築](https://reactnative.dev/docs/environment-setup?platform=ios)
- [Xcode 公式ドキュメント](https://developer.apple.com/xcode/)
- [CocoaPods 公式サイト](https://cocoapods.org/)
- [Apple Developer ドキュメント](https://developer.apple.com/documentation/)
- [HealthKit 開発ガイド](https://developer.apple.com/documentation/healthkit)