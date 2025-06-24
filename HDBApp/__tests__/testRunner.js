// Test Runner Script
// このスクリプトを使用してテストを実行できます

const { exec } = require('child_process');
const path = require('path');

const runTests = () => {
  console.log('🧪 HDB App テストスイートを開始します...\n');
  
  const testCommand = 'npm test -- --verbose --coverage';
  
  const testProcess = exec(testCommand, {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });

  testProcess.stdout?.on('data', (data) => {
    console.log(data.toString());
  });

  testProcess.stderr?.on('data', (data) => {
    console.error(data.toString());
  });

  testProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ すべてのテストが成功しました！');
    } else {
      console.log(`\n❌ テストが失敗しました (exit code: ${code})`);
    }
    
    console.log('\n📊 カバレッジレポートが生成されました:');
    console.log('  - coverage/lcov-report/index.html (HTML版)');
    console.log('  - coverage/lcov.info (LCOV形式)');
  });
};

// 引数でテストタイプを指定可能
const testType = process.argv[2];

if (testType === 'watch') {
  console.log('👀 ウォッチモードでテストを開始します...');
  exec('npm test -- --watchAll', { stdio: 'inherit' });
} else if (testType === 'coverage') {
  console.log('📊 カバレッジ測定付きでテストを実行します...');
  exec('npm test -- --coverage', { stdio: 'inherit' });
} else {
  runTests();
}