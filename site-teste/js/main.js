// main.js
// 1) Menu toggle for small screens
document.addEventListener('DOMContentLoaded', function () {
	const menuButton = document.getElementById('menuButton');
	const mainMenu = document.getElementById('mainMenu');

	if (menuButton && mainMenu) {
		menuButton.addEventListener('click', function () {
			const expanded = this.getAttribute('aria-expanded') === 'true';
			this.setAttribute('aria-expanded', String(!expanded));
			if (mainMenu.hasAttribute('hidden')) {
				mainMenu.removeAttribute('hidden');
			} else {
				mainMenu.setAttribute('hidden', '');
			}
		});
	}

	// 2) Image src fix: replace spaces in filenames with %20 so browsers can load them reliably
	const imgs = Array.from(document.querySelectorAll('img'));
	imgs.forEach(img => {
		if (img.src && img.getAttribute('src') && img.getAttribute('src').includes(' ')) {
			img.src = img.getAttribute('src').replace(/ /g, '%20');
		}
		// Provide a lightweight error fallback
		img.addEventListener('error', () => {
			img.style.opacity = '0.6';
			img.title = 'Imagem não encontrada';
		});
	});

	// 3) Simple form validation demo (if a form with id 'contactForm' exists)
	const contactForm = document.getElementById('contactForm');
	if (contactForm) {
		contactForm.addEventListener('submit', function (e) {
			const name = contactForm.querySelector('[name="name"]');
			const email = contactForm.querySelector('[name="email"]');
			let valid = true;
			if (!name || name.value.trim().length < 2) {
				valid = false;
				name && name.classList.add('invalid');
			}
			if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
				valid = false;
				email && email.classList.add('invalid');
			}
			if (!valid) {
				e.preventDefault();
				alert('Por favor corrija os campos em destaque antes de enviar.');
			}
		});
	}
});

// 4) Read more / Read less for product descriptions
document.addEventListener('DOMContentLoaded', function () {
	const THRESHOLD = 80; // characters before truncation
	const descElements = Array.from(document.querySelectorAll('.product-card p'));

	descElements.forEach(p => {
		const fullText = p.textContent.trim();
		if (fullText.length <= THRESHOLD) return; // short enough

		const shortText = fullText.slice(0, THRESHOLD).replace(/\s+$/, '') + '...';

		const spanShort = document.createElement('span');
		spanShort.className = 'desc-short';
		spanShort.textContent = shortText + ' ';

		const spanFull = document.createElement('span');
		spanFull.className = 'desc-full';
		spanFull.textContent = fullText + ' ';
		spanFull.style.display = 'none';

		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'read-more-btn';
		btn.textContent = 'Ler mais';

		btn.addEventListener('click', () => {
			const expanded = spanFull.style.display !== 'none';
			if (expanded) {
				spanFull.style.display = 'none';
				spanShort.style.display = '';
				btn.textContent = 'Ler mais';
			} else {
				spanFull.style.display = '';
				spanShort.style.display = 'none';
				btn.textContent = 'Ler menos';
			}
		});

		// Replace paragraph content with the new nodes
		p.textContent = ''; // clear
		p.appendChild(spanShort);
		p.appendChild(spanFull);
		p.appendChild(btn);
	});
});

// Carrinho: adicionar itens, alterar quantidade, remover, mostrar preços e total
document.addEventListener('DOMContentLoaded', function () {
	// cart: { [name]: { qty: number, price: number } }
	const cart = {};
	const cartItemsEl = document.getElementById('cartItems');
	const checkoutBtn = document.getElementById('checkoutBtn');
	const cartEl = document.getElementById('cart');
	const cartToggle = cartEl?.querySelector('.cart-toggle');
	const cartCountEl = document.getElementById('cartCount');

	const currency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

	function updateCheckoutButton() {
		const totalCount = Object.values(cart).reduce((s, it) => s + it.qty, 0);
		const totalPrice = Object.values(cart).reduce((s, it) => s + (it.qty * it.price), 0);
		if (checkoutBtn) {
			checkoutBtn.disabled = totalCount === 0;
			checkoutBtn.textContent = `Ir para pagamento (${totalCount}) - ${currency(totalPrice)}`;
		}

		// Atualiza indicador compacto (badge)
		if (cartCountEl) cartCountEl.textContent = String(totalCount);
		if (cartToggle) cartToggle.title = totalCount === 0 ? 'Carrinho vazio' : `Abrir carrinho — ${totalCount} item(s)`;
	}

	function renderCart() {
		if (!cartItemsEl) return;
		cartItemsEl.innerHTML = '';

		const names = Object.keys(cart);
		if (names.length === 0) {
			cartItemsEl.innerHTML = '<div class="text-muted">Carrinho vazio</div>';
			return;
		}

		names.forEach(name => {
			const { qty, price } = cart[name];

			const row = document.createElement('div');
			row.className = 'd-flex justify-content-between align-items-center mb-2';

			const left = document.createElement('div');
			left.innerHTML = `<div class="fw-semibold">${name}</div><small class="text-muted">${currency(price)} unidade</small>`;

			const right = document.createElement('div');
			right.className = 'd-flex align-items-center gap-2';

			const dec = document.createElement('button');
			dec.className = 'btn btn-sm btn-outline-secondary qty-decrease';
			dec.setAttribute('data-name', name);
			dec.textContent = '−';

			const qtyBadge = document.createElement('span');
			qtyBadge.className = 'badge bg-secondary qty-badge';
			qtyBadge.textContent = qty;

			const inc = document.createElement('button');
			inc.className = 'btn btn-sm btn-outline-secondary qty-increase';
			inc.setAttribute('data-name', name);
			inc.textContent = '+';

			const remove = document.createElement('button');
			remove.className = 'btn btn-sm btn-danger remove-item';
			remove.setAttribute('data-name', name);
			remove.textContent = 'Remover';

			const subtotal = document.createElement('div');
			subtotal.className = 'ms-2 text-end small text-muted';
			subtotal.textContent = `${currency(qty * price)}`;

			right.appendChild(dec);
			right.appendChild(qtyBadge);
			right.appendChild(inc);
			right.appendChild(remove);
			right.appendChild(subtotal);

			row.appendChild(left);
			row.appendChild(right);

			cartItemsEl.appendChild(row);
		});

		// Total line
		const totalPrice = Object.values(cart).reduce((s, it) => s + (it.qty * it.price), 0);
		const totalDiv = document.createElement('div');
		totalDiv.className = 'mt-2 fw-bold';
		totalDiv.textContent = `Total: ${currency(totalPrice)}`;
		cartItemsEl.appendChild(totalDiv);
	}

	function addToCart(name, price) {
		if (!name) return;
		const p = typeof price === 'number' ? price : parseFloat(price) || 0;
		if (!cart[name]) cart[name] = { qty: 0, price: p };
		cart[name].qty += 1;
		renderCart();
		updateCheckoutButton();
	}

	function changeQty(name, delta) {
		if (!cart[name]) return;
		cart[name].qty += delta;
		if (cart[name].qty <= 0) delete cart[name];
		renderCart();
		updateCheckoutButton();
	}

	function removeItem(name) {
		if (!cart[name]) return;
		delete cart[name];
		renderCart();
		updateCheckoutButton();
	}

	// Bind add-item buttons
	// Mostrar preço visível nos cards antes de ligar os botões
	const productCards = Array.from(document.querySelectorAll('.product-card'));
	productCards.forEach(card => {
		const btn = card.querySelector('.add-item');
		if (!btn) return;
		const price = parseFloat(btn.getAttribute('data-price')) || 0;
		const priceEl = document.createElement('div');
		priceEl.className = 'product-price';
		priceEl.textContent = currency(price);
		const cardBody = card.querySelector('.card-body');
		if (cardBody) {
			const dgrid = cardBody.querySelector('.d-grid');
			if (dgrid) cardBody.insertBefore(priceEl, dgrid);
			else cardBody.appendChild(priceEl);
		}
	});

	const addButtons = Array.from(document.querySelectorAll('.add-item'));
	addButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			const name = btn.getAttribute('data-name') || btn.closest('.card')?.querySelector('.card-title')?.textContent?.trim();
			const price = parseFloat(btn.getAttribute('data-price')) || 0;
			addToCart(name, price);
			// feedback visual
			btn.classList.add('btn-success');
			setTimeout(()=> btn.classList.remove('btn-success'), 300);
		});
	});

	// Toggle cart open/close when clicking the circular toggle
	if (cartToggle && cartEl) {
		cartToggle.addEventListener('click', () => {
			cartEl.classList.toggle('open');
		});
		// also allow clicking outside to close when open
		document.addEventListener('click', (e) => {
			if (!cartEl.classList.contains('open')) return;
			if (cartEl.contains(e.target)) return;
			cartEl.classList.remove('open');
		});
	}

	// Delegate quantity and remove actions from cartItemsEl
	if (cartItemsEl) {
		cartItemsEl.addEventListener('click', (e) => {
			const btn = e.target.closest('button');
			if (!btn) return;
			const name = btn.getAttribute('data-name');
			if (btn.classList.contains('qty-decrease')) {
				changeQty(name, -1);
			} else if (btn.classList.contains('qty-increase')) {
				changeQty(name, +1);
			} else if (btn.classList.contains('remove-item')) {
				removeItem(name);
			}
		});
	}

	// Checkout action (demo)
	if (checkoutBtn) {
		checkoutBtn.addEventListener('click', () => {
			const totalCount = Object.values(cart).reduce((s, it) => s + it.qty, 0);
			const totalPrice = Object.values(cart).reduce((s, it) => s + (it.qty * it.price), 0);
			if (totalCount === 0) return;
			alert(`Indo para pagamento com ${totalCount} item(ns). Total: ${currency(totalPrice)}`);
			// Aqui você pode redirecionar para a página de checkout
		});
	}

	// initial render
	renderCart();
	updateCheckoutButton();
});
