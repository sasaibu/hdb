# Android開発環境構築手順書

## 概要
Health Data Bank (HDB) Androidアプリの開発環境を構築するための手順書です。

---

## Windows環境での構築手順

### 1. Node.js のインストール
1. [Node.js公式サイト](https://nodejs.org/) にアクセス
2. LTS版（18.x以上）をダウンロードしてインストール
3. コマンドプロンプトで確認：
   ```cmd
   node --version
   npm --version
   ```

### 2. Git のインストール
1. [Git公式サイト](https://git-scm.com/) からダウンロード
2. インストール実行（デフォルト設定で可）
3. コマンドプロンプトで確認：
   ```cmd
   git --version
   ```

### 3. Android Studio のインストール
1. [Android Studio公式サイト](https://developer.android.com/studio) からダウンロード
2. インストーラーを実行し、以下を含めてインストール：
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
3. 初回起動時のSetup Wizardでデフォルト設定を適用

### 4. Android SDK の設定
1. Android Studio起動後、「More Actions」→「SDK Manager」をクリック
2. 「SDK Platforms」タブで以下をインストール：
   - Android 13 (API level 33)
   - Android 12 (API level 31)
   - Android 11 (API level 30)
3. 「SDK Tools」タブで以下をインストール：
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools
   - Intel x86 Emulator Accelerator (HAXM installer)

   
### 5. Java Development Kit (JDK) のインストール
1. [temurin 17](https://adoptium.net/temurin/releases/)
   
2. 「Version」で 17 (LTS) を選択し、あなたのOS (Windows) とアーキテクチャ (x64) に合った 
   JDK パッケージ (.msi インストーラー) をダウンロードします。 
3. ダウンロードした .msi ファイルをダブルクリックしてインストーラーを起動します。
   
4. 画面の指示に従ってインストールを進めます。
   デフォルトのインストールパス（例: C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot）を控えておいてください。

### 6. 環境変数の設定 
 
1. スタートメニューで「環境変数」と検索し、「システム環境変数の編集」を開きます。
2. 開いたウィンドウで「環境変数(N)...」ボタンをクリックします。
3. 「システム環境変数」セクションで、以下の変数を新規で追加または編集します。

   - ANDROID_HOME の追加:
     - 変数名：ANDROID_HOME
     - 変数値：C:\Users\[ユーザー名]\AppData\Local\Android\Sdk （Android SDKの実際のインストールパスに置き換えてください）
     - 「OK」をクリックします。
   - JAVA_HOME の追加:
     - 変数名：JAVA_HOME
     - 変数値：C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot （JDKの実際のインストールパスに置き換えてください）
     - 「OK」をクリックします。
   - Path 変数の編集:
     - 「Path」という変数を選択し、「編集(I)...」をクリックします。
     - 「新規(N)」をクリックし、以下のパスを1つずつ追加します。
     -   %ANDROID_HOME%\platform-tools
     -   %ANDROID_HOME%\emulator
     -   %ANDROID_HOME%\tools
     -   %ANDROID_HOME%\tools\bin
     -   %JAVA_HOME%\bin
   - 追加したら「OK」をクリックします。

4. すべての環境変数のダイアログを「OK」で閉じます。
   
5. コマンドプロンプトまたはPowerShellを新しく開き直し、以下のコマンドで環境変数が正しく設定されているか確認します。

### 7. Android Virtual Device (AVD) の作成
1. Android Studio で「Tools」→「AVD Manager」を開く
2. 「Create Virtual Device」をクリック
3. 「Phone」カテゴリから「Pixel 4」を選択
4. System Image で「API 33」を選択してダウンロード
5. AVD設定を完了して作成

### 8. プロジェクトのセットアップ
1. コマンドプロンプトでプロジェクトディレクトリに移動
2. 依存関係をインストール：
   ```cmd
   cd HDBApp
   npm install
   ```

### 9. アプリの実行
1. Android エミュレーターを起動
2. 以下のコマンドでアプリを実行：
   ```cmd
   npm run android
   ```

---

## Mac環境での構築手順

### 1. Homebrew のインストール
1. ターミナルを開く
2. 以下のコマンドを実行：
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

### 2. Node.js のインストール
```bash
brew install node
```
確認：
```bash
node --version
npm --version
```

### 3. Git のインストール
```bash
brew install git
```
確認：
```bash
git --version
```

### 4. Java Development Kit (JDK) のインストール
```bash
brew install --cask temurin@17
```
確認：
```bash
java -version
```

### 5. Android Studio のインストール
```bash
brew install --cask android-studio
```

### 6. Android Studio の設定
1. Android Studioを起動
2. Setup Wizardでデフォルト設定を適用
3. ウェルカム画面の「More Actions」または上部メニューの「Tools」から「SDK Manager」をクリックします。
4. 「SDK Platforms」タブで以下をインストール：
   - Android 14 (API level 34) またはあなたがターゲットとする最新のAPIレベル
   - Android 13 (API level 33)
   - Android 12 (API level 31)
   - Android 11 (API level 30)
5. 「SDK Tools」タブで以下をインストール：
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

### 7. 環境変数の設定
1. シェル設定ファイルを開く（bash使用の場合）：
   ```bash
   nano ~/.bash_profile
   ```
   または（zsh使用の場合）：
   ```bash
   nano ~/.zshrc
   ```

2. 以下を追加：
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   # JDKのパスはHomebrewが自動でsymlinkを作成するため、通常は不要ですが、明示的に指定する場合は以下を追加
   # export JAVA_HOME=$(/usr/libexec/java_home -v 17) # JDK 17の場合
   # export PATH=$JAVA_HOME/bin:$PATH
   ```

3. 設定を反映：
   ```bash
   source ~/.bash_profile
   # または
   source ~/.zshrc
   ```

### 8. Android Virtual Device (AVD) の作成
1. Android Studio で「Tools」→「AVD Manager」を開く
2. 「Create Virtual Device」をクリック
3. 「Phone」カテゴリから「Pixel 4」または任意の推奨デバイスを選択し、「Next」をクリックします。
4. System Image で「API 34」を選択してダウンロード
5. AVDの設定画面で、名前やメモリ設定などを確認し、「Finish」をクリックして作成を完了します。

### 9. プロジェクトのセットアップ
```bash
cd HDBApp
npm install
```

### 10. アプリの実行
1. Android エミュレーターを起動
2. 以下のコマンドでアプリを実行：
   ```bash
   npm run android
   ```

---

## トラブルシューティング

### Windows
- **SDK Manager が開かない場合**: Android Studio を管理者権限で実行
- **エミュレーターが起動しない場合**: HAXM が正しくインストールされているか確認
- **ビルドエラー**: 環境変数 `ANDROID_HOME` と `JAVA_HOME` が正しく設定されているか確認

### Mac
- **brew コマンドが見つからない場合**: Homebrew が正しくインストールされているか確認
- **権限エラー**: `sudo` を使用してコマンドを実行
- **エミュレーターが起動しない場合**: Macの「システム環境設定」→「セキュリティとプライバシー」で許可

### 共通
- **Metro bundler エラー**: `npx react-native start --reset-cache` でキャッシュをクリア
- **依存関係エラー**: `npm install` を再実行
- **Android SDK エラー**: Android Studio の SDK Manager で必要なコンポーネントがインストールされているか確認

---

## 参考資料

- [React Native 公式ドキュメント](https://reactnative.dev/docs/environment-setup)
- [Android Studio 公式ドキュメント](https://developer.android.com/studio)
- [Node.js 公式サイト](https://nodejs.org/)