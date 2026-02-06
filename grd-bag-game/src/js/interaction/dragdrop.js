import { state, addToBag, removeFromBag, CONFIG, getItemCategory } from '../core/state.js';
import * as UI from '../ui/ui.js';
import { bagAnimator } from '../ui/bagAnimation.js';

export function setupClickHandlers() {
  const trayList = document.getElementById('tray-list');
  const bagPreview = document.getElementById('bag-items-preview');
  let pendingReplacement = null;

  if (!trayList || !bagPreview) return;

  const clearReplacement = () => {
    pendingReplacement = null;
    bagPreview.classList.remove('replace-mode');
  };

  const handleTrayAction = async (target) => {
    const card = target.closest('.item-card');
    if (!card) return;
    
    const itemId = card.dataset.id;
    // Prevent clicking disabled items
    if(state.bag.includes(itemId)) return;

    if (state.bag.length >= CONFIG.SLOTS_MAX) {
      pendingReplacement = { itemId, card };
      bagPreview.classList.add('replace-mode');
      UI.playSound('error');
      UI.showFeedback('Bolso lleno', 'Elige un ítem para reemplazar.', 'warning');
      UI.triggerScreenShake();
      bagAnimator.animateBackpack('shake');
      return;
    }

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

      if (itemCategory === 'E') {
        bagAnimator.emitCriticalSuccess();
      }

      // Check if completed
      if (state.bag.length === CONFIG.SLOTS_MAX) {
        bagAnimator.celebrateSuccess();
      }
    } else {
       UI.playSound('error');
       if (result.reason === 'full') {
         UI.showFeedback('Error', 'Bolso lleno.', 'error');
         bagAnimator.animateBackpack('shake');
         UI.triggerScreenShake();
        }
        else if (result.reason === 'duplicate') {
          UI.showFeedback('Atención', 'Ya lo tienes.', 'warning');
          UI.triggerScreenShake();
        }
    }
  };

  const handleBagAction = async (target) => {
    const thumbnail = target.closest('.item-thumbnail');
    if (!thumbnail) return;
    
    const itemId = thumbnail.dataset.id;
    if (!itemId) return;

    if (pendingReplacement) {
      const { itemId: newItemId, card } = pendingReplacement;
      clearReplacement();

      removeFromBag(itemId);
      bagAnimator.removeItemFromBag(itemId);
      UI.renderTray(state.roundItems || state.items);

      const result = addToBag(newItemId);
      if (result.success) {
        const item = state.items.find(i => i.id === newItemId);
        const itemCategory = getItemCategory(newItemId, state.currentScenario);
        await bagAnimator.animateClickToBag(card, {
          id: item.id,
          name: item.name,
          icon: item.icon,
          category: itemCategory
        });
        UI.playSound('pop');
        UI.showFeedback('Reemplazado', item.feedback || item.name, 'info');
        UI.renderTray(state.roundItems || state.items);
        if (itemCategory === 'E') {
          bagAnimator.emitCriticalSuccess();
        }
      }
      return;
    }
    
    UI.playSound('pop');
    removeFromBag(itemId);
    bagAnimator.removeItemFromBag(itemId);
    UI.showFeedback('Removido', 'Espacio liberado.', 'info');
    UI.renderTray(state.roundItems || state.items);
  };

  // Tray Events
  trayList.addEventListener('click', (e) => handleTrayAction(e.target));
  
  // Bag Events
  bagPreview.addEventListener('click', (e) => handleBagAction(e.target));
}
