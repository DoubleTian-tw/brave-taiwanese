# Brave Taiwanese 離線災害協作地圖平台

# 產品需求文件（PRD）

# Product Requirements Document (PRD)

---

## 1. 專案名稱 / Project Name

**Brave Taiwanese 離線災害協作地圖平台**
**Brave Taiwanese: Offline Disaster Collaboration Map Platform**

---

## 2. 專案目標與願景 / Purpose & Vision

### 中文

在戰爭或災害導致通訊中斷的情況下，提供一個可離線使用的地圖平台，協助使用者即時回報災情、查看附近的避難所與物資點，並與周遭的人建立臨時通訊與協助網絡。即使在沒有網路的環境下，也能透過 GPS 定位、離線地圖與去中心化的技術，維持資訊流通與災情共享，強化災後自救與互助的能力。開

### English

In the event of war or disasters causing communication breakdowns, provide an offline map platform that enables users to report incidents, locate nearby shelters and supply points, and establish ad-hoc communication and support networks with people around them. Even without internet connectivity, the platform leverages GPS, offline maps, and decentralized technologies to maintain information flow and disaster sharing, empowering self-help and mutual aid after disasters.

---

## 3. 問題陳述 / Problem Statement

### 中文

建立一個「民眾可自救／互助」的離線通訊地圖平台，在政府或主網路系統失能時依然能發揮作用。

### English

Build an offline communication map platform for public self-help and mutual aid, which remains functional even when government or main network systems are down.

---

## 4. 目標用戶 / Target Users

### 中文

-   一般民眾（擁有手機者）
-   角色分為需要幫忙者與提供幫忙者
-   權限分級：訪客（Guest）、註冊用戶、管理員

### English

-   General public (anyone with a mobile phone)
-   Roles: those needing help and those providing help
-   Permission levels: Guest, Registered User, Admin

---

## 5. 主要功能 / Key Features

### 中文

前台：

-   離線地圖瀏覽與 GPS 定位
-   熱點（災情/需求）上報、瀏覽、篩選
-   避難所、物資點查詢
-   多語系支援
-   臨時通訊與協助網絡（去中心化/即時功能）
-   通知系統（依熱點嚴重程度推播、地區追蹤）
-   使用者註冊、登入、權限管理

後台：

-   熱點/避難所資料管理
-   用戶管理
-   系統監控與審核

### English

Frontend:

-   Offline map browsing and GPS positioning
-   Hotspot (incident/need) reporting, browsing, and filtering
-   Shelter and supply point lookup
-   Multi-language support
-   Ad-hoc communication and support network (decentralized/realtime features)
-   Notification system (push by hotspot severity, area following)
-   User registration, login, and permission management

Backend:

-   Hotspot/shelter data management
-   User management
-   System monitoring and review

---

## 6. 資料來源 / Data Sources

### 中文

-   熱點資料：由民眾即時上傳
-   避難所資料：串接政府公開 API（如 https://data.gov.tw/datasets/search?p=1&size=10&s=_score_desc&rft=避難）
-   外部 API：需串接政府災害、避難所等相關 API

### English

-   Hotspot data: uploaded in real-time by the public
-   Shelter data: integrated from government open APIs (e.g., https://data.gov.tw/datasets/search?p=1&size=10&s=_score_desc&rft=避難)
-   External APIs: connect to government disaster, shelter, and related APIs

---

## 7. 技術架構 / Technical Architecture

### 中文

-   前端：Next.js, React, Tailwind CSS
-   後端/雲端服務：Supabase（資料庫、驗證、檔案儲存、即時功能）
-   部署：Vercel
-   地圖服務：OpenStreetMap + Leaflet
-   座標轉地址：nominatim
-   去中心化/臨時通訊：Meshtastic、可評估 P2P 技術（如 WebRTC, Bluetooth Mesh, 或其他適合的方案）

### English

-   Frontend: Next.js, React, Tailwind CSS
-   Backend/Cloud: Supabase (Database, Auth, Storage, Realtime)
-   Deployment: Vercel
-   Map Service: OpenStreetMap + Leaflet
-   Geocoding: nominatim
-   Decentralized/Offline Communication: Meshtastic, and optionally P2P technologies (e.g., WebRTC, Bluetooth Mesh, or other suitable solutions)

---

## 8. UI/UX 設計 / UI/UX Design

### 中文

-   參考現有網站（請補充參考網址）
-   風格以「醒目、易於辨識警告」為主
-   重要資訊（如災情、警告）使用高對比色彩，避難所/物資點有明顯標記
-   支援行動裝置優先（Mobile First）

### English

-   Reference existing websites (please provide URLs)
-   Style: prominent, easy to recognize warnings
-   Use high-contrast colors for critical info (incidents, warnings), clear markers for shelters/supply points
-   Mobile-first support

---

## 9. 權限與通知 / Permissions & Notifications

### 中文

-   權限分級：訪客（瀏覽）、註冊用戶（上報/互動）、管理員（審核/管理）
-   通知：串接政府災害 API，或依熱點嚴重程度推播給周邊用戶、地區追蹤者

### English

-   Permission levels: Guest (view), Registered user (report/interact), Admin (review/manage)
-   Notifications: integrate with government disaster APIs, or push to nearby users/area followers based on hotspot severity

---

## 10. 技術限制與風險 / Technical Constraints & Risks

### 中文

-   需支援離線地圖與定位
-   去中心化通訊技術需評估可行性
-   外部 API 穩定性與法規遵循
-   資安與個資保護
-   部署環境：Vercel

### English

-   Must support offline maps and positioning
-   Decentralized communication technology feasibility needs evaluation
-   External API stability and legal compliance
-   Information security and personal data protection
-   Deployment environment: Vercel

---

## 11. 開發時程與里程碑 / Timeline & Milestones

### 中文

-   開發時程：2-3 個月內上線第一版
-   里程碑：
    -   M1：需求確認與設計
    -   M2：核心功能開發（地圖、熱點、避難所、註冊登入）
    -   M3：離線與去中心化通訊功能
    -   M4：後台管理、通知系統
    -   M5：測試、上線、用戶拓展

### English

-   Development timeline: launch v1 within 2-3 months
-   Milestones:
    -   M1: Requirements confirmation and design
    -   M2: Core feature development (map, hotspots, shelters, registration/login)
    -   M3: Offline and decentralized communication features
    -   M4: Backend management, notification system
    -   M5: Testing, launch, user growth

---

## 12. 未知數與假設 / Unknowns & Assumptions

### 中文

-   去中心化通訊技術的可行性與實作細節
-   政府 API 的穩定性與資料格式
-   用戶數量成長對系統的壓力
-   災害現場的實際網路環境

### English

-   Feasibility and implementation details of decentralized communication
-   Stability and data format of government APIs
-   System load as user base grows
-   Actual network conditions in disaster scenarios

---

## 13. 風險與應對 / Risks & Mitigations

### 中文

-   API 不穩定：設計快取與離線備援機制
-   去中心化通訊失敗：提供 fallback 機制（如簡訊、藍牙）
-   資安問題：加強驗證、資料加密、權限控管
-   法規遵循：定期檢視法規，確保合規

### English

-   Unstable APIs: design caching and offline backup mechanisms
-   Decentralized communication failure: provide fallback mechanisms (e.g., SMS, Bluetooth)
-   Security issues: strengthen authentication, data encryption, and permission control
-   Legal compliance: regularly review regulations to ensure compliance

---

## 14. 參考資料 / References

### 中文

-   政府公開資料平台：https://data.gov.tw/
-   參考網站（請補充）

### English

-   Government Open Data Platform: https://data.gov.tw/
-   Reference websites (please provide)
