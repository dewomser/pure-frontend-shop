// Warten, bis das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {

    console.log("Webshop-Skript geladen.");

    // Helper-Funktionen für Cookies
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // SessionID-Logik
    function generateSessionId() {
        return 'sid_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    function getOrSetSessionId() {
        let sessionId = getCookie('sessionId');
        if (!sessionId) {
            sessionId = generateSessionId();
            setCookie('sessionId', sessionId, 7); // Session-Cookie für 7 Tage
        }
        return sessionId;
    }

    const sessionId = getOrSetSessionId();
    console.log("SessionID:", sessionId);

    // Produktdaten
    const products = [
        { id: 1, name: 'Produkt 1', price: 10.00, image: 'images/produkt1.png' },
        { id: 2, name: 'Produkt 2', price: 15.50, image: 'images/produkt2.png' },
        { id: 3, name: 'Produkt 3', price: 20.00, image: 'images/produkt3.png' },
        { id: 4, name: 'Produkt 4', price: 5.75, image: 'images/produkt4.png' },
        { id: 5, name: 'Produkt 5', price: 30.00, image: 'images/produkt5.png' },
        { id: 6, name: 'Produkt 6', price: 12.00, image: 'images/produkt6.png' },
        { id: 7, name: 'Produkt 7', price: 8.99, image: 'images/produkt7.png' },
        { id: 8, name: 'Produkt 8', price: 45.00, image: 'images/produkt8.png' },
        { id: 9, name: 'Produkt 9', price: 25.00, image: 'images/produkt9.png' },
        { id: 10, name: 'Produkt 10', price: 18.25, image: 'images/produkt10.png' }
    ];

    const productList = document.getElementById('product-list');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutForm = document.getElementById('checkout-form');

    let cart = [];

    // Funktion zur Anzeige der Produkte
    function displayProducts() {
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">${product.price.toFixed(2)} €</p>
                <input type="number" id="quantity-${product.id}" value="1" min="1">
                <button data-id="${product.id}">In den Warenkorb</button>
            `;
            productList.appendChild(productCard);
        });
    }

    // Warenkorb-Logik
    productList.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
            const productId = parseInt(e.target.dataset.id);
            const quantityInput = document.getElementById(`quantity-${productId}`);
            const quantity = parseInt(quantityInput.value);
            addToCart(productId, quantity);
        }
    });

    function addToCart(productId, quantity) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const product = products.find(p => p.id === productId);
            cart.push({ ...product, quantity });
        }
        updateCart();
    }

    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Ihr Warenkorb ist leer.</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <span>${item.name} (x${item.quantity})</span>
                    <span>${(item.price * item.quantity).toFixed(2)} €</span>
                `;
                cartItemsContainer.appendChild(cartItem);
                total += item.price * item.quantity;
            });
        }
        cartTotal.textContent = total.toFixed(2);
    }

    // Checkout-Logik
    checkoutForm.addEventListener('submit', e => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Ihr Warenkorb ist leer. Bitte fügen Sie Produkte hinzu, bevor Sie bestellen.");
            return;
        }

        const formData = new FormData(checkoutForm);
        const customer = {
            name: formData.get('name'),
            address: formData.get('address'),
            zip: formData.get('zip'),
            city: formData.get('city'),
            email: formData.get('email')
        };
        const paymentMethod = formData.get('payment-method');

        const shopOwnerEmail = 'shopbetreiber@example.com'; // BITTE ERSETZEN
        const subject = `Neue Bestellung von ${customer.name}`;
        
        let body = `Hallo ${customer.name},\n\nvielen Dank für Ihre Bestellung.\n\n`;
        body += `Bestellungs-ID (Session): ${sessionId}\n\n`;
        body += "Ihre Lieferadresse:\n";
        body += `${customer.name}\n${customer.address}\n${customer.zip} ${customer.city}\n\n`;
        body += "Bestellübersicht:\n";
        body += "--------------------\n";
        
        cart.forEach(item => {
            body += `- ${item.name} (x${item.quantity}): ${(item.price * item.quantity).toFixed(2)} €\n`;
        });
        
        body += "--------------------\n";
        body += `Gesamtsumme: ${cartTotal.textContent} €\n\n`;
        body += `Gewählte Zahlungsart: ${paymentMethod}\n\n`;
        body += "Mit freundlichen Grüßen,\nIhr Webshop";

        const mailtoLink = `mailto:${shopOwnerEmail}?cc=${customer.email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;

        // Optional: Warenkorb leeren und Formular zurücksetzen nach dem Absenden
        cart = [];
        updateCart();
        checkoutForm.reset();
    });

    // Produkte beim Laden der Seite anzeigen
    displayProducts();

});
