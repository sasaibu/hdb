import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  MainDrawerParamList,
  RootStackParamList,
} from '../navigation/AppNavigator';
import {VitalDataService} from '../services/VitalDataService';
import {VitalDataRecord} from '../services/DatabaseService';

type VitalListScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<MainDrawerParamList, 'Settings'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: VitalListScreenNavigationProp;
}

interface VitalTab {
  id: string;
  title: string;
  icon: string;
  unit: string;
}

interface VitalListItem {
  id: string;
  date: string;
  value: string;
  numericValue: number;
}

const VITAL_TABS: VitalTab[] = [
  {id: 'steps', title: '歩数', icon: '👟', unit: '歩'},
  {id: 'weight', title: '体重', icon: '⚖️', unit: 'kg'},
  {id: 'temperature', title: '体温', icon: '🌡️', unit: '℃'},
  {id: 'bloodPressure', title: '血圧', icon: '🩺', unit: 'mmHg'},
  {id: 'heartRate', title: '心拍数', icon: '❤️', unit: 'bpm'},
  {id: 'pulse', title: '脈拍', icon: '💓', unit: 'bpm'},
];

const VitalListScreen = ({navigation}: Props) => {
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [vitalData, setVitalData] = useState<{[key: string]: VitalListItem[]}>({});
  const [loading, setLoading] = useState(true);
  const [vitalDataService] = useState(() => new VitalDataService());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VitalListItem | null>(null);
  const [editValue, setEditValue] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;

  // データ読み込み
  const loadVitalData = async () => {
    try {
      setLoading(true);
      await vitalDataService.initializeService();

      const allData: {[key: string]: VitalListItem[]} = {};

      for (const tab of VITAL_TABS) {
        const vitalType = getVitalTypeFromId(tab.id);
        const existingData = await vitalDataService.getVitalDataByType(vitalType);
        
        if (existingData.length === 0) {
          await vitalDataService.insertDummyData();
        }

        const data = await vitalDataService.getVitalDataByPeriod(vitalType, 'all');
        const formattedData = data.map(item => ({
          id: item.id?.toString() || '0',
          date: item.recorded_date,
          value: vitalDataService.formatValueForDisplay(item),
          numericValue: item.value,
        }));

        allData[tab.id] = formattedData;
      }

      setVitalData(allData);
    } catch (error) {
      console.error('Error loading vital data:', error);
      Alert.alert('エラー', 'データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // バイタル種別IDから実際の型名に変換
  const getVitalTypeFromId = (id: string): string => {
    const typeMap: {[key: string]: string} = {
      steps: '歩数',
      weight: '体重',
      bloodPressure: '血圧',
      heartRate: '心拍数',
      pulse: '脈拍',
      temperature: '体温',
    };
    return typeMap[id] || id;
  };

  // APIで使用される型名に変換
  const getApiTypeFromId = (id: string): string => {
    const apiTypeMap: {[key: string]: string} = {
      steps: 'steps',
      weight: 'weight',
      bloodPressure: 'bloodPressure',
      heartRate: 'heartRate',
      pulse: 'pulse',
      temperature: 'temperature',
    };
    return apiTypeMap[id] || id;
  };

  useEffect(() => {
    loadVitalData();
  }, []);

  // タブ切り替え
  const handleTabPress = (index: number) => {
    setActiveTab(index);
    setEditMode(false);
    setSelectedItems([]);
    
    // デバッグ: 脈拍タブの場合
    const tab = VITAL_TABS[index];
    if (tab.id === 'pulse') {
      console.log('Switching to pulse tab - clearing all states');
    }
    
    // スクロールビューを該当位置に移動
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
    }
  };

  // 左右ナビゲーション
  const handlePrevTab = () => {
    if (activeTab > 0) {
      handleTabPress(activeTab - 1);
    }
  };

  const handleNextTab = () => {
    if (activeTab < VITAL_TABS.length - 1) {
      handleTabPress(activeTab + 1);
    }
  };

  // 編集モード切り替え
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedItems([]);
  };

  // アイテム選択
  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (selectedItems.length === 0) return;

    Alert.alert(
      '削除確認',
      `${selectedItems.length}件のデータを削除しますか？`,
      [
        {text: 'キャンセル', style: 'cancel'},
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const id of selectedItems) {
                await vitalDataService.deleteVitalData(parseInt(id));
              }
              await loadVitalData();
              setSelectedItems([]);
              setEditMode(false);
              Alert.alert('成功', 'データを削除しました。');
            } catch (error) {
              console.error('Error deleting data:', error);
              Alert.alert('エラー', 'データの削除に失敗しました。');
            }
          },
        },
      ]
    );
  };

  // アイテムタップ処理
  const handleItemPress = (item: VitalListItem) => {
    const currentTab = VITAL_TABS[activeTab];
    
    if (editMode) {
      toggleItemSelection(item.id);
    } else {
      // 歩数と心拍数の場合は詳細画面へ
      if (currentTab.id === 'steps' || currentTab.id === 'heartRate') {
        navigation.navigate('VitalDetail', {
          vitalType: currentTab.title,
          date: item.date,
          recordId: item.id,
        });
      } else {
        // その他は編集モーダルを表示
        setEditingItem(item);
        setEditValue(item.numericValue.toString());
        setShowEditModal(true);
      }
    }
  };

  // 編集保存処理
  const handleSaveEdit = async () => {
    if (!editingItem || !editValue) return;

    try {
      const numericValue = parseFloat(editValue);
      if (isNaN(numericValue)) {
        Alert.alert('エラー', '正しい数値を入力してください。');
        return;
      }

      // データを更新
      await vitalDataService.updateVitalData(
        parseInt(editingItem.id),
        numericValue
      );

      // 画面を更新
      await loadVitalData();
      setShowEditModal(false);
      setEditingItem(null);
      setEditValue('');
      Alert.alert('成功', 'データを更新しました。');
    } catch (error) {
      console.error('Error updating data:', error);
      Alert.alert('エラー', 'データの更新に失敗しました。');
    }
  };

  // タブレンダリング
  const renderTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabContainer}
      contentContainerStyle={styles.tabContent}>
      {VITAL_TABS.map((tab, index) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === index && styles.activeTab,
          ]}
          onPress={() => handleTabPress(index)}>
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text
            style={[
              styles.tabText,
              activeTab === index && styles.activeTabText,
            ]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // データリストレンダリング
  const renderVitalList = () => {
    const currentTab = VITAL_TABS[activeTab];
    const data = vitalData[currentTab.id] || [];
    

    const renderItem = ({item}: {item: VitalListItem}) => (
      <TouchableOpacity
        style={[
          styles.listItem,
          selectedItems.includes(item.id) && styles.selectedItem,
        ]}
        onPress={() => handleItemPress(item)}>
        {editMode && (
          <View style={styles.checkbox}>
            <Text style={styles.checkboxText}>
              {selectedItems.includes(item.id) ? '✓' : '○'}
            </Text>
          </View>
        )}
        <View style={styles.itemContent}>
          <Text style={styles.itemIcon}>{currentTab.icon}</Text>
          <View style={styles.itemInfo}>
            <Text style={styles.itemDate}>{item.date}</Text>
            <Text style={styles.itemValue}>{item.value}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );

    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {currentTab.title}のデータがありません
            </Text>
          </View>
        }
      />
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>データを読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>バイタル一覧</Text>
        <TouchableOpacity style={styles.editButton} onPress={toggleEditMode}>
          <Text style={styles.editButtonText}>
            {editMode ? '完了' : '編集'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* タブ */}
      {renderTabs()}

      {/* 削除ボタン（編集モード時） */}
      {editMode && selectedItems.length > 0 && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>
            {selectedItems.length}件削除
          </Text>
        </TouchableOpacity>
      )}

      {/* データリスト */}
      {renderVitalList()}

      {/* 編集モーダル */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem && VITAL_TABS[activeTab].title}の編集
            </Text>
            <Text style={styles.modalDate}>{editingItem?.date}</Text>
            
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              placeholder="値を入力"
            />
            
            <Text style={styles.modalUnit}>
              {VITAL_TABS[activeTab].unit}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setEditValue('');
                }}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 60,
  },
  tabContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 44,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingTop: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    width: '100%',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalUnit: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VitalListScreen;
