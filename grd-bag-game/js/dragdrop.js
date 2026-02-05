import { state, addToBag, removeFromBag, CONFIG } from './state.js';
import * as UI from './ui.js';

let sortableTray = null;
let sortableBag = null;

export function initDragDrop() {
  const trayEl = document.getElementById('tray-list');
  const bagEl = document.getElementById('bag-list');

  // Source
  sortableTray = new Sortable(trayEl, {
    group: { name: 'shared', pull: 'clone', put: false },
    sort: false,
    animation: 200,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    onStart: () => {
       document.querySelector('.backpack-bg').style.transform = 'scale(1.02)';
       document.querySelector('.backpack-bg').style.transition = 'transform 0.3s';
    },
    onEnd: () => {
       document.querySelector('.backpack-bg').style.transform = 'scale(1)';
    }
  });

  // Target
  sortableBag = new Sortable(bagEl, {
    group: { name: 'shared', put: true },
    animation: 200,
    onAdd: function (evt) {
      const itemEl = evt.item;
      const itemId = itemEl.dataset.id;
      const result = addToBag(itemId);
      
      itemEl.remove(); // Always sync from state

      if (result.success) {
        UI.playSound('pop');
        const item = state.items.find(i => i.id === itemId);
        
        let title = '¡Agregado!';
        let msg = item.name;
        let type = 'success';
        
        if (item.category === 'R') {
           title = 'Ten cuidado';
           msg = 'Es útil, pero ocupa espacio.';
           type = 'info';
        } else if (item.category === 'N') {
           title = 'No recomendado';
           msg = 'Esto no es prioridad.';
           type = 'warning';
        }

        UI.showFeedback(title, msg, type);
        UI.renderTray(state.items);
        UI.renderBag(state.items);
        
      } else {
        UI.playSound('error');
        if (result.reason === 'full') {
          UI.showFeedback('¡Bolso Lleno!', 'No tienes más espacio.', 'error');
          document.querySelector('.col-bag').classList.add('shake'); // Apply shake to container
          setTimeout(() => document.querySelector('.col-bag').classList.remove('shake'), 500);
        } else if (result.reason === 'duplicate') {
          UI.showFeedback('Repetido', 'Ya tienes este ítem.', 'warning');
        }
      }
    }
  });
}

export function setupClickHandlers() {
  // Same logic, updated feedback calls
  document.getElementById('tray-list').addEventListener('click', (e) => {
    const card = e.target.closest('.item-card');
    if (!card) return;
    
    const itemId = card.dataset.id;
    // Prevent clicking disabled items
    if(state.bag.includes(itemId)) return;

    const result = addToBag(itemId);

    if (result.success) {
      UI.playSound('pop');
      const item = state.items.find(i => i.id === itemId);
      UI.showFeedback('Agregado', item.name, 'success');
      UI.renderTray(state.items);
      UI.renderBag(state.items);
    } else {
       UI.playSound('error');
       if (result.reason === 'full') UI.showFeedback('Error', 'Bolso lleno.', 'error');
       else if (result.reason === 'duplicate') UI.showFeedback('Atención', 'Ya lo tienes.', 'warning');
    }
  });

  document.getElementById('bag-list').addEventListener('click', (e) => {
    const card = e.target.closest('.item-card');
    if (!card) return;
    
    UI.playSound('pop'); // Or a 'woosh' sound
    removeFromBag(card.dataset.id);
    UI.showFeedback('Removido', 'Espacio liberado.', 'info');
    UI.renderTray(state.items);
    UI.renderBag(state.items);
  });
}