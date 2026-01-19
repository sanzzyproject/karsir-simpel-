let cart = [];
let manualBuffer = "0";
const API_URL = "/api";

const menuItems = [
    { id: 1, name: "Es Teh", price: 3000 },
    { id: 2, name: "Kopi Hitam", price: 4000 },
    { id: 3, name: "Nasi Goreng", price: 12000 },
    { id: 4, name: "Mie Rebus", price: 10000 },
    { id: 5, name: "Gorengan", price: 1000 }
];

// Initialize Menu
function initMenu() {
    const container = document.getElementById('menu-container');
    menuItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-card';
        div.onclick = () => addToCart(item.name, item.price);
        div.innerHTML = `<strong>${item.name}</strong><div class="price">Rp ${item.price.toLocaleString('id-ID')}</div>`;
        container.appendChild(div);
    });
}

function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    renderCart();
}

function pressKey(key) {
    if (key === 'C') {
        manualBuffer = "0";
    } else {
        if (manualBuffer === "0") manualBuffer = key;
        else manualBuffer += key;
    }
    document.getElementById('manual-input-view').innerText = `Rp ${parseInt(manualBuffer).toLocaleString('id-ID')}`;
}

function addManualItem() {
    const val = parseInt(manualBuffer);
    if (val > 0) {
        addToCart("Item Manual", val);
        manualBuffer = "0";
        document.getElementById('manual-input-view').innerText = "Rp 0";
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('display-total');
    const footerTotal = document.getElementById('footer-total');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-msg">Belum ada item</p>';
        totalDisplay.innerText = "Rp 0";
        footerTotal.innerText = "Rp 0";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, idx) => {
        total += (item.price * item.qty);
        return `
            <div class="cart-item">
                <span>${item.qty}x ${item.name}</span>
                <span>Rp ${(item.price * item.qty).toLocaleString('id-ID')} 
                <button onclick="removeItem(${idx})" style="border:none; background:none; color:red; cursor:pointer">✕</button></span>
            </div>
        `;
    }).join('');

    totalDisplay.innerText = `Rp ${total.toLocaleString('id-ID')}`;
    footerTotal.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function removeItem(idx) {
    cart.splice(idx, 1);
    renderCart();
}

// Modal Logic
function openModal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (total === 0) return alert("Keranjang kosong");
    
    document.getElementById('modal-total-tagihan').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    document.getElementById('payment-modal').style.display = 'flex';
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
        const data = await res.json();
        alert(`Transaksi Berhasil! Kembalian: Rp ${data.change.toLocaleString('id-ID')}`);
        cart = [];
        renderCart();
        closeModal();
    } catch (e) {
        alert("Gagal menghubungi server");
    }
}

function closeModal() { document.getElementById('payment-modal').style.display = 'none'; }
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    event.currentTarget.classList.add('active');
}

document.getElementById('input-uang').addEventListener('input', calculateChange);
initMenu();
