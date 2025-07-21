flowchart LR
  subgraph Frontend
    A[User Checkout Page]
    W[Payment Widget<br/>(initGateway)]
  end

  subgraph Blockchain[Ethereum Network]
    SC[Gateway.sol<br/>Smart Contract]
  end

  subgraph Stellar[Stellar Network]
    AN[Stellar Anchor<br/>(SEP-31)]
  end

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

