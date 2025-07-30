import React, {useEffect} from 'react';
import {Alert, Platform, ActionSheetIOS} from 'react-native';
import {DrawerScreenProps} from '@react-navigation/drawer';
import {MainDrawerParamList} from '../navigation/AppNavigator';
import {useAuth} from '../hooks/useAuth';
import {CommonActions} from '@react-navigation/native';

type Props = DrawerScreenProps<MainDrawerParamList, 'Logout'>;

const LogoutScreen: React.FC<Props> = ({navigation}) => {
  const {logout} = useAuth();

  useEffect(() => {
    showLogoutConfirmation();
  }, []);

  const showLogoutConfirmation = () => {
    if (Platform.OS === 'ios') {
      // iOS: ActionSheetを使用
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['キャンセル', 'ログアウト'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
          title: 'ログアウト',
          message: 'ログアウトしてもよろしいですか？',
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            // ログアウトが選択された
            await logout();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'Login'}],
              })
            );
          } else {
            // キャンセルが選択された
            navigation.navigate('Home');
          }
        }
      );
    } else {
      // Android: Alertを使用
      Alert.alert(
        'ログアウト',
        'ログアウトしてもよろしいですか？',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
            onPress: () => {
              navigation.navigate('Home');
            },
          },
          {
            text: 'ログアウト',
            style: 'destructive',
            onPress: async () => {
              await logout();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{name: 'Login'}],
                })
              );
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {
            navigation.navigate('Home');
          },
        }
      );
    }
  };

  // このコンポーネントは何も表示しない
  return null;
};

export default LogoutScreen;