
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

