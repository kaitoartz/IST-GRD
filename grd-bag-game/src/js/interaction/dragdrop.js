import { state, addToBag, removeFromBag, CONFIG, getItemCategory } from '../core/state.js';
import * as UI from '../ui/ui.js';
import { bagAnimator } from '../ui/bagAnimation.js';

export function setupClickHandlers() {
  const trayList = document.getElementById('tray-list');
  const bagPreview = document.getElementById('bag-items-preview');

  if (!trayList || !bagPreview) return;

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
      
      // Eliminar del tray para efecto reflow
      const itemIndex = state.roundItems.findIndex(i => i.id === itemId);
      if (itemIndex !== -1) {
        state.roundItems.splice(itemIndex, 1);
      }
      
      // Lanzamos la animación de vuelo ANTES de re-renderizar el tray
      // para que el elemento original siga ahí para el clon
      await bagAnimator.animateClickToBag(card, {
        id: item.id,
        name: item.name,
        icon: item.icon,
        category: itemCategory
      });

      // Ahora re-renderizamos el tray sin el item
      UI.renderTray(state.roundItems);
      UI.updateHUD(); // Actualizar contador de vitales

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
    
    // Devolver al tray
    const item = state.items.find(i => i.id === itemId);
    if (item && !state.roundItems.find(i => i.id === itemId)) {
      state.roundItems.push(item);
    }
    
    bagAnimator.removeItemFromBag(itemId);
    UI.showFeedback('Removido', 'Espacio liberado.', 'info');
    UI.renderTray(state.roundItems);
    UI.updateHUD(); // Actualizar contador de vitales
  };

  // Tray Events
  trayList.addEventListener('click', (e) => handleTrayAction(e.target));
  
  // Bag Events
  bagPreview.addEventListener('click', (e) => handleBagAction(e.target));
}
