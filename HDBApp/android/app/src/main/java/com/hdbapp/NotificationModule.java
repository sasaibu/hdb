package com.hdbapp;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class NotificationModule extends ReactContextBaseJavaModule {
    private static final String CHANNEL_ID = "HDB_NOTIFICATIONS";
    private static final String CHANNEL_NAME = "HDB Notifications";
    private static final String CHANNEL_DESCRIPTION = "Health Data Bank notifications";
    
    private ReactApplicationContext reactContext;
    private NotificationManager notificationManager;

    public NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.notificationManager = (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public String getName() {
        return "NotificationModule";
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription(CHANNEL_DESCRIPTION);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @ReactMethod
    public void showNotification(ReadableMap notification) {
        String title = notification.hasKey("title") ? notification.getString("title") : "HDB Notification";
        String body = notification.hasKey("body") ? notification.getString("body") : "";
        int notificationId = notification.hasKey("id") ? notification.getInt("id") : (int) System.currentTimeMillis();

        NotificationCompat.Builder builder = new NotificationCompat.Builder(reactContext, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(reactContext);
        if (notificationManager.areNotificationsEnabled()) {
            notificationManager.notify(notificationId, builder.build());
        }
    }
}