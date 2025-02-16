(() => {
  const CryptoPayment = (() => {
    // Configuration
    const config = {
      defaultFiatCurrency: 'USD',
      supportedNetworks: ['Ethereum', 'Polygon', 'BSC'],
      apiEndpoint: 'https://api.coingecko.com/api/v3',
      theme: {
        light: {
          primary: '#0066FF',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          text: '#1E293B',
          border: '#E2E8F0'
        },
        dark: {
          primary: '#3B82F6',
          background: '#0F172A',
          surface: '#1E293B',
          text: '#F8FAFC',
          border: '#334155'
        }
      }
    };

    // Supported cryptocurrencies
    const cryptoList = [
      { 
        name: "USDC",
        fullName: "USD Coin",
        icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
        address: {
          Ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          Polygon: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          BSC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
        },
        symbol: "USDC",
        decimals: 6,
        color: "#2775CA"
      },
      { 
        name: "USDT",
        fullName: "Tether USD",
        icon: "https://cryptologos.cc/logos/tether-usdt-logo.png",
        address: {
          Ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          Polygon: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
          BSC: "0x55d398326f99059fF775485246999027B3197955"
        },
        symbol: "USDT",
        decimals: 6,
        color: "#26A17B"
      },
      {
        name: "DAI",
        fullName: "Dai Stablecoin",
        icon: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
        address: {
          Ethereum: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          Polygon: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
          BSC: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3"
        },
        symbol: "DAI",
        decimals: 18,
        color: "#F5AC37"
      }
    ];

    // Network configurations
    const networks = [
      { 
        name: "Ethereum", 
        icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        chainId: 1,
        rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/your-api-key",
        explorer: "https://etherscan.io"
      },
      { 
        name: "Polygon", 
        icon: "https://cryptologos.cc/logos/polygon-matic-logo.png",
        chainId: 137,
        rpcUrl: "https://polygon-rpc.com",
        explorer: "https://polygonscan.com"
      },
      { 
        name: "BSC", 
        icon: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
        chainId: 56,
        rpcUrl: "https://bsc-dataseed.binance.org",
        explorer: "https://bscscan.com"
      }
    ];

    // Utility functions
    const utils = {
      formatAddress: (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      },
      
      generateQR: async (content) => {
        const QRCode = await import('qrcode');
        return QRCode.toDataURL(content, {
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 200,
          margin: 1
        });
      },

      copyToClipboard: async (text) => {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (err) {
          console.error('Failed to copy:', err);
          return false;
        }
      },

      formatAmount: (amount, decimals = 2) => {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(amount);
      }
    };

    // Styles injection
    const injectStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        .crypto-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .crypto-modal.active {
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 1;
        }

        .modal-content {
          background: var(--background-color);
          color: var(--text-color);
          border-radius: 24px;
          padding: 32px;
          width: 90%;
          max-width: 480px;
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.3s ease;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .crypto-modal.active .modal-content {
          transform: translateY(0);
          opacity: 1;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .modal-header h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-color);
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .close-button:hover {
          opacity: 1;
        }

        .payment-selectors {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 32px;
        }

        .selector-wrapper {
          position: relative;
        }

        .selector-label {
          font-size: 14px;
          color: var(--text-color);
          opacity: 0.7;
          margin-bottom: 8px;
        }

        .custom-select {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--surface-color);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
        }

        .custom-select:hover {
          border-color: var(--primary-color);
        }

        .custom-select img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .custom-select span {
          font-weight: 500;
        }

        .address-field {
          margin-bottom: 32px;
        }

        .address-input {
          display: flex;
          align-items: center;
          padding: 16px;
          background: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          gap: 12px;
        }

        .address-input input {
          flex: 1;
          border: none;
          background: none;
          color: var(--text-color);
          font-size: 14px;
          outline: none;
        }

        .copy-button {
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .copy-button:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .amount-display {
          text-align: center;
          margin: 32px 0;
        }

        .amount {
          font-size: 48px;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 8px;
        }

        .amount-subtitle {
          font-size: 16px;
          color: var(--text-color);
          opacity: 0.7;
        }

        .qr-section {
          display: flex;
          justify-content: center;
          margin: 32px 0;
        }

        .qr-code {
          padding: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .pay-button {
          width: 100%;
          padding: 16px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .pay-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 102, 255, 0.2);
        }

        .pay-button:active {
          transform: translateY(0);
        }

        .payment-footer {
          margin-top: 24px;
          text-align: center;
          opacity: 0.7;
        }

        .payment-footer img {
          height: 24px;
          margin: 0 8px;
        }

        .theme-toggle {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: var(--surface-color);
          border: 1px solid var(--border-color);
          color: var(--text-color);
          padding: 12px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 1001;
        }

        .theme-toggle:hover {
          transform: rotate(30deg);
        }

        .loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .modal-content {
            padding: 24px;
          }

          .payment-selectors {
            grid-template-columns: 1fr;
          }

          .amount {
            font-size: 36px;
          }
        }

        [data-theme="dark"] {
          --background-color: #0F172A;
          --surface-color: #1E293B;
          --text-color: #F8FAFC;
          --border-color: #334155;
          --primary-color: #3B82F6;
        }

        [data-theme="light"] {
          --background-color: #FFFFFF;
          --surface-color: #F8FAFC;
          --text-color: #1E293B;
          --border-color: #E2E8F0;
          --primary-color: #0066FF;
        }
      `;
      document.head.appendChild(style);
    };

    // State management
    let currentState = {
      theme: 'light',
      selectedToken: cryptoList[0],
      selectedNetwork: networks[0],
      amount: '0',
      loading: false,
      error: null
    };

    // UI Components
    const createPaymentModal = (amount) => {
      const modal = document.createElement('div');
      modal.className = 'crypto-modal';
      modal.setAttribute('data-theme', currentState.theme);

      const qrCode = utils.generateQR(currentState.selectedToken.address[currentState.selectedNetwork.name]);

      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2>Crypto Payment</h2>
            <button class="close-button">&times;</button>
          </div>
          
          <div class="payment-selectors">
            <div class="selector-wrapper">
              <div class="selector-label">Pay with</div>
              <div class="custom-select" id="token-select">
                <img src="${currentState.selectedToken.icon}" alt="${currentState.selectedToken.name}">
                <span>${currentState.selectedToken.symbol}</span>
              </div>
            </div>
            
            <div class="selector-wrapper">
              <div class="selector-label">On network</div>
              <div class="custom-select" id="network-select">
                <img src="${currentState.selectedNetwork.icon}" alt="${currentState.selectedNetwork.name}">
                <span>${currentState.selectedNetwork.name}</span>
              </div>
            </div>
          </div>

          <div class="address-field">
            <div class="selector-label">${currentState.selectedToken.symbol} token address</div>
            <div class="address-input">
              <input type="text" value="${currentState.selectedToken.address[currentState.selectedNetwork.name]}" readonly>
              <button class="copy-button" title="Copy address">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="qr-section">
            <div class="qr-code">
              <img src="${await qrCode}" alt="Payment QR Code">
            </div>
          </div>

          <div class="amount-display">
            <div class="amount">${utils.formatAmount(amount)} ${currentState.selectedToken.symbol}</div>
            <div class="amount-subtitle">≈ ${amount} ${config.defaultFiatCurrency}</div>
          </div>

          <button class="pay-button">
            <span>Pay & Subscribe</span>
          </button>

          <div class="payment-footer">
            <img src="https://v0.blob.com/visa-logo.png" alt="Visa">
            <img src="https://v0.blob.com/mastercard-logo.png" alt="Mastercard">
          </div>
        </div>
      `;

      const themeToggle = document.createElement('button');
      themeToggle.className = 'theme-toggle';
      themeToggle.innerHTML = currentState.theme === 'light' ? '🌙' : '☀️';
      themeToggle.onclick = toggleTheme;
      modal.appendChild(themeToggle);

      return modal;
    };

    // Event Handlers
    const toggleTheme = () => {
      currentState.theme = currentState.theme === 'light' ? 'dark' : 'light';
      const modal = document.querySelector('.crypto-modal');
      if (modal) {
        modal.setAttribute('data-theme', currentState.theme);
        const themeToggle = modal.querySelector('.theme-toggle');
        themeToggle.innerHTML = currentState.theme === 'light' ? '🌙' : '☀️';
      }
    };

    const handlePayment = async () => {
      const payButton = document.querySelector('.pay-button');
      payButton.innerHTML = '<div class="loading"></div>';
      payButton.disabled = true;

      try {
        // Implement payment processing logic here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
        showToast('Payment successful!', 'success');
      } catch (error) {
        showToast('Payment failed. Please try again.', 'error');
      } finally {
        payButton.innerHTML = '<span>Pay & Subscribe</span>';
        payButton.disabled = false;
      }
    };

    // Toast Notifications
    const showToast = (message, type = 'info') => {
      const toast = document.getElementById('toast') || createToastElement();
      toast.textContent = message;
      toast.className = `show ${type}`;
      setTimeout(() => {
        toast.className = toast.className.replace('show', '');
      }, 3000);
    };

    const createToastElement = () => {
      const toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
      return toast;
    };

    // Public API
    const showPaymentModal = async (amount = '19.95') => {
      currentState.amount = amount;
      const modal = await createPaymentModal(amount);
      document.body.appendChild(modal);
      
      // Delay to trigger animation
      setTimeout(() => modal.classList.add('active'), 50);

      // Event Listeners
      const closeBtn = modal.querySelector('.close-button');
      closeBtn.onclick = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      };

      const copyBtn = modal.querySelector('.copy-button');
      copyBtn.onclick = async () => {
        const success = await utils.copyToClipboard(
          currentState.selectedToken.address[currentState.selectedNetwork.name]
        );
        showToast(
          success ? 'Address copied to clipboard!' : 'Failed to copy address',
          success ? 'success' : 'error'
        );
      };

      const payBtn = modal.querySelector('.pay-button');
      payBtn.onclick = handlePayment;
    };

    // Initialization
    const init = () => {
      injectStyles();
      document.documentElement.setAttribute('data-theme', currentState.theme);
    };

    return {
      init,
      showPayment: showPaymentModal
    };
  })();

  // Initialize the module
  CryptoPayment.init();

  // Expose public API
  window.do = window.do || {};
  window.do.showCryptoPayment = CryptoPayment.showPayment;
})();
