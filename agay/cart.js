// cart.js - Cart page specific functionality

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    setupCheckoutForm();
});

// Load cart items
function loadCart() {
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('stylehub_cart')) || [];
    
    if (cart.length === 0) {
        // Cart is empty
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart fa-3x"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <a href="index.html" class="btn">Continue Shopping</a>
            </div>
        `;
        
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
        
        return;
    }
    
    // Build cart HTML
    let cartHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartHTML += `
            <tr data-id="${item.id}">
                <td>
                    <div class="cart-product">
                        <img src="${item.image}" alt="${item.name}" class="cart-product-img">
                        <div class="cart-product-info">
                            <h4 class="cart-product-name">${item.name}</h4>
                        </div>
                    </div>
                </td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <div class="quantity-selector">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
                        <button class="quantity-btn plus">+</button>
                    </div>
                </td>
                <td>$${itemTotal.toFixed(2)}</td>
                <td>
                    <button class="cart-remove" data-id="${item.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    cartHTML += `
            </tbody>
        </table>
        <div class="cart-actions">
            <a href="index.html" class="btn btn-outline">Continue Shopping</a>
            <button class="btn clear-cart">Clear Cart</button>
        </div>
    `;
    
    cartContainer.innerHTML = cartHTML;
    
    // Update cart summary
    if (cartSummary) {
        const shipping = subtotal >= 100 ? 0 : 10;
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + shipping + tax;
        
        cartSummary.innerHTML = `
            <h3 class="cart-summary-title">Cart Summary</h3>
            <div class="cart-summary-item">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="cart-summary-item">
                <span>Shipping</span>
                <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="cart-summary-item">
                <span>Tax (10%)</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="cart-summary-item cart-total">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <button class="btn btn-block" id="checkout-btn">Proceed to Checkout</button>
        `;
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                window.location.href = 'checkout.html';
            });
        }
    }
    
    // Add event listeners to quantity buttons
    const minusButtons = document.querySelectorAll('.quantity-btn.minus');
    const plusButtons = document.querySelectorAll('.quantity-btn.plus');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    
    minusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.nextElementSibling;
            const id = input.dataset.id;
            let value = parseInt(input.value);
            
            if (value > 1) {
                value--;
                input.value = value;
                updateCartItemQuantity(id, value);
            }
        });
    });
    
    plusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const id = input.dataset.id;
            let value = parseInt(input.value);
            
            value++;
            input.value = value;
            updateCartItemQuantity(id, value);
        });
    });
    
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const id = this.dataset.id;
            let value = parseInt(this.value);
            
            if (value < 1 || isNaN(value)) {
                value = 1;
                this.value = value;
            }
            
            updateCartItemQuantity(id, value);
        });
    });
    
    // Remove item from cart
    const removeButtons = document.querySelectorAll('.cart-remove');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            removeCartItem(id);
        });
    });
    
    // Clear cart button
    const clearCartBtn = document.querySelector('.clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            clearCart();
        });
    }
}

// Update cart item quantity
function updateCartItemQuantity(id, quantity) {
    let cart = JSON.parse(localStorage.getItem('stylehub_cart')) || [];
    
    // Find the item
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex > -1) {
        cart[itemIndex].quantity = quantity;
        localStorage.setItem('stylehub_cart', JSON.stringify(cart));
        
        // Refresh cart display
        loadCart();
    }
}

// Remove item from cart
function removeCartItem(id) {
    let cart = JSON.parse(localStorage.getItem('stylehub_cart')) || [];
    
    // Remove the item
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('stylehub_cart', JSON.stringify(cart));
    
    // Update cart count
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
    
    // Refresh cart display
    loadCart();
    
    showNotification('Item removed from cart!');
}

// Clear cart
function clearCart() {
    localStorage.removeItem('stylehub_cart');
    
    // Update cart count
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = '0';
    }
    
    // Refresh cart display
    loadCart();
    
    showNotification('Cart cleared!');
}

// Setup checkout form
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(this)) {
                // In a real app, this would submit the form to a server
                
                // Show success message
                const orderConfirmation = document.createElement('div');
                orderConfirmation.className = 'order-confirmation';
                orderConfirmation.innerHTML = `
                    <div class="order-success">
                        <i class="fas fa-check-circle fa-3x"></i>
                        <h2>Order Placed Successfully!</h2>
                        <p>Your order has been placed successfully. Thank you for shopping with StyleHub!</p>
                        <p>Order number: #${Math.floor(Math.random() * 10000000)}</p>
                        <a href="index.html" class="btn">Continue Shopping</a>
                    </div>
                `;
                
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    mainContent.innerHTML = '';
                    mainContent.appendChild(orderConfirmation);
                }
                
                // Clear cart
                localStorage.removeItem('stylehub_cart');
                
                // Update cart count
                const cartCount = document.querySelector('.cart-count');
                if (cartCount) {
                    cartCount.textContent = '0';
                }
            }
        });
    }
}

// Show notification
function showNotification(message) {
    // Check if notification already exists
    let notification = document.querySelector('.notification');
    
    if (notification) {
        // Update existing notification
        notification.textContent = message;
        
        // Restart animation
        notification.classList.remove('show');
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    } else {
        // Create new notification
        notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }
    
    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Form validation
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            markInvalid(input, 'This field is required');
            isValid = false;
        } else if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
                markInvalid(input, 'Please enter a valid email address');
                isValid = false;
            } else {
                markValid(input);
            }
        } else {
            markValid(input);
        }
    });
    
    return isValid;
}

function markInvalid(input, message) {
    input.classList.add('invalid');
    
    // Remove any existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    input.parentElement.appendChild(errorMessage);
    
    // Clear error when input changes
    input.addEventListener('input', function() {
        this.classList.remove('invalid');
        const error = this.parentElement.querySelector('.error-message');
        if (error) {
            error.remove();
        }
    }, { once: true });
}

function markValid(input) {
    input.classList.remove('invalid');
    const error = input.parentElement.querySelector('.error-message');
    if (error) {
        error.remove();
    }
}