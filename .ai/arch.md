# Brave Taiwanese 架構文件 / Architecture Document

Status: Draft

## 技術摘要 / Technical Summary

本專案為一個可於戰爭或災害時通訊中斷下運作的離線災害協作地圖平台，核心目標是讓用戶能離線回報災情、查詢避難所、建立臨時通訊網絡。架構設計強調高可用性、去中心化、離線支援與彈性擴展。

This project is an offline disaster collaboration map platform designed for scenarios where communication is disrupted due to war or disasters. The core goal is to enable users to report incidents, find shelters, and establish ad-hoc communication networks offline. The architecture emphasizes high availability, decentralization, offline support, and flexible scalability.

## 技術選型表 / Technology Table

| 技術 / Technology       | 說明 / Description                                      |
| ----------------------- | ------------------------------------------------------- |
| Next.js                 | React 應用框架 / React application framework            |
| React                   | 前端 UI 框架 / Frontend UI framework                    |
| Tailwind CSS            | 實用型 CSS 框架 / Utility-first CSS framework           |
| Supabase                | 雲端資料庫、驗證、即時功能 / Cloud DB, Auth, Realtime   |
| OpenStreetMap + Leaflet | 地圖服務與互動 / Map service & interaction              |
| nominatim               | 座標轉地址服務 / Geocoding (reverse geocoding)          |
| Meshtastic              | 去中心化/離線通訊 / Decentralized/offline communication |
| Vercel                  | 雲端部署平台 / Cloud deployment platform                |

## 架構圖 / Architectural Diagrams

```mermaid
graph TD
  User[User]
  App[Next.js/React App]
  Map[OpenStreetMap+Leaflet]
  Supabase[Supabase DB/Auth/Realtime]
  Nominatim[nominatim (Geocoding)]
  Mesh[Meshtastic (P2P)]
  Vercel[Vercel Hosting]

  User --> App
  App --> Map
  App --> Supabase
  App --> Nominatim
  App --> Mesh
  App --> Vercel
```

## 資料模型、API 規格 / Data Models, API Specs, Schemas

### 熱點 Hotspot

```json
{
    "id": "string",
    "type": "string", // ex: 災情/物資/需求
    "location": { "lat": "number", "lng": "number" },
    "severity": "number",
    "description": "string",
    "created_at": "datetime",
    "user_id": "string"
}
```

### 避難所 Shelter

```json
{
    "id": "string",
    "name": "string",
    "location": { "lat": "number", "lng": "number" },
    "capacity": "number",
    "address": "string"
}
```

### 反查地址 Geocoding

-   輸入：{ lat, lng }
-   輸出：{ address }

## 專案結構 / Project Structure

```
├ /src
│   ├ /app           # Next.js app 入口與路由
│   ├ /components    # React UI 元件
│   ├ /data          # mock 資料
│   ├ /hooks         # React hooks
│   ├ /lib           # Supabase、工具庫
│   ├ /types         # 型別定義
│   ├ /utils         # 工具方法
│   └ /index.css     # 全域樣式
├ /public            # 靜態資源
├ /.ai               # 產品/架構/故事文件
├ /.cursor           # 規則與模板
```

## 基礎設施 / Infrastructure

-   Supabase 雲端資料庫、驗證、即時功能
-   Vercel 雲端部署
-   Meshtastic 裝置（如需 P2P 通訊）

## 部署計畫 / Deployment Plan

-   以 Vercel 為主要部署平台，支援自動化 CI/CD
-   Supabase 作為後端服務，API 金鑰與連線資訊存於環境變數
-   Meshtastic 需現場裝置支援

## 變更紀錄 / Change Log

-   2024-xx-xx: 初版草稿
