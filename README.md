# 🌊 PayFlow: Unified UPI & Wealth Dashboard

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**PayFlow** is a modern, real-time financial management platform designed to unify your fragmented UPI transaction history (GPay, PhonePe, Paytm, etc.) into a single, AI-powered command center. Track spending, detect fraud, and manage budgets with a premium, glassmorphic interface.

---

## ✨ Key Features

-   🌐 **Unified UPI Feed:** Aggregate transactions from PhonePe, GPay, Paytm, and Amazon Pay in real-time.
-   🤖 **AI Fraud Detection:** Proactive risk assessment for every transaction using pattern analysis.
-   💹 **Smart Categorization:** Automatically sorts merchants (e.g., "Zomato" → Food, "Uber" → Travel) with high accuracy.
-   📊 **Interactive Analytics:** Visualize your wealth with Recharts-powered spending trends and category breakdowns.
-   🔔 **Real-time Sync:** Powered by WebSockets to ensure your dashboard updates the second a payment is made.
-   💰 **Budget Command Center:** Set monthly limits per category and receive AI-driven "burn rate" warnings.
-   🕵️ **Wealth Agent:** A background AI auditor that provides personalized financial health scores and insights.

---

## 🛠️ Tech Stack

-   **Frontend:** React 18, Vite, Recharts, Lucide React, Glassmorphic CSS.
-   **Backend:** Node.js, Express.js.
-   **Database:** SQLite with Sequelize ORM.
-   **Real-time:** WebSockets (ws).
-   **Security:** OTP-based authentication & Session management.

---

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16+)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/payflow.git
    cd payflow
    ```

2.  **Setup Backend:**
    ```bash
    # Install root dependencies
    npm install
    
    # The server uses SQLite, no DB setup required!
    # Start the server
    npm run dev
    ```

3.  **Setup Frontend:**
    ```bash
    cd client
    npm install
    npm run dev
    ```

4.  **Access the Dashboard:**
    Open [http://localhost:5173](http://localhost:5173) in your browser.
    *Default Server Port: 3001*

---

## 📁 Project Structure

```text
├── client/                # React Vite Frontend
│   ├── src/
│   │   ├── components/    # UI Widgets & Pages
│   │   ├── App.jsx        # Main Logic & Routing
│   │   └── index.css      # Design System
├── server/                # Express Node Backend
│   ├── auth.js            # OTP Logic
│   ├── db.js              # Sequelize Models
│   ├── fraudDetector.js   # AI Pattern Logic
│   ├── categorizer.js     # Merchant Mapping
│   └── index.js           # Server Entry Point
└── package.json           # Root scripts
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

<p align="center">
  Built with ❤️ for better financial clarity.
</p>
