/**
 * Bag Animation Module
 * Maneja las animaciones de items siendo añadidos a la mochila usando anime.js
 */

export class BagAnimator {
  constructor() {
    this.backpackImg = null;
    this.bagCounter = null;
    this.itemsPreview = null;
    this.emptyState = null;
    this.itemsInBag = [];
    this.initialized = false;
  }

  /**
   * Inicializa los elementos del DOM (llamado cuando se cargan en la pantalla)
   */
  init() {
    if (this.initialized) return;
    
    this.backpackImg = document.getElementById('backpack-img');
    this.bagCounter = document.getElementById('bag-count');
    this.itemsPreview = document.getElementById('bag-items-preview');
    this.emptyState = document.getElementById('bag-empty-state');
    
    if (!this.backpackImg || !this.bagCounter || !this.itemsPreview) {
      console.warn('BagAnimator: Some DOM elements not found yet');
      return false;
    }
    
    this.initialized = true;
    return true;
  }

  /**
   * Animación para cuando se hace CLIC en un item (vuela a la mochila)
   * @param {HTMLElement} itemElement - El elemento item-card original
   * @param {Object} itemData - Datos del item
   */
  async animateClickToBag(itemElement, itemData) {
    if (!this.initialized) this.init();
    if (!this.backpackImg) return;

    // Crear clon para la animación de vuelo
    const clone = itemElement.cloneNode(true);
    clone.classList.add('flying');
    document.body.appendChild(clone);

    const startRect = itemElement.getBoundingClientRect();
    const backpackRect = this.backpackImg.getBoundingClientRect();

    // Posición inicial del clon
    clone.style.left = `${startRect.left}px`;
    clone.style.top = `${startRect.top}px`;
    clone.style.width = `${startRect.width}px`;
    clone.style.height = `${startRect.height}px`;

    const targetX = backpackRect.left + backpackRect.width / 2 - startRect.width / 2;
    const targetY = backpackRect.top + backpackRect.height / 2 - startRect.height / 2;

    const animation = anime.timeline({
      easing: 'easeOutQuart',
      duration: 600,
    });

    animation.add({
      targets: clone,
      translateX: targetX - startRect.left,
      translateY: [
        { value: (targetY - startRect.top) / 2 - 80, duration: 300, easing: 'easeOutQuad' },
        { value: targetY - startRect.top, duration: 300, easing: 'easeInQuad' }
      ],
      scale: [
        { value: 1.2, duration: 200 },
        { value: 0.1, duration: 400 }
      ],
      rotate: '0.5turn',
      opacity: { value: 0, delay: 400, duration: 200 }
    });

    await animation.finished;
    clone.remove();

    this.addItemToBag(itemData);
    this.animateBackpack('glow');
  }

  /**
   * Animación para cuando se SUELTA un item (drag & drop) en la mochila
   * @param {HTMLElement} itemElement - El elemento que se soltó
   * @param {Object} itemData - Datos del item
   */
  async animateDropToBag(itemElement, itemData) {
    if (!this.initialized) this.init();
    
    // Animación de "entrar" en la mochila (escala hacia 0 y desaparece)
    const animation = anime({
      targets: itemElement,
      scale: [1, 0],
      opacity: [1, 0],
      translateY: 30, // Se "hunde" un poco
      rotate: '15deg',
      duration: 400,
      easing: 'easeInBack'
    });

    await animation.finished;
    // El elemento será removido por el llamador (Sortablejs onAdd)
    
    this.addItemToBag(itemData);
    this.animateBackpack('glow');
  }

  /**
   * Añade un item a la lista interna y actualiza UI
   */
  addItemToBag(itemData) {
    // Evitar duplicados visuales si ya está (seguridad)
    if (this.itemsInBag.find(i => i.id === itemData.id)) return;
    
    this.itemsInBag.push(itemData);
    this.updateCounter();
    this.updatePreview();
  }

  /**
   * Remueve un item de la bolsa
   */
  removeItemFromBag(itemId) {
    const index = this.itemsInBag.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.itemsInBag.splice(index, 1);
      this.updateCounter();
      this.updatePreview();
      this.animateBackpack('shake');
    }
  }

  /**
   * Actualiza el contador visual
   */
  updateCounter() {
    if (!this.initialized) this.init();
    if (!this.bagCounter) return;
    
    const count = this.itemsInBag.length;
    anime({
      targets: this.bagCounter,
      scale: [1, 1.3, 1],
      duration: 300,
      easing: 'easeOutElastic(1, 0.5)'
    });

    this.bagCounter.textContent = count;

    // Cambiar color según cantidad
    const counterContainer = this.bagCounter.parentElement;
    if (count >= 8) {
      counterContainer.style.background = 'var(--success)';
    } else if (count >= 5) {
      counterContainer.style.background = 'var(--warning)';
    } else {
      counterContainer.style.background = 'var(--primary)';
    }
  }

  /**
   * Actualiza la preview de items dentro de la mochila
   */
  updatePreview() {
    if (!this.initialized) this.init();
    if (!this.itemsPreview) return;
    
    // Toggle empty state message
    if (this.emptyState) {
      this.emptyState.style.display = this.itemsInBag.length > 0 ? 'none' : 'block';
    }

    this.itemsPreview.innerHTML = '';

    this.itemsInBag.forEach((item, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'item-thumbnail';
      thumbnail.dataset.id = item.id; // Store item ID for removal
      thumbnail.dataset.category = item.category; // NEW: Store category for color coding
      thumbnail.title = item.name; // Tooltip
      thumbnail.tabIndex = 0;
      thumbnail.role = 'button';
      thumbnail.ariaLabel = `Quitar ${item.name} de la mochila`;
      thumbnail.innerHTML = `<img src="${item.icon}" alt="" aria-hidden="true" loading="lazy">`;
      thumbnail.style.opacity = '0';
      thumbnail.style.transform = 'scale(0)';
      
      this.itemsPreview.appendChild(thumbnail);

      // Animar entrada
      anime({
        targets: thumbnail,
        opacity: 1,
        scale: 1,
        delay: index * 50,
        duration: 300,
        easing: 'easeOutBack'
      });
    });
  }

  /**
   * Anima la mochila (shake, glow, etc.)
   */
  animateBackpack(type = 'glow') {
    if (!this.initialized) this.init();
    if (!this.backpackImg) return;
    
    if (type === 'glow') {
      this.backpackImg.classList.add('glow');
      setTimeout(() => this.backpackImg.classList.remove('glow'), 500);

      anime({
        targets: this.backpackImg,
        scale: [1, 1.05, 1],
        duration: 400,
        easing: 'easeOutElastic(1, 0.5)'
      });
    } else if (type === 'shake') {
      this.backpackImg.classList.add('shake');
      setTimeout(() => this.backpackImg.classList.remove('shake'), 500);
    }
  }

  /**
   * Anima confetti cuando se completa el objetivo
   */
  celebrateSuccess() {
    if (!this.initialized) this.init();
    if (!this.backpackImg) return;
    
    // Usar canvas-confetti
    if (window.confetti) {
      const backpackRect = this.backpackImg.getBoundingClientRect();
      const x = (backpackRect.left + backpackRect.width / 2) / window.innerWidth;
      const y = (backpackRect.top + backpackRect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#16A34A', '#FBBF24', '#3B82F6']
      });
    }

    // Animar mochila
    anime({
      targets: this.backpackImg,
      rotate: [0, -10, 10, -10, 10, 0],
      scale: [1, 1.1, 1],
      duration: 800,
      easing: 'easeInOutQuad'
    });
  }

  /**
   * Limpia la bolsa
   */
  clearBag() {
    if (!this.initialized) this.init();
    
    anime({
      targets: '.item-thumbnail',
      opacity: 0,
      scale: 0,
      duration: 300,
      delay: anime.stagger(50),
      complete: () => {
        this.itemsInBag = [];
        this.updateCounter();
        this.itemsPreview.innerHTML = '';
        if (this.emptyState) this.emptyState.style.display = 'block';
      }
    });
  }

  /**
   * Obtiene los items actuales en la bolsa
   */
  getItems() {
    return this.itemsInBag;
  }
}

// Exportar instancia singleton
export const bagAnimator = new BagAnimator();
