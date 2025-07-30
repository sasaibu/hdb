// HDBアプリ デザインシステム - オレンジ基調・親しみやすい・健康テーマ

export const theme = {
  // カラーパレット - オレンジ基調
  colors: {
    // プライマリカラー（オレンジ系）
    primary: {
      50: '#FFF7ED',   // 最も薄いオレンジ
      100: '#FFEDD5',  // 薄いオレンジ
      200: '#FED7AA',  // ライトオレンジ
      300: '#FDBA74',  // ソフトオレンジ
      400: '#FB923C',  // ミディアムオレンジ
      500: '#F97316',  // メインオレンジ
      600: '#EA580C',  // 濃いオレンジ
      700: '#C2410C',  // ダークオレンジ
      800: '#9A3412',  // 深いオレンジ
      900: '#7C2D12',  // 最も濃いオレンジ
    },
    
    // セカンダリカラー（健康的なグリーン）
    secondary: {
      50: '#F0FDF4',   // 薄いグリーン
      100: '#DCFCE7',  // ライトグリーン
      200: '#BBF7D0',  // ソフトグリーン
      300: '#86EFAC',  // ミディアムグリーン
      400: '#4ADE80',  // ブライトグリーン
      500: '#22C55E',  // メイングリーン
      600: '#16A34A',  // 濃いグリーン
      700: '#15803D',  // ダークグリーン
      800: '#166534',  // 深いグリーン
      900: '#14532D',  // 最も濃いグリーン
    },
    
    // アクセントカラー（温かみのあるイエロー）
    accent: {
      50: '#FEFCE8',   // 薄いイエロー
      100: '#FEF3C7',  // ライトイエロー
      200: '#FDE68A',  // ソフトイエロー
      300: '#FCD34D',  // ミディアムイエロー
      400: '#FBBF24',  // ブライトイエロー
      500: '#F59E0B',  // メインイエロー
      600: '#D97706',  // 濃いイエロー
      700: '#B45309',  // ダークイエロー
      800: '#92400E',  // 深いイエロー
      900: '#78350F',  // 最も濃いイエロー
    },
    
    // グレースケール（温かみのあるグレー）
    gray: {
      50: '#FAFAF9',   // ほぼ白
      100: '#F5F5F4',  // 薄いグレー
      200: '#E7E5E4',  // ライトグレー
      300: '#D6D3D1',  // ソフトグレー
      400: '#A8A29E',  // ミディアムグレー
      500: '#78716C',  // メイングレー
      600: '#57534E',  // 濃いグレー
      700: '#44403C',  // ダークグレー
      800: '#292524',  // 深いグレー
      900: '#1C1917',  // 最も濃いグレー
    },
    
    // システムカラー
    success: '#22C55E',    // 成功（グリーン）
    warning: '#F59E0B',    // 警告（イエロー）
    error: '#EF4444',      // エラー（レッド）
    info: '#3B82F6',       // 情報（ブルー）
    
    // 背景色
    background: {
      primary: '#FFFFFF',     // メイン背景
      secondary: '#FAFAF9',   // セカンダリ背景
      tertiary: '#FFF7ED',    // オレンジ系背景
    },
    
    // テキストカラー
    text: {
      primary: '#1C1917',     // メインテキスト
      secondary: '#44403C',   // セカンダリテキスト
      tertiary: '#78716C',    // 薄いテキスト
      inverse: '#FFFFFF',     // 反転テキスト
    },
    
    // ボーダーカラー
    border: {
      light: '#E7E5E4',      // 薄いボーダー
      medium: '#D6D3D1',     // 中間ボーダー
      dark: '#A8A29E',       // 濃いボーダー
    },
  },
  
  // タイポグラフィ
  typography: {
    fontFamily: {
      primary: 'System',     // システムフォント
      secondary: 'Helvetica Neue', // セカンダリフォント
    },
    
    fontSize: {
      xs: 12,    // 極小
      sm: 14,    // 小
      base: 16,  // 基本
      lg: 18,    // 大
      xl: 20,    // 特大
      '2xl': 24, // 見出し小
      '3xl': 30, // 見出し中
      '4xl': 36, // 見出し大
      '5xl': 48, // タイトル
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // スペーシング
  spacing: {
    xs: 4,    // 極小
    sm: 8,    // 小
    md: 16,   // 中
    lg: 24,   // 大
    xl: 32,   // 特大
    '2xl': 48, // 超大
    '3xl': 64, // 巨大
  },
  
  // ボーダー半径
  borderRadius: {
    none: 0,
    sm: 4,     // 小さい角丸
    md: 8,     // 中間角丸
    lg: 12,    // 大きい角丸
    xl: 16,    // 特大角丸
    '2xl': 24, // 超大角丸
    full: 9999, // 完全な円
  },
  
  // シャドウ
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // アニメーション
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  
  // コンポーネント固有のスタイル
  components: {
    // ボタンスタイル
    button: {
      primary: {
        backgroundColor: '#F97316', // メインオレンジ
        color: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
      },
      secondary: {
        backgroundColor: '#FFF7ED', // 薄いオレンジ
        color: '#EA580C',           // 濃いオレンジ
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#FED7AA',
      },
      success: {
        backgroundColor: '#22C55E', // グリーン
        color: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
      },
    },
    
    // カードスタイル
    card: {
      default: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F5F5F4',
      },
      highlighted: {
        backgroundColor: '#FFF7ED', // 薄いオレンジ背景
        borderRadius: 16,
        padding: 20,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 2,
        borderColor: '#FED7AA',
      },
    },
    
    // 入力フィールドスタイル
    input: {
      default: {
        backgroundColor: '#FAFAF9',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E7E5E4',
        fontSize: 16,
        color: '#1C1917',
      },
      focused: {
        borderColor: '#F97316',
        borderWidth: 2,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      },
      error: {
        borderColor: '#EF4444',
        borderWidth: 2,
      },
    },
  },
  
  // ヘルスケア固有のカラー
  health: {
    // バイタルデータ別カラー
    vitals: {
      steps: '#F97316',      // 歩数 - メインオレンジ
      weight: '#22C55E',     // 体重 - グリーン
      temperature: '#EF4444', // 体温 - レッド
      bloodPressure: '#8B5CF6', // 血圧 - パープル
      heartRate: '#EC4899',  // 心拍数 - ピンク
      pulse: '#06B6D4',      // 脈拍 - シアン
    },
    
    // 達成度カラー
    achievement: {
      excellent: '#22C55E',  // 優秀 - グリーン
      good: '#F59E0B',       // 良好 - イエロー
      average: '#F97316',    // 平均 - オレンジ
      poor: '#EF4444',       // 要改善 - レッド
    },
    
    // グラデーション
    gradients: {
      primary: ['#F97316', '#FB923C'], // オレンジグラデーション
      success: ['#22C55E', '#4ADE80'], // グリーングラデーション
      warm: ['#F59E0B', '#F97316'],    // 温かみのあるグラデーション
    },
  },
};

// テーマタイプ定義
export type Theme = typeof theme;

// デフォルトエクスポート
export default theme;
