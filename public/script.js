let cart = [];
let manualBuffer = "0";
let salesChart;
const API_URL = "/api";

// --- 1. Init & Chart Logic ---
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    fetchMenu();
    // Simulate updating chart every 3 seconds for "Realtime" effect
    setInterval(updateChartRandomly, 3000);
});

async function initChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Gradient styling for the chart
    let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    const initialData = await fetch(`${API_URL}/chart-data`).then(r => r.json());

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: initialData.labels,
            datasets: [{
                label: 'Sales',
                data: initialData.data,
                borderColor: '#caffbf', // Mint color matching accent
                backgroundColor: gradient,
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointRadius: 3,
                tension: 0.4, // Smooth curves
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false }, // Minimalist look
                y: { display: false }
            }
        }
    });
}

function updateChartRandomly() {
    if(!salesChart) return;
    // Remove first, add new random point
    const newData = Math.floor(Math.random() * 150000) + 50000;
    salesChart.data.datasets[0].data.shift();
    salesChart.data.datasets[0].data.push(newData);
    salesChart.update();
}

// --- 2. Menu Logic ---
async function fetchMenu() {
    const res = await fetch(`${API_URL}/menu`);
    const data = await res.json();
    const container = document.getElementById('menu-container');
    
    container.innerHTML = data.map(item => `
        <div class="menu-item" onclick="addToCart('${item.name}', ${item.price})">
            <h4>${item.name}</h4>
            <div class="price">Rp ${item.price.toLocaleString('id-ID')}</div>
        </div>
    `).join('');
}

// --- 3. Cart Logic ---
function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    renderCart();
}

function renderCart() {
    const list = document.getElementById('cart-items');
    const badge = document.getElementById('cart-badge');
    const displayTotal = document.getElementById('display-total');
    
    // Update Badge
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    badge.innerText = totalItems;

    // Calc Total
    let total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    displayTotal.innerText = `Rp ${total.toLocaleString('id-ID')}`;

    if (cart.length === 0) {
        list.innerHTML = `<div class="empty-state" style="text-align:center; padding:20px; color:#555;"><p>Keranjang Kosong</p></div>`;
        return;
    }

    list.innerHTML = cart.map((item, idx) => `
        <div class="cart-item-card">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name} <span style="color:#4ade80; font-size:12px">x${item.qty}</span></div>
                <div class="cart-item-price">Total: Rp ${(item.price * item.qty).toLocaleString('id-ID')}</div>
            </div>
            <button class="btn-remove" onclick="removeItem(${idx})">
                <i class="ri-delete-bin-line"></i>
            </button>
        </div>
    `).join('');
}

function removeItem(idx) {
    cart.splice(idx, 1);
    renderCart();
}

function clearCart() {
    cart = [];
    renderCart();
}

// --- 4. Manual Input Logic ---
function pressKey(key) {
    if (key === 'C') manualBuffer = "0";
    else {
        if (manualBuffer === "0") manualBuffer = key;
        else manualBuffer += key;
    }
    document.getElementById('manual-input-view').innerText = `Rp ${parseInt(manualBuffer).toLocaleString('id-ID')}`;
}

function addManualItem() {
    const val = parseInt(manualBuffer);
    if (val > 0) {
        addToCart("Manual Item", val);
        manualBuffer = "0";
        document.getElementById('manual-input-view').innerText = "Rp 0";
        switchTab('cart'); // Auto jump to cart
    }
}

// --- 5. Navigation ---
function switchTab(tabName) {
    document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // Update visual styles (Optional: add 'active' class to buttons)
}

// --- 6. Payment Logic ---
function openModal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (total === 0) return alert("Keranjang masih kosong!");
    
    document.getElementById('modal-total-tagihan').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    document.getElementById('payment-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('payment-modal').style.display = 'none';
    document.getElementById('input-uang').value = '';
    document.getElementById('text-kembalian').innerText = 'Rp 0';
}

function setUang(val) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const input = document.getElementById('input-uang');
    if (val === 'pas') input.value = total;
    else input.value = val;
    calculateChange();
}

function calculateChange() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const paid = parseInt(document.getElementById('input-uang').value) || 0;
    const change = paid - total;
    document.getElementById('text-kembalian').innerText = `Rp ${Math.max(0, change).toLocaleString('id-ID')}`;
}

async function prosesTransaksi() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const paid = parseInt(document.getElementById('input-uang').value) || 0;

    if (paid < total) return alert("Uang kurang!");

    try {
        const res = await fetch(`${API_URL}/transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, paid })
        });
        
        if (!res.ok) throw new Error("Gagal");
        
        const data = await res.json();
        alert(`SUKSES!\nKembalian: Rp ${data.change.toLocaleString('id-ID')}`);
        
        cart = [];
        renderCart();
        closeModal();
        switchTab('menu'); // Reset view
    } catch (e) {
        alert("Gagal memproses transaksi");
    }
}

document.getElementById('input-uang').addEventListener('input', calculateChange);
