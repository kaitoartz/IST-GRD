import { state, addToBag, removeFromBag, CONFIG, getItemCategory, addTime } from '../core/state.js';
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

    // Feature: Extra Time Item Interaction
    if (itemId === 'time_extra') {
      const added = addTime(CONFIG.TIME.BONUS_ITEM_SECONDS);
      UI.playSound('success'); // Bonus SFX
      UI.pulseTimer?.();
      UI.showFeedback('¡TIEMPO EXTRA!', `+${CONFIG.TIME.BONUS_ITEM_SECONDS} segundos (total ${added})`, 'success');
      const backpackImg = document.getElementById('backpack-img');
      UI.showTimeBonus(CONFIG.TIME.BONUS_ITEM_SECONDS, backpackImg ? backpackImg.getBoundingClientRect() : card.getBoundingClientRect());

      // Marcar que se reclamó el bonus de tiempo para esta ronda
      state.timeBonusCollected = true;

      // Remove from UI immediately
      card.style.opacity = '0';
      card.style.pointerEvents = 'none';

      // Also remove from state.roundItems so it doesn't reappear on re-render
      state.roundItems = state.roundItems.filter(i => i.id !== 'time_extra');
      return; // Early return for time_extra items
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

      // Score micro-feedback
      const deltas = { E: CONFIG.POINTS.E, R: CONFIG.POINTS.R, N: CONFIG.POINTS.N };
      const backpackImg = document.getElementById('backpack-img');
      UI.showScorePopup(deltas[itemCategory] || 0, backpackImg ? backpackImg.getBoundingClientRect() : card.getBoundingClientRect(), itemCategory);

      UI.playSound('pop');
      
      let title = '¡Agregado!';
      let type = 'success';
      if (itemCategory === 'R') {
         title = 'Recomendado';
         type = 'info';
      } else if (itemCategory === 'N') {
         title = 'No Prioritario';
         type = 'warning';
         UI.shakeTimer?.();
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
  
  // Bag Events
  bagPreview.addEventListener('click', (e) => handleBagAction(e.target));
}