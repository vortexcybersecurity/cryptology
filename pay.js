(() => {
  // Crypto Payment Module
  const CryptoPayment = (() => {
    const cryptoList = [
      {
        name: "Bitcoin (BTC)",
        icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
        address: "xpub6Bjr2DBfrieYREbYGppYoqmTj7zrhv4xU6SZe8ZpvzTcd4zGcyZ6DqDpofZqHuSZnxe8WBB5RUcNU5bSavkf2sYAVkngjmfqgMTLraoFfDe",
        network: "Bitcoin Network",
        color: "#F7931A"
      },
      {
        name: "Ethereum (ETH)",
        icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        address: "0xBFD25B75E9a742cEC6ea68D06d631f6EF14Cfa82",
        network: "Ethereum Mainnet",
        color: "#627EEA"
      },
      {
        name: "Solana (SOL)",
        icon: "https://cryptologos.cc/logos/solana-sol-logo.png",
        address: "EKQVJBdDqEKsQqHQ8BBgBrcohQ2wPSwAfs21sxKM4FLC",
        network: "Solana Mainnet",
        color: "#00FF9F"
      },
      {
        name: "Dogecoin (DOGE)",
        icon: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
        address: "xpub6BiLp9AdsVBLHZPPtYSWaJZmipPYoUCq4rNhWFe1TWTkccLhi35Hi5NxNRLo3WQVRLCkHLsWe26KE22uA6Rw77tb9sAUNNa7Nq6yxAqWrLb",
        network: "Dogecoin Network",
        color: "#C2A633"
      },
      {
        name: "Litecoin (LTC)",
        icon: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
        address: "xpub6C7TTG3HhQ48Mu4soN9vAQQUoCqKXrppW1h7Z3VXnUtiRZWGUxjbPVf3iN3YoLXRqAk26ht35MPysGE4b4U9ZsqkvVhnUvyFy3kjeYq5J39",
        network: "Litecoin Network",
        color: "#345D9D"
      }
    ];

    const injectStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        #crypto-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
          padding: 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        }

        .crypto-button {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          border: none;
          border-radius: 50px;
          background-color: var(--button-color);
          color: white;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .crypto-button:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .crypto-button:active {
          transform: translateY(1px) scale(0.98);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .crypto-icon {
          width: 28px;
          height: 28px;
          margin-right: 12px;
          border-radius: 50%;
          background-color: white;
          padding: 3px;
          transition: transform 0.3s ease;
        }

        .crypto-button:hover .crypto-icon {
          transform: rotate(360deg);
        }

        #toast {
          visibility: hidden;
          min-width: 250px;
          margin-left: -125px;
          background-color: rgba(51, 51, 51, 0.9);
          color: #fff;
          text-align: center;
          border-radius: 25px;
          padding: 16px;
          position: fixed;
          z-index: 1;
          left: 50%;
          bottom: 30px;
          font-size: 17px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        #toast.show {
          visibility: visible;
          animation: fadein 0.5s, fadeout 0.5s 2.5s;
        }

        #toast.success {
          background-color: rgba(76, 175, 80, 0.9);
        }

        #toast.error {
          background-color: rgba(244, 67, 54, 0.9);
        }

        @keyframes fadein {
          from {bottom: 0; opacity: 0;}
          to {bottom: 30px; opacity: 1;}
        }

        @keyframes fadeout {
          from {bottom: 30px; opacity: 1;}
          to {bottom: 0; opacity: 0;}
        }

        @media (max-width: 600px) {
          #crypto-container {
            flex-direction: column;
            align-items: center;
          }

          .crypto-button {
            width: 100%;
            justify-content: center;
          }
        }
      `;
      document.head.appendChild(style);
    };

    const pay = async (crypto) => {
      if (!crypto || !crypto.address || !crypto.network) {
        throw new Error("Invalid cryptocurrency data");
      }

      try {
        await navigator.clipboard.writeText(crypto.address);
        showToast(`${crypto.network} Address Copied!`, 'success');
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        showToast("Failed to copy address. Please try again.", 'error');
      }
    };

    const showToast = (message, type = 'info') => {
      const toast = document.getElementById("toast") || createToastElement();
      toast.textContent = message;
      toast.className = `show ${type}`;
      setTimeout(() => {
        toast.className = toast.className.replace("show", "");
      }, 3000);
    };

    const createToastElement = () => {
      const toast = document.createElement("div");
      toast.id = "toast";
      document.body.appendChild(toast);
      return toast;
    };

    const renderCryptoButtons = () => {
      const container = document.createElement("div");
      container.id = "crypto-container";
      
      cryptoList.forEach(crypto => {
        const btn = document.createElement("button");
        btn.innerHTML = `
          <img src="${crypto.icon}" class="crypto-icon" alt="${crypto.name} icon">
          <span>${crypto.name}</span>
        `;
        btn.onclick = () => pay(crypto);
        btn.className = "crypto-button";
        btn.style.setProperty('--button-color', crypto.color);
        container.appendChild(btn);
      });

      document.body.appendChild(container);
    };

    return {
      init: () => {
        document.addEventListener("DOMContentLoaded", () => {
          injectStyles();
          renderCryptoButtons();
        });
      },
      pay
    };
  })();

  // Initialize the module
  CryptoPayment.init();

  // Expose the pay function globally
  window.do = window.do || {};
  window.do.Pay = CryptoPayment.pay;
})();
