# 地理編碼設定指南 / Geocoding Setup Guide

## OpenCage API 設定

本專案使用 OpenCage Geocoding API 來將座標轉換為地址。

### 1. 註冊 OpenCage API

1. 前往 [OpenCage Data](https://opencagedata.com/api) 註冊帳號
2. 建立新的 API key
3. 選擇適合的方案（免費版本每日 2,500 次查詢）

### 2. 設定環境變數

在專案根目錄建立 `.env.local` 檔案，並添加：

```env
# OpenCage Geocoding API 設定
NEXT_PUBLIC_OPENCAGE_API_KEY=your_opencage_api_key_here
```

### 3. API 特色

✅ **繁體中文支援**：設定 `language=zh` 參數  
✅ **台灣地區限制**：使用 `countrycode=tw` 參數  
✅ **備用方案**：API 失敗時提供模擬地址  
✅ **信心度評分**：提供地址準確度評分 (1-10)  
✅ **詳細地址組件**：包含國家、縣市、城市、道路等資訊

### 4. 使用限制

-   **免費版本**：每日 2,500 次查詢
-   **付費版本**：更高的查詢限制和更多功能
-   **查詢頻率**：最多每秒 1 次查詢

### 5. 備用方案

如果沒有設定 API key 或 API 失敗，系統會自動提供：

-   座標資訊顯示
-   模擬地址格式：`台灣地區 (緯度, 經度)`
-   基本地址組件

### 6. 測試方式

1. 開啟專案並新增熱點
2. 檢查是否正確顯示地址資訊
3. 驗證座標轉換功能是否正常運作

---

## 技術細節

### API 呼叫範例

```javascript
const response = await fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=${apiKey}&language=zh&countrycode=tw`
);
```

### 回應格式

```json
{
    "results": [
        {
            "formatted": "台灣台北市信義區...",
            "components": {
                "country": "台灣",
                "state": "台北市",
                "city": "信義區",
                "road": "信義路"
            },
            "confidence": 9
        }
    ]
}
```

### 錯誤處理

-   網路錯誤：自動切換到備用方案
-   API 限制：顯示錯誤訊息並提供座標資訊
-   無效座標：使用預設地址格式

---

## 相關檔案

-   `src/utils/geocoding.ts` - 地理編碼主要功能
-   `src/types/index.ts` - 地址相關類型定義
-   `src/components/HotspotForm.tsx` - 熱點表單組件
-   `src/components/HotspotMarker.tsx` - 熱點標記組件
