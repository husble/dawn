class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      this.closest('cart-items').updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status');

    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  getSectionsToRender() {
    if (window.location.pathname === '/cart') {
      return [
        {
          id: 'main-cart-footer',
          section: 'header',
          selector: '.js-contents-footer',
        },
        {
          id: 'main-cart-items',
          section: 'header',
          selector: '.js-contents',
        },
        {
          id: 'cart-icon-bubble',
          section: 'header',
          selector: '.js-cart',
        },
        {
          id: 'main-cart-items-page',
          section: 'main-cart-items',
          selector: '.js-contents-main',
        },
      ];
    }

    return [
      {
        id: 'main-cart-footer',
        section: 'header',
        selector: '.js-contents-footer',
      },
      {
        id: 'main-cart-items',
        section: 'header',
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'header',
        selector: '.js-cart',
      }
    ];
  }

  showCustomily(evt){
    console.log('12121212')
    // cartItem = evt.target.closest('.cart__item-title')
    // imageLinkURL = cartItem.querySelector('.customily-image').innerHTML
    // const modalImg = document.getElementById("personalized-modal__img")
    // modalImg.src = imageLinkURL
    // const modal = document.getElementById("personalized-modal");
    // modal.style.display = "flex"
    // document.body.classList.add("disable-event")
    // document.getElementById('HeaderCart').classList.add("disable-event")
}

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`/cart/change.js`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const { item_count } = parsedState
        
        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }));

        if (item_count === 0) {
          document.getElementById('main-cart-items').style.padding = '0';
        } else {
          document.getElementById('main-cart-items').style.padding = '20px 20px 0'
        }

        this.updateLiveRegions(line, parsedState.item_count);
        document.getElementById(`CartItem-${line}`)?.querySelector(`[name="${name}"]`)?.focus();
        this.disableLoading();
      }).catch(() => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        document.getElementById('cart-errors').textContent = window.cartStrings.error;
        this.disableLoading();
      });
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      document.getElementById(`Line-item-error-${line}`)
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          document.getElementById(`Quantity-${line}`).value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  renderContents(parsedState) {
    const { item_count } = parsedState
    this.getSectionsToRender().forEach((section => {

      const elementToReplace =
        document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
      elementToReplace.innerHTML =
        this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
    }));

    if (item_count === 0) {
      document.getElementById('main-cart-items').style.padding = '0';
    } else {
      document.getElementById('main-cart-items').style.padding = '20px 20px 0'
    }
  }

  enableLoading(line) {
    // document.getElementById('main-cart-items').classList.add('cart__items--disabled');
    // this.querySelectorAll(`#CartItem-${line} .loading-overlay`).forEach((overlay) => overlay.classList.remove('hidden'));
    // document.activeElement.blur();
    // this.lineItemStatusElement.setAttribute('aria-hidden', false);
    if (window.location.pathname === '/cart') {
      document.querySelector(`#CartItemPage-${line} .quantity`).classList.add('loading')
    } else {
      document.querySelector(`#CartItem-${line} .quantity`).classList.add('loading')
    }
  }

  disableLoading() {
    // document.getElementById('main-cart-items').classList.remove('cart__items--disabled');
    if (window.location.pathname === '/cart') {
      document.querySelector(`#CartItemPage-${line} .quantity`).classList.add('loading')
    } else {
      document.querySelector(`#CartItem-${line} .quantity`).classList.remove('loading')
    }
  }
}

customElements.define('cart-items', CartItems);

function showCustomily(evt){
  const cartItem = evt.target.closest(".cart-item__details")
  const imageLinkURL = cartItem.querySelector('.customily-image').innerHTML
  const modalImg = document.getElementById("personalized-modal__img")
  modalImg.src = imageLinkURL
  const modal = document.getElementById("personalized-modal");
  modal.style.display = "flex"
  document.body.classList.add("disable-event")
  // document.getElementById('HeaderCart').classList.add("disable-event")
}
