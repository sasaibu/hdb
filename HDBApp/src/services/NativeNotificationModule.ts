import {NativeModules} from 'react-native';

interface NotificationModuleInterface {
  showNotification: (notification: {
    title: string;
    body: string;
    id?: number;
  }) => void;
}

const {NotificationModule} = NativeModules;

export default NotificationModule as NotificationModuleInterface;