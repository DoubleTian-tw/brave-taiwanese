# Story-1 - 座標轉地址功能 / Coordinate to Address Feature

## 中文說明

**作為一個使用者**
我希望能將地圖上的座標轉換為實際地址，
讓我可以更直觀地理解地點資訊。

## English Description

**As a user**
I want to convert map coordinates to real addresses,
so I can intuitively understand location information.

## Status

Draft

## Context / 背景

-   本功能讓用戶在地圖上點選任一位置時，能即時取得該點的實際地址（反查地址）。
-   主要應用於熱點上報、避難所查詢等場景，提升資訊可讀性。
-   技術上將串接 nominatim API 進行 reverse geocoding。

This feature allows users to obtain the real address of any point clicked on the map (reverse geocoding). It is mainly used in hotspot reporting and shelter lookup scenarios to improve information readability. Technically, it will integrate the nominatim API for reverse geocoding.

## Estimation / 預估

Story Points: 2

## MVP 測試內容 / MVP Test

-   請於 [bolt.new](https://bolt.new) 測試座標轉地址功能，驗證地圖點選後能正確顯示地址。

Please use [bolt.new](https://bolt.new) to test the coordinate-to-address feature and verify that clicking on the map correctly displays the address.

## Tasks / 子任務

-   [ ] 設計座標轉地址 API 介面 / Design coordinate-to-address API interface
-   [ ] 串接 nominatim 反查地址服務 / Integrate nominatim reverse geocoding service
-   [ ] 前端 UI：地圖點選觸發查詢 / Frontend UI: trigger query on map click
-   [ ] 顯示查詢結果於 UI / Display result in UI
-   [ ] 撰寫單元測試 / Write unit tests
-   [ ] 文件與範例 / Documentation & examples

## Constraints / 限制

-   必須考慮 nominatim API 的速率限制與錯誤處理
-   UI 必須即時回饋查詢狀態
-   必須支援多語系

Must consider nominatim API rate limits and error handling. UI must provide real-time feedback. Must support multi-language.

## Data Models / Schema

```json
{
    "lat": "number",
    "lng": "number",
    "address": "string"
}
```

## Structure / 結構

-   前端：於地圖元件（MapContainer）中實作座標點擊事件與查詢
-   後端/工具：於 utils 或 lib 新增 geocoding 查詢模組

Frontend: implement coordinate click and query in MapContainer. Backend/utils: add geocoding module in utils or lib.

## Diagrams / 圖示

```mermaid
sequenceDiagram
  participant User
  participant MapUI
  participant GeocodingUtil
  participant NominatimAPI
  User->>MapUI: 點擊地圖 / click map
  MapUI->>GeocodingUtil: 傳送座標 / send coordinates
  GeocodingUtil->>NominatimAPI: 查詢地址 / query address
  NominatimAPI-->>GeocodingUtil: 回傳地址 / return address
  GeocodingUtil-->>MapUI: 顯示地址 / display address
  MapUI-->>User: 呈現結果 / show result
```

## Dev Notes / 開發備註

-   可考慮快取查詢結果以減少 API 請求
-   錯誤時需顯示提示訊息
-   測試需涵蓋 API 失敗、無法解析等情境

Consider caching results to reduce API calls. Show error messages on failure. Tests should cover API failure and unresolvable cases.

## Chat Command Log / 討論紀錄

-   User: 請協助建立座標轉地址功能的 story
-   Agent: 已建立，請審閱內容
