# Blockchain Payment Gateway

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Lightweight, modular payment gateway widget that lets you accept:

- **On‐chain crypto**: ETH & ERC‑20 via an Ethereum smart‐contract  
- **Fiat**: EUR/USD via Stellar SEP‑31 Anchor (ISO 20022)  
- **AI Risk Scoring**: real‑time fraud/risk analysis on each payment  

Embed on any website (static HTML, CMS, React/Vue) with a single script tag.

---

## 🚀 Features

- **Smart Contract** (`Gateway.sol`):  
  - Accepts ETH & ERC‑20  
  - Emits `PaymentReceived` events  
  - Built on OpenZeppelin & tested with Hardhat  
- **Java Backend** (Spring Boot + web3j + stellar‐sdk):  
  - Listens for on‑chain & Stellar payments  
  - Calls AI risk‐scoring service  
  - Persists orders in PostgreSQL  
  - Exposes REST endpoints & webhooks  
- **AI Service** (FastAPI + scikit‑learn):  
  - Trains & serves a fraud/risk model  
  - `/predict` endpoint returns a `risk_score`  
- **Frontend Widget** (TypeScript + Rollup):  
  - `initGateway(config)` to bootstrap  
  - MetaMask + Ethers.js for ETH  
  - SEP‑31 interactive deposit for fiat  
- **DevOps & CI/CD**:  
  - GitHub Actions for tests (contracts, Java, Python)  
  - Docker Compose & Helm charts  
  - Prometheus/Grafana monitoring  

---

## 📚 Table of Contents

1. [Quick Start](#-quick-start)  
2. [Installation & Configuration](#-installation--configuration)  
3. [Usage](#-usage)  
4. [Architecture](#-architecture)  
5. [Contributing](#-contributing)  
6. [License](#-license)  
7. [Resources](#-resources)  

---

## 🏁 Quick Start

```bash
# 1. Clone your fork
git clone https://github.com/<your-org>/blockchain-payment-gateway.git
cd blockchain-payment-gateway

# 2. Deploy smart contracts
cd contracts
npm install
npx hardhat deploy --network goerli

# 3. Build widget
cd ../frontend
npm install
npm run build

# 4. Run Java backend
cd ../java-backend
mvn spring-boot:run

# 5. Run AI service
cd ../ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload
