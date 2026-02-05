import { state, addToBag, removeFromBag, CONFIG, getItemCategory } from '../core/state.js';
import * as UI from '../ui/ui.js';
import { bagAnimator } from '../ui/bagAnimation.js';

let sortableTray = null;
let sortableBag = null;

export function initDragDrop() {
  const trayEl = document.getElementById('tray-list');
  const bagEl = document.getElementById('bag-items-preview'); // Cambio: ahora usamos bag-items-preview

  // Guard: elementos no existen aún
  if (!trayEl || !bagEl) {
    console.warn('initDragDrop: tray-list or bag-items-preview not found, skipping initialization');
    return;
  }

  // Source
  sortableTray = new Sortable(trayEl, {
    group: { name: 'shared', pull: 'clone', put: false },
    sort: false,
    animation: 200,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    onStart: () => {
       document.querySelector('.backpack-visual').style.transform = 'scale(1.05)';
       document.querySelector('.backpack-visual').style.transition = 'transform 0.3s';
    },
    onEnd: () => {
       document.querySelector('.backpack-visual').style.transform = 'scale(1)';
    }
  });

  // Target - now uses visual backpack with animation
  sortableBag = new Sortable(bagEl, {
    group: { name: 'shared', put: true },
    animation: 200,
    onAdd: async function (evt) {
      const itemEl = evt.item;
      const itemId = itemEl.dataset.id;
      const item = state.items.find(i => i.id === itemId);
      
      // Check if can add before animation
      const result = addToBag(itemId);
      
      if (result.success) {
        // Animación específica para Drag & Drop (encoger en el sitio)
        const itemCategory = getItemCategory(itemId, state.currentScenario);
        
        await bagAnimator.animateDropToBag(itemEl, {
          id: item.id,
          name: item.name,
          icon: item.icon,
          category: itemCategory
        });
        
        UI.playSound('pop');
        
        // Show educational feedback from items.json
        let title = '¡Agregado!';
        let type = 'success';
        
        if (itemCategory === 'R') {
           title = 'Recomendado';
           type = 'info';
        } else if (itemCategory === 'N') {
           title = 'No Prioritario';
           type = 'warning';
        }

        UI.showFeedback(title, item.feedback || item.name, type);
        UI.renderTray(state.roundItems || state.items);
        
        // Check if completed
        if (state.bag.length === CONFIG.SLOTS_MAX) {
          bagAnimator.celebrateSuccess();
        }
        
      } else {
        UI.playSound('error');
        if (result.reason === 'full') {
          UI.showFeedback('¡Bolso Lleno!', 'No tienes más espacio.', 'error');
          bagAnimator.animateBackpack('shake');
        } else if (result.reason === 'duplicate') {
          UI.showFeedback('Repetido', 'Ya tienes este ítem.', 'warning');
        }
      }
      
      itemEl.remove(); // Clean up sortable clone after animation
    }
  });
}

export function setupClickHandlers() {
  const trayList = document.getElementById('tray-list');
  const bagPreview = document.getElementById('bag-items-preview');

  const handleTrayAction = async (target) => {
    const card = target.closest('.item-card');
    if (!card) return;
    
    const itemId = card.dataset.id;
    // Prevent clicking disabled items
    if(state.bag.includes(itemId)) return;

    const result = addToBag(itemId);

    if (result.success) {
      const item = state.items.find(i => i.id === itemId);
      const itemCategory = getItemCategory(itemId, state.currentScenario);
      
      // Primero actualizamos el tray para mostrar el estado "ghost"
      UI.renderTray(state.roundItems || state.items);
      
      // Lanzamos la animación de vuelo
      await bagAnimator.animateClickToBag(card, {
        id: item.id,
        name: item.name,
        icon: item.icon,
        category: itemCategory
      });

      UI.playSound('pop');
      
      let title = '¡Agregado!';
      let type = 'success';
      if (itemCategory === 'R') {
         title = 'Recomendado';
         type = 'info';
      } else if (itemCategory === 'N') {
         title = 'No Prioritario';
         type = 'warning';
      }
      
      UI.showFeedback(title, item.feedback || item.name, type);

      // Check if completed
      if (state.bag.length === CONFIG.SLOTS_MAX) {
        bagAnimator.celebrateSuccess();
      }
    } else {
       UI.playSound('error');
       if (result.reason === 'full') {
         UI.showFeedback('Error', 'Bolso lleno.', 'error');
         bagAnimator.animateBackpack('shake');
       }
       else if (result.reason === 'duplicate') UI.showFeedback('Atención', 'Ya lo tienes.', 'warning');
    }
  };

  const handleBagAction = (target) => {
    const thumbnail = target.closest('.item-thumbnail');
    if (!thumbnail) return;
    
    const itemId = thumbnail.dataset.id;
    if (!itemId) return;
    
    UI.playSound('pop');
    removeFromBag(itemId);
    bagAnimator.removeItemFromBag(itemId);
    UI.showFeedback('Removido', 'Espacio liberado.', 'info');
    UI.renderTray(state.roundItems || state.items);
  };

  // Tray Events
  trayList.addEventListener('click', (e) => handleTrayAction(e.target));
  trayList.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTrayAction(e.target);
    }
  });

  // Bag Events
  bagPreview.addEventListener('click', (e) => handleBagAction(e.target));
  bagPreview.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBagAction(e.target);
    }
  });
}