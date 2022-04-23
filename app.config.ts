import { ExpoConfig } from '@expo/config-types'

const config: ExpoConfig = {
    name: "chatapp",
    slug: "chatapp",
    version: "1.0.0",
    extra: {
        timeout: process.env.TIMEOUT,
    },
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
    },
    updates: {
        fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
        "**/*"
    ],
    ios: {
        supportsTablet: true,
        infoPlist: {
            NSPhotoLibraryUsageDescription: "The app accesses your photos to let you share them with your friends.",
            NSCameraUsageDescription: "Allow $(PRODUCT_NAME) to access your camera",
            NSMicrophoneUsageDescription: "Allow $(PRODUCT_NAME) to access your microphone"
        }
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            backgroundColor: "#ffffff"
        },
        intentFilters: [
            {
                action: "android.intent.action.MAIN",
                category: [
                    "android.intent.category.LAUNCHER",
                    // "android.intent.category.HOME",
                    // "android.intent.category.DEFAULT",
                    "com.google.android.glass.category.DIRECTORY"
                ],
            }
        ],
        permissions: [
            "android.permission.CAMERA",
            "android.permission.READ_EXTERNAL_STORAGE",
            "android.permission.WRITE_EXTERNAL_STORAGE",
            "android.permission.RECORD_AUDIO"
        ],
        // versionCode: 27,
        // runtimeVersion: "27",

        package: "com.from20020516.chatapp"
    },
    web: {
        favicon: "./assets/images/favicon.png"
    },
    plugins: [
        [
            "expo-image-picker",
            {
                photosPermission: "The app accesses your photos to let you share them with your friends."
            }
        ]
    ]
}

export default config
