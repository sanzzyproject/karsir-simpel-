let cart = [];
let manualBuffer = "0";
const API_URL = "/api";

// Fetch menu on load
async function initMenu() {
    try {
        const res = await fetch(`${API_URL}/menu`);
        const menuItems = await res.json();
        const container = document.getElementById('menu-container');
        container.innerHTML = '';
        
        menuItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'menu-item';
            div.onclick = () => addToCart(item);
            div.innerHTML = `
                <div class="item-left">
                    <div class="item-emoji">${item.emoji || '🍽️'}</div>
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <button class="add-btn"><i class="ph ph-plus"></i></button>
            `;
            container.appendChild(div);
        });
    } catch (e) {
        console.error("Gagal load menu", e);
    }
}

function addToCart(item) {
    const existing = cart.find(i => i.name === item.name && i.price === item.price);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1 }); // clone item
    }
    renderCart();
}

function renderCart() {
    const totalDisplay = document.getElementById('display-total');
    const container = document.getElementById('cart-items');
    const badge = document.getElementById('cart-count');
    
    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-state">Belum ada item</p>';
    } else {
        container.innerHTML = cart.map((item, idx) => {
            total += (item.price * item.qty);
            itemCount += item.qty;
            return `
                <div class="cart-row">
                    <span>${item.qty}x ${item.name}</span>
                    <span>
                        Rp ${(item.price * item.qty).toLocaleString('id-ID')}
                        <button onclick="removeItem(${idx})"><i class="ph ph-trash"></i></button>
                    </span>
                </div>
            `;
        }).join('');
    }

    totalDisplay.innerText = `Rp ${total.toLocaleString('id-ID')}`;
    badge.innerText = `${itemCount} Item`;
}

function removeItem(idx) {
    cart.splice(idx, 1);
    renderCart();
}

function clearCart() {
    if(confirm("Hapus semua item?")) {
        cart = [];
        renderCart();
    }
}

// Manual Input Logic
function pressKey(key) {
    if (key === 'C') {
        manualBuffer = manualBuffer.slice(0, -1);
        if (manualBuffer === "") manualBuffer = "0";
    } else {
        if (manualBuffer === "0" && key !== '.') manualBuffer = key;
        else manualBuffer += key;
    }
    document.getElementById('manual-input-view').innerText = parseInt(manualBuffer).toLocaleString('id-ID');
}

function addManualItem() {
    const val = parseInt(manualBuffer.replace(/\./g, ''));
    if (val > 0) {
        addToCart({ name: "Manual Item", price: val, emoji: "⌨️" });
        manualBuffer = "0";
        document.getElementById('manual-input-view').innerText = "0";
        switchTab('menu'); // Balik ke menu view agar user lihat item masuk
        alert("Item manual ditambahkan!");
    }
}

// UI Tabs
function switchTab(tab) {
    document.querySelectorAll('.content-view').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.segment').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    // Simple way to find button based on onclick text, or just use indices
    const btns = document.querySelectorAll('.segment');
    if(tab === 'menu') btns[0].classList.add('active');
    else btns[1].classList.add('active');
}

function toggleCartDetails() {
    // Logic untuk expand cart bisa ditambahkan di CSS class
    const cartEl = document.querySelector('.cart-preview');
    if(cartEl.style.maxHeight === '80%') cartEl.style.maxHeight = '40%';
    else cartEl.style.maxHeight = '80%';
}

// Payment Modal
function openPaymentModal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (total === 0) return alert("Keranjang kosong!");
    
    document.getElementById('modal-total-tagihan').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    document.getElementById('payment-modal').style.display = 'flex';
    document.getElementById('input-uang').value = '';
    document.getElementById('text-kembalian').innerText = 'Rp 0';
}

function closeModal() {
    document.getElementById('payment-modal').style.display = 'none';
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
        
        if(!res.ok) throw new Error("Gagal");
        
        const data = await res.json();
        alert(`SUKSES!\nKembalian: Rp ${data.change.toLocaleString('id-ID')}`);
        cart = [];
        renderCart();
        closeModal();
    } catch (e) {
        alert("Terjadi kesalahan koneksi");
    }
}

document.getElementById('input-uang').addEventListener('input', calculateChange);
initMenu();
