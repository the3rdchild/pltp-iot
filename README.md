# 🔥 PLTP IoT Dashboard – Steam Quality & Purity Monitoring

An interactive IoT-based SCADA system built to monitor **steam quality**, **steam purity**, and **water system status** in real time for **PLTP Kamojang**. This project is developed using **React + Vite**, visualized with **Material UI**, and deployed via **Firebase Hosting**.

> 🚧 Project Status: Under Development v0.2

---

## 🌐 Live Dashboard

📍 **Live demo**: [Steam Quality & Purity Online Monitoring Dashboard](https://pltp-ef8b9.web.app)

<p float="left">
  <img src="https://github.com/the3rdchild/pltp-iot/blob/main/documentation/ds1.png" width="32%" />
  <img src="https://github.com/the3rdchild/pltp-iot/blob/main/documentation/ds2.png" width="32%" />
</p>

---

## 🧠 AI-Powered Steam Quality System

The platform includes a machine learning model (Random Forest) to assist in predicting the **turbine risk level**, based on sensor inputs like **TDS (Total Dissolved Solids)** and **Dryness Fraction**.

### 🔄 AI Flow Diagram

![AI Flow](https://github.com/the3rdchild/pltp-iot/blob/main/documentation/ai-flow.png)

### 🧪 TDS Sensor Placement Concept

![TDS Sensor Layout](https://github.com/the3rdchild/pltp-iot/blob/main/documentation/tds.png)

---

## ⚙️ Key Features

### Steam & Water System Status
- Reservoir pressure
- Steam output pressure

### Steam Purity
- TDS (0.6–0.7 ppm ideal range)
- Dissolved gases: CO₂, Argon, Methane, MA₃
- Scaling Deposit Index

### Steam Quality (AI)
- Dryness Fraction
- AI-based Anomaly Score
- Turbine Risk Prediction (Low → Critical)

---

## 📦 Tech Stack

- ⚛️ React + Vite
- 📊 Material UI (MUI)
- 🔥 Firebase Hosting
- 📁 Dummy Simulation via JS modules
- ⚙️ AI model logic (Random Forest placeholder)

---

## 🛠️ Local Development

```bash
# Clone this repository
git clone https://github.com/the3rdchild/pltp-iot.git
cd pltp-iot

# Install dependencies
npm install

# Run locally (localhost:3000)
npm run dev

# Build for production
npm run build
```

---

## 🤝 Collaboration

This project is part of a research and development collaboration between  
🎓 **Universitas Padjadjaran (UNPAD)** & 🏭 **PT Pertamina Geothermal Energy / URTI**.

---

## 📄 License

This project is licensed. See the [LICENSE](./LICENSE) file for details.
