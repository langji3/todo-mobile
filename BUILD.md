# Build Guide

## 前提条件

- Android Studio 已安装
- Java 17
- Android SDK 路径：`D:\Android\Sdk`

## 手机端开发测试

1. 手机安装 **Expo Go** App
2. 手机和电脑连同一个 WiFi
3. 启动开发服务器：
   ```bash
   npx expo start
   ```
4. 用 Expo Go 扫描终端中的二维码

## 生产环境测试

启动时加 `--no-dev` 参数，`__DEV__` 为 false，请求走生产地址：
```bash
npx expo start --no-dev --minify
```

## 打包 Release APK

### 1. 生成原生项目（首次或更换图标/名字后需要）

```bash
npx expo prebuild --clean
```

### 2. prebuild 后必须手动修改的文件

以下两个文件每次 `prebuild --clean` 后会被重置，需要重新修改：

**`android/local.properties`**（SDK 路径）：
```
sdk.dir=D\:\\Android\\Sdk
```

**`android/app/src/main/AndroidManifest.xml`**（允许 HTTP 明文请求）：

在 `<application>` 标签中添加 `android:usesCleartextTraffic="true"`：
```xml
<application ... android:usesCleartextTraffic="true" ...>
```

### 3. 用 Android Studio 打包

1. 打开 Android Studio → **Open an Existing Project**
2. 选择项目的 `android` 文件夹
3. 等待 Gradle 同步完成
4. 菜单栏 **Build → Generate Signed Bundle / APK...**
5. 选择 **APK** → Next
6. 首次需 **Create new...** 创建 keystore，之后选已有 keystore
7. Build Variants 选 **release** → **Create**
8. 构建完成后 APK 在 `android/app/release/app-release.apk`

## 环境配置

| 环境 | BASE_URL | 说明 |
|------|----------|------|
| 开发 | `http://192.168.1.5:8088` | 局域网 IP，手机需同 WiFi |
| 生产 | `http://api.dlacm.top/todo` | 后端 context-path 为 `/todo` |

配置位置：`services/api.ts`
```typescript
const BASE_URL = __DEV__ ? 'http://192.168.1.5:8088' : 'http://api.dlacm.top/todo';
```

## 内存不足

如遇 `OutOfMemoryError: Metaspace`，修改 `android/gradle.properties`：
```
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```
