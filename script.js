/**
 * ATM Management System Logic
 */

const app = {
    // State
    balance: 5000.00,
    pin: "1234",
    transactions: [],
    currentInputPin: "",
    
    // Config
    dom: {},

    // Initialize
    init() {
        this.cacheDOM();
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
        
        // Add initial dummy transactions
        this.addTransaction("Deposit", 5000);
    },

    cacheDOM() {
        this.dom.time = document.getElementById('current-time');
        this.dom.screens = document.querySelectorAll('.screen');
        this.dom.pinInput = document.getElementById('pin-input');
        this.dom.loginError = document.getElementById('login-error');
        this.dom.balanceDisplay = document.getElementById('display-balance-amount');
        this.dom.withdrawAmount = document.getElementById('withdraw-amount');
        this.dom.depositAmount = document.getElementById('deposit-amount');
        this.dom.oldPin = document.getElementById('old-pin');
        this.dom.newPin = document.getElementById('new-pin');
        this.dom.confirmPin = document.getElementById('confirm-pin');
        this.dom.transactionList = document.getElementById('transaction-list');
        
        // Messages
        this.dom.withdrawMsg = document.getElementById('withdraw-msg');
        this.dom.depositMsg = document.getElementById('deposit-msg');
        this.dom.pinMsg = document.getElementById('pin-msg');
    },

    updateTime() {
        const now = new Date();
        this.dom.time.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    // Navigation
    navigateTo(screenId) {
        // Clear inputs when changing screens
        this.clearInputs();
        
        // Hide all screens
        this.dom.screens.forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        });

        // Show target screen
        const target = document.getElementById(`screen-${screenId}`);
        if(target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        // Special handlers for specific screens
        if (screenId === 'balance') {
            this.dom.balanceDisplay.innerText = this.balance.toFixed(2);
        }
        if (screenId === 'statement') {
            this.renderStatement();
        }
        if (screenId === 'exit') {
            setTimeout(() => {
                this.logout();
            }, 3000);
        }
    },

    clearInputs() {
        this.dom.withdrawAmount.value = '';
        this.dom.depositAmount.value = '';
        this.dom.oldPin.value = '';
        this.dom.newPin.value = '';
        this.dom.confirmPin.value = '';
        this.dom.withdrawMsg.innerText = '';
        this.dom.depositMsg.innerText = '';
        this.dom.pinMsg.innerText = '';
        this.dom.loginError.innerText = '';
        // Reset pin input logic only on logout usually, but good to clear fields
    },

    // Login Logic
    appendPin(digit) {
        if (this.currentInputPin.length < 4) {
            this.currentInputPin += digit;
            this.updatePinDisplay();
        }
    },

    clearPin() {
        this.currentInputPin = "";
        this.updatePinDisplay();
    },

    updatePinDisplay() {
        // Show asterisks
        this.dom.pinInput.value = "*".repeat(this.currentInputPin.length);
    },

    validateLogin() {
        if (this.currentInputPin === this.pin) {
            this.currentInputPin = "";
            this.updatePinDisplay();
            this.navigateTo('dashboard');
        } else {
            this.dom.loginError.innerText = "Incorrect PIN. Try again.";
            this.currentInputPin = "";
            this.updatePinDisplay();
        }
    },

    logout() {
        this.currentInputPin = "";
        this.updatePinDisplay();
        this.navigateTo('welcome');
    },

    // Transactions
    checkBalance() {
        this.navigateTo('balance');
    },

    setWithdraw(amount) {
        this.dom.withdrawAmount.value = amount;
    },

    processWithdraw() {
        const amount = parseFloat(this.dom.withdrawAmount.value);
        if (isNaN(amount) || amount <= 0) {
            this.showMessage(this.dom.withdrawMsg, "Please enter a valid amount.", "error");
            return;
        }
        if (amount > this.balance) {
            this.showMessage(this.dom.withdrawMsg, "Insufficient Funds!", "error");
            return;
        }

        this.balance -= amount;
        this.addTransaction("Withdraw", amount);
        this.showMessage(this.dom.withdrawMsg, "Withdrawal Successful!", "success");
        setTimeout(() => this.navigateTo('dashboard'), 1500);
    },

    processDeposit() {
        const amount = parseFloat(this.dom.depositAmount.value);
        if (isNaN(amount) || amount <= 0) {
            this.showMessage(this.dom.depositMsg, "Please enter a valid amount.", "error");
            return;
        }

        this.balance += amount;
        this.addTransaction("Deposit", amount);
        this.showMessage(this.dom.depositMsg, "Deposit Successful!", "success");
        setTimeout(() => this.navigateTo('dashboard'), 1500);
    },

    processChangePin() {
        const oldPin = this.dom.oldPin.value;
        const newPin = this.dom.newPin.value;
        const confirmPin = this.dom.confirmPin.value;

        if (oldPin !== this.pin) {
            this.showMessage(this.dom.pinMsg, "Old PIN is incorrect.", "error");
            return;
        }
        
        if (newPin.length !== 4 || isNaN(newPin)) {
             this.showMessage(this.dom.pinMsg, "New PIN must be 4 digits", "error");
             return;
        }

        if (newPin !== confirmPin) {
            this.showMessage(this.dom.pinMsg, "New PINs do not match.", "error");
            return;
        }

        this.pin = newPin;
        this.showMessage(this.dom.pinMsg, "PIN Changed Successfully!", "success");
        setTimeout(() => this.navigateTo('dashboard'), 1500);
    },

    addTransaction(type, amount) {
        const date = new Date().toLocaleDateString();
        this.transactions.unshift({ date, type, amount: amount.toFixed(2) });
    },

    renderStatement() {
        this.dom.transactionList.innerHTML = "";
        // Show last 5
        const recent = this.transactions.slice(0, 5);
        
        recent.forEach(t => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${t.date}</td>
                <td>${t.type}</td>
                <td style="color: ${t.type === 'Deposit' ? 'var(--success)' : 'var(--danger)'}">
                    ${t.type === 'Withdraw' ? '-' : '+'}$${t.amount}
                </td>
            `;
            this.dom.transactionList.appendChild(row);
        });
    },

    showMessage(element, msg, type) {
        element.innerText = msg;
        element.style.color = type === 'error' ? 'var(--danger)' : 'var(--success)';
    }
};

// Start the app
window.onload = () => app.init();
