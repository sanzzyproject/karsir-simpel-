let cart = [];
let manualBuffer = "0";
const API_URL = "/api";

// Gambar Stok untuk Menu (Placeholder)
const menuImages = {
    "Es Teh": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=150&q=80",
    "Kopi Hitam": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80",
    "Nasi Goreng": "https://images.unsplash.com/photo-1603133872878-684f108fd1f6?auto=format&fit=crop&w=150&q=80",
    "Mie Rebus": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=150&q=80",
    "Gorengan": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=150&q=80"
};

const menuItems = [
    { id: 1, name: "Es Teh", price: 3000 },
    { id: 2, name: "Kopi Hitam", price: 4000 },
    { id: 3, name: "Nasi Goreng", price: 12000 },
    { id: 4, name: "Mie Rebus", price: 10000 },
    { id: 5, name: "Gorengan", price: 1000 }
];

function initMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    menuItems.forEach(item => {
        const imgUrl = menuImages[item.name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80";
        const div = document.createElement('div');
        div.className = 'menu-card';
        div.onclick = () => addToCart(item.name, item.price);
        div.innerHTML = `
            <img src="${imgUrl}" class="menu-img" alt="${item.name}">
            <div class="menu-info">
                <h4>${item.name}</h4>
                <span class="menu-price">Rp ${item.price.toLocaleString('id-ID')}</span>
            </div>
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
    // Efek getar di HP saat nambah item
    if(navigator.vibrate) navigator.vibrate(50);
}

function pressKey(key) {
    if (key === 'C') {
        manualBuffer = "0";
    } else {
        if (manualBuffer === "0") manualBuffer = key;
        else if (manualBuffer.length < 9) manualBuffer += key;
    }
    document.getElementById('manual-input-view').innerText = parseInt(manualBuffer).toLocaleString('id-ID');
}

function addManualItem() {
    const val = parseInt(manualBuffer);
    if (val > 0) {
        addToCart("Item Manual", val);
        manualBuffer = "0";
        document.getElementById('manual-input-view').innerText = "0";
        switchTab('menu'); // Auto switch back to see cart
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('display-total');
    const footerTotal = document.getElementById('footer-total');
    const cartCount = document.getElementById('cart-count');
    
    let total = 0;
    let totalQty = 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Belum ada item</p>
            </div>`;
    } else {
        container.innerHTML = cart.map((item, idx) => {
            total += (item.price * item.qty);
            totalQty += item.qty;
            const itemTotal = item.price * item.qty;
            
            // Tentukan icon berdasarkan nama
            let icon = 'fa-utensils';
            if(item.name.includes('Teh') || item.name.includes('Kopi')) icon = 'fa-mug-hot';
            if(item.name.includes('Manual')) icon = 'fa-keyboard';

            return `
                <div class="cart-item">
                    <div class="item-left">
                        <div class="item-icon"><i class="fa-solid ${icon}"></i></div>
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <span>${item.qty} x Rp ${item.price.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                    <div class="item-right">
                        <span class="item-price">Rp ${itemTotal.toLocaleString('id-ID')}</span>
                        <button class="btn-remove" onclick="removeItem(${idx})">Hapus</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    totalDisplay.innerText = `Rp ${total.toLocaleString('id-ID')}`;
    footerTotal.innerText = `Rp ${total.toLocaleString('id-ID')}`;
    cartCount.innerText = `${totalQty} Item`;
}

function removeItem(idx) {
    cart.splice(idx, 1);
    renderCart();
}

function switchTab(tab) {
    // Reset tabs
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.action-btn').forEach(b => {
        b.classList.remove('active');
        b.classList.add('secondary');
    });

    // Active tab
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    
    // Update button style
    const btnIndex = tab === 'menu' ? 0 : 1;
    const btn = document.querySelectorAll('.action-btn')[btnIndex];
    btn.classList.add('active');
    btn.classList.remove('secondary');
}

// Modal Logic
function openPaymentModal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (total === 0) return alert("Keranjang kosong");
    
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
    const el = document.getElementById('text-kembalian');
    
    el.innerText = `Rp ${Math.max(0, change).toLocaleString('id-ID')}`;
    if (change < 0) el.style.color = '#ff4757'; // Merah
    else el.style.color = '#a3e635'; // Hijau
}

async function prosesTransaksi() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const paid = parseInt(document.getElementById('input-uang').value) || 0;

    if (paid < total) return alert("Uang kurang!");

    try {
        const btn = document.querySelector('.btn-confirm');
        btn.innerText = "Memproses...";
        btn.disabled = true;

        const res = await fetch(`${API_URL}/transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, paid })
        });
        
        const data = await res.json();
        
        if (data.status === 'success') {
            showSuccessScreen(data);
            cart = [];
            renderCart();
            closeModal();
        } else {
            alert("Error: " + data.detail);
        }

    } catch (e) {
        alert("Gagal menghubungi server");
        console.error(e);
    } finally {
        const btn = document.querySelector('.btn-confirm');
        btn.innerText = "Proses";
        btn.disabled = false;
    }
}

function showSuccessScreen(data) {
    document.getElementById('success-amount').innerText = `Rp ${data.total.toLocaleString('id-ID')}`;
    document.getElementById('receipt-paid').innerText = `Rp ${data.paid.toLocaleString('id-ID')}`;
    document.getElementById('receipt-change').innerText = `Rp ${data.change.toLocaleString('id-ID')}`;
    document.getElementById('receipt-total').innerText = `Rp ${data.total.toLocaleString('id-ID')}`;
    
    document.getElementById('success-overlay').classList.remove('hidden');
}

function resetApp() {
    document.getElementById('success-overlay').classList.add('hidden');
}

function cartScroll() {
    document.querySelector('.cart-section').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('input-uang').addEventListener('input', calculateChange);
initMenu();
