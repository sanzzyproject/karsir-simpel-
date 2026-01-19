let cart = [];
let manualBuffer = "0";
const API_URL = "/api";

// Menu Data dengan Gambar Stock
const menuItems = [
    { id: 1, name: "Es Teh", price: 3000, img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=150&q=80" },
    { id: 2, name: "Kopi Hitam", price: 4000, img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80" },
    { id: 3, name: "Nasi Goreng", price: 12000, img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=150&q=80" },
    { id: 4, name: "Mie Rebus", price: 10000, img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=150&q=80" },
    { id: 5, name: "Gorengan", price: 1000, img: "https://images.unsplash.com/photo-1626508000406-05658097b83c?auto=format&fit=crop&w=150&q=80" }
];

// Initialize Menu
function initMenu() {
    const container = document.getElementById('menu-container');
    menuItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-card';
        div.onclick = () => addToCart(item.name, item.price);
        div.innerHTML = `
            <img src="${item.img}" class="menu-img" alt="${item.name}">
            <div class="menu-name">${item.name}</div>
            <div class="menu-price">Rp ${item.price.toLocaleString('id-ID')}</div>
        `;
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
    
    // Efek visual kecil saat tambah
    const badge = document.getElementById('cart-count');
    badge.style.transform = "scale(1.2)";
    setTimeout(() => badge.style.transform = "scale(1)", 200);
}

function pressKey(key) {
    if (key === 'C') {
        manualBuffer = "0";
    } else {
        if (manualBuffer === "0") manualBuffer = key;
        else manualBuffer += key;
    }
    // Update view numpad
    document.getElementById('manual-input-view').innerText = `Rp ${parseInt(manualBuffer).toLocaleString('id-ID')}`;
}

function addManualItem() {
    const val = parseInt(manualBuffer);
    if (val > 0) {
        addToCart("Item Manual", val);
        manualBuffer = "0";
        document.getElementById('manual-input-view').innerText = "0";
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('display-total');
    const footerTotal = document.getElementById('footer-total');
    const cartCount = document.getElementById('cart-count');
    
    // Hitung Total
    let total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    // Update Text
    totalDisplay.innerText = `Rp ${total.toLocaleString('id-ID')}`;
    footerTotal.innerText = `Rp ${total.toLocaleString('id-ID')}`;
    cartCount.innerText = `${totalQty} Item`;

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-state" style="text-align:center; padding:20px; color:#555;"><p>Belum ada item</p></div>';
        return;
    }

    container.innerHTML = cart.map((item, idx) => {
        return `
            <div class="cart-item">
                <div class="item-icon">🛍️</div>
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">${item.qty} x Rp ${item.price.toLocaleString('id-ID')}</span>
                </div>
                <span class="item-price">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</span>
                <button class="btn-remove" onclick="removeItem(${idx})">✕</button>
            </div>
        `;
    }).join('');
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
        alert(`✅ Transaksi Berhasil!\nKembalian: Rp ${data.change.toLocaleString('id-ID')}`);
        
        // Reset
        cart = [];
        renderCart();
        closeModal();
        document.getElementById('input-uang').value = '';
    } catch (e) {
        alert("Gagal menghubungi server");
    }
}

function closeModal() { document.getElementById('payment-modal').style.display = 'none'; }

function switchTab(tab) {
    document.querySelectorAll('.tab-pane').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    // Cari tombol yang di klik berdasarkan onclick text atau index (simple way: manual assignment)
    if(tab === 'manual') document.querySelectorAll('.seg-btn')[0].classList.add('active');
    else document.querySelectorAll('.seg-btn')[1].classList.add('active');
}

document.getElementById('input-uang').addEventListener('input', calculateChange);
initMenu();
