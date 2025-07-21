# Blockchain Payment Gateway

\
\
\


Lightweight, modular payment gateway widget that lets you accept:

- **On‑chain crypto**: ETH & ERC‑20 via an Ethereum smart‑contract
- **Fiat**: EUR/USD via Stellar SEP‑31 Anchor (ISO 20022)
- **AI Risk Scoring**: real‑time fraud/risk analysis on each payment

Embed on any website (static HTML, CMS, React/Vue) with a single script tag.

---

## 📦 Features

- **Smart Contract** (`contracts/`)
  - Accepts ETH & ERC‑20
  - Emits `PaymentReceived` events
  - Written in Solidity and tested with Hardhat + Mocha/Chai
- **Java Backend** (`java-backend/`)
  - Spring Boot with **web3j** (Ethereum) & **stellar-sdk** (Stellar)
  - Listens for on‑chain & SEP‑31 events
  - Calls AI risk‑scoring service and persists orders in PostgreSQL
  - Exposes REST endpoints & webhooks
- **AI Service** (`ai-service/`)
  - FastAPI + scikit‑learn + joblib
  - Trains & serves a fraud/risk model
  - `/predict` endpoint returns a `risk_score`
- **Frontend Widget** (`frontend/`)
  - TypeScript + Rollup bundle
  - `initGateway(config)` to bootstrap in any page
  - MetaMask/Ethers.js for ETH; SEP‑31 interactive deposit for fiat
- **DevOps & CI/CD**
  - GitHub Actions workflows for contracts, Java, Python tests
  - Docker Compose & Helm charts for local & k8s deployment
  - Prometheus/Grafana monitoring + Etherscan integration

---

## 📚 Table of Contents

1. [Quick Start](#-quick-start)
2. [Installation & Configuration](#-installation--configuration)
3. [Usage](#-usage)
4. [Architecture](#-architecture)
5. [Documentation](#-documentation)
6. [Contributing](#-contributing)
7. [License](#-license)
8. [Resources](#-resources)

---

## 🏁 Quick Start

```bash
# 1. Clone your fork
git clone https://github.com/your-org/blockchain-payment-gateway.git
cd blockchain-payment-gateway

# 2. Deploy smart contracts (Goerli testnet)
cd contracts
npm install
npx hardhat deploy --network goerli

# 3. Build the frontend widget
cd ../frontend
npm install
npm run build

# 4. Start Java backend
cd ../java-backend
mvn clean install
# configure src/main/resources/application.yml
mvn spring-boot:run

# 5. Start AI service
cd ../ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 🔧 Installation & Configuration

1. **Repository setup**
   - Create a new GitHub repo (public or private).
   - Initialize with a README, `.gitignore` (Node, Java, Python), and MIT license.
2. **Environment variables**
   - `INFURA_API_KEY`, `ETH_PRIVATE_KEY`
   - `STELLAR_ISSUING_SECRET`, `STELLAR_ANCHOR_URL`
   - `DATABASE_URL`, `KYC_PROVIDER_KEY`, etc.
3. **Contracts**
   - Configure `hardhat.config.js` with your network URLs & keys.
4. **Java Backend**
   - Update `application.yml` with Ethereum & Stellar settings, database credentials.
5. **AI Service**
   - Place trained model at `ai-service/models/model.pkl`.
   - Adjust `requirements.txt` if needed.

---

## 💻 Usage

### Frontend Integration

Include CSS & JS in your checkout page:

```html
<link rel="stylesheet" href="https://cdn.example.com/gateway-widget.css" />
<script src="https://cdn.example.com/gateway-widget.js"></script>

<div id="pay-gateway"></div>
<script>
  initGateway({
    target: "#pay-gateway",
    contractAddress: "0xYourGatewayAddress",
    networkRpcUrl: "https://goerli.infura.io/v3/YOUR_KEY",
    payeeName: "Pay with SahliPay",
    stellarAnchorUrl: "https://anchor.example.com",
    stellarAsset: { code: "USDC", issuer: "GISSUINGKEY..." }
  });
</script>
```

### REST Endpoints

- **Java Backend**
  - `GET /orders` — list orders
  - `POST /orders/{id}/mark-paid?tx=0x...` — mark on‑chain payment
  - `POST /bank/payment-callback` — PSD2 / aggregator webhook
- **AI Service**
  - `POST /predict`
    ```json
    { "amount": 1.23, "from_address": "0xabc..." }
    ```
    returns
    ```json
    { "risk_score": 0.87 }
    ```

---

#
6. ## 🏗 Architecture

flowchart LR
  subgraph Frontend
    A[User Checkout Page]
    W["Payment Widget\n(initGateway)"]
  end

  subgraph Blockchain["Ethereum Network"]
    SC["Gateway.sol\nSmart Contract"]
  end

  subgraph Stellar["Stellar Network"]
    AN["Stellar Anchor\n(SEP-31)"]
  end

  subgraph Backend
    JB["Java Backend\n(Spring Boot)"]
    AI["AI Service\n(FastAPI)"]
  end

  A --> W
  W --> SC
  W --> AN
  SC -->|PaymentReceived| JB
  AN -->|DepositConfirmed| JB
  JB --> AI
  JB -->|Order Status| A

  subgraph Backend
    JB[Java Backend<br/>(Spring Boot)]
    AI[AI Service<br/>(FastAPI)]
  end

  A --> W
  W --> SC
  W --> AN
  SC -->|PaymentReceived| JB
  AN -->|DepositConfirmed| JB
  JB --> AI
  JB -->|Order Status| A


---

## 📖 Documentation

Full project documentation is available in the `docs/` folder:

- `docs/README.md` — detailed setup, API reference, bank/KYC integration, DevOps.

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards and guidelines.

---

## 📄 License

This project is released under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 🔗 Resources

- **Docs**: `docs/README.md`
- **Hardhat**: [https://hardhat.org](https://hardhat.org)
- **OpenZeppelin**: [https://openzeppelin.com](https://openzeppelin.com)
- **web3j**: [https://docs.web3j.io](https://docs.web3j.io)
- **Stellar SEP‑31**: [https://github.com/stellar/stellar-protocol/tree/master/ecosystem/sep-31](https://github.com/stellar/stellar-protocol/tree/master/ecosystem/sep-31)
- **FastAPI**: [https://fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **scikit‑learn**: [https://scikit-learn.org](https://scikit-learn.org)

