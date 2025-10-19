// Rebuy Recorder Application Controller
class RebuyRecorderApp {
  constructor() {
    this.dataService = DataServiceFactory.create();
    this.rebuyData = {}; // { playerId: Rebuy }
    this.nextGuestId = 1001;
    this.players = [];
    
    this.init();
  }
  
  async init() {
    try {
      // Initialize UI text from resources FIRST
      this.initializeUIText();
      
      // Set current date
      this.updateDateDisplay();
      
      // Load players
      await this.loadPlayers();
      
      // Populate player selector
      this.populatePlayerSelect();
      
      // Load saved rebuy data
      this.loadFromStorage();
      
      // Render initial state
      this.renderRebuyList();
      this.updateSummary();
      
      // Setup event listeners
      this.setupEventListeners();
      
    } catch (error) {
      console.error('Initialization failed:', error);
      UI.showMessage('Failed to initialize app: ' + error.message, 'error');
    }
  }
  
  initializeUIText() {
    try {
      // Set all text content from resources
      document.title = Resources.get('titles.rebuyRecorder');
      const pageTitle = DOM.$('pageTitle');
      if (pageTitle) pageTitle.textContent = `${Resources.icon('game')} ${Resources.get('titles.rebuyRecorder')} ${Resources.icon('game')}`;
      
      const summaryTitle = DOM.$('summaryTitle');
      if (summaryTitle) summaryTitle.textContent = `${Resources.icon('stats')} ${Resources.get('titles.rebuySummary')}`;
      
      const totalRebuysLabel = DOM.$('totalRebuysLabel');
      if (totalRebuysLabel) totalRebuysLabel.textContent = Resources.get('labels.totalRebuys');
      
      const rebuyBreakdownLabel = DOM.$('rebuyBreakdownLabel');
      if (rebuyBreakdownLabel) rebuyBreakdownLabel.textContent = Resources.get('labels.rebuyBreakdown');
      
      const rebuyListTitle = DOM.$('rebuyListTitle');
      if (rebuyListTitle) rebuyListTitle.textContent = `${Resources.icon('money')} ${Resources.get('sections.rebuyListTitle')}`;
      
      const selectPlayerOption = DOM.$('selectPlayerOption');
      if (selectPlayerOption) selectPlayerOption.textContent = Resources.get('placeholders.selectPlayer');
      
      const newGuestOption = DOM.$('newGuestOption');
      if (newGuestOption) newGuestOption.textContent = `${Resources.icon('guest')} ${Resources.get('placeholders.newGuest')}`;
      
      const addPlayerBtn = DOM.$('addPlayerBtn');
      if (addPlayerBtn) addPlayerBtn.textContent = Resources.get('buttons.addToList');
      
      const saveBtn = DOM.$('saveBtn');
      if (saveBtn) saveBtn.textContent = `${Resources.icon('check')} ${Resources.get('buttons.continueToResults')}`;
      
      // Modal
      const modalTitle = DOM.$('modalTitle');
      if (modalTitle) modalTitle.textContent = `${Resources.icon('guest')} ${Resources.get('buttons.addGuest')}`;
      
      const guestNameInput = DOM.$('guestNameInput');
      if (guestNameInput) guestNameInput.placeholder = Resources.get('placeholders.enterGuestName');
      
      const confirmBtn = DOM.$$('.modal-btn.confirm');
      if (confirmBtn) confirmBtn.textContent = Resources.get('buttons.confirm');
      
      const cancelBtn = DOM.$$('.modal-btn.cancel');
      if (cancelBtn) cancelBtn.textContent = Resources.get('buttons.cancel');
    } catch (error) {
      console.error('Failed to initialize UI text:', error);
    }
  }
  
  updateDateDisplay() {
    const dateElement = DOM.$('currentDate');
    if (dateElement) {
      dateElement.textContent = UI.formatDate(new Date());
    }
  }
  
  async loadPlayers() {
    try {
      const playersData = await this.dataService.getPlayers();
      this.players = playersData.map(p => new Player(p));
    } catch (error) {
      console.error('Failed to load players:', error);
      this.players = [];
    }
  }
  
  populatePlayerSelect() {
    const select = DOM.$('playerSelect');
    if (!select) return;
    
    // Clear existing options except first two
    while (select.options.length > 2) {
      select.remove(2);
    }
    
    // Add club members
    this.players.forEach(player => {
      const option = document.createElement('option');
      option.value = player.id;
      option.textContent = player.nickName;
      select.appendChild(option);
    });
  }
  
  setupEventListeners() {
    // Player select change
    const select = DOM.$('playerSelect');
    if (select) {
      select.addEventListener('change', () => {
        const addBtn = DOM.$('addPlayerBtn');
        if (addBtn) {
          addBtn.disabled = !select.value;
        }
      });
    }
    
    // Enter key in guest modal
    const guestInput = DOM.$('guestNameInput');
    if (guestInput) {
      guestInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.confirmGuest();
        }
      });
    }
    
    // Prevent accidental page refresh
    window.addEventListener('beforeunload', (e) => {
      if (Object.keys(this.rebuyData).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
  
  addPlayerToRebuyList() {
    const select = DOM.$('playerSelect');
    if (!select || !select.value) {
      UI.showMessage(Resources.get('errors.noPlayerSelected'), 'error');
      return;
    }
    
    const selectedValue = select.value;
    
    // Handle guest selection
    if (selectedValue === 'guest') {
      this.openGuestModal();
      return;
    }
    
    const playerId = parseInt(selectedValue);
    
    // Check if already in list
    if (this.rebuyData[playerId]) {
      UI.showMessage(Resources.get('errors.playerAlreadyInList'), 'error');
      return;
    }
    
    // Find player
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;
    
    // Add rebuy
    const rebuy = new Rebuy(player, CONFIG.defaults.rebuyType);
    this.rebuyData[playerId] = rebuy;
    
    // Reset select
    select.value = '';
    const addBtn = DOM.$('addPlayerBtn');
    if (addBtn) addBtn.disabled = true;
    
    // Update UI
    this.autoSave();
    this.renderRebuyList();
    this.updateSummary();
    
    UI.showMessage(Resources.get('messages.playerAdded', { name: player.nickName }), 'success');
  }
  
  openGuestModal() {
    const modal = DOM.$('guestModal');
    const input = DOM.$('guestNameInput');
    
    if (modal && input) {
      modal.classList.add('active');
      input.value = '';
      setTimeout(() => input.focus(), 100);
    }
  }
  
  closeGuestModal() {
    const modal = DOM.$('guestModal');
    const select = DOM.$('playerSelect');
    const addBtn = DOM.$('addPlayerBtn');
    
    if (modal) modal.classList.remove('active');
    if (select) select.value = '';
    if (addBtn) addBtn.disabled = true;
  }
  
  confirmGuest() {
    const input = DOM.$('guestNameInput');
    if (!input) return;
    
    const guestName = input.value.trim();
    
    if (!guestName) {
      UI.showMessage(Resources.get('errors.noGuestName'), 'error');
      return;
    }
    
    // Create guest player
    const guestId = `guest_${this.nextGuestId++}`;
    const guestPlayer = Player.createGuest(guestName, guestId);
    
    // Add rebuy
    const rebuy = new Rebuy(guestPlayer, CONFIG.defaults.rebuyType);
    this.rebuyData[guestId] = rebuy;
    
    this.closeGuestModal();
    this.autoSave();
    this.renderRebuyList();
    this.updateSummary();
    
    UI.showMessage(Resources.get('messages.guestAdded', { name: guestName }), 'success');
  }
  
  updateRebuyType(playerId, type) {
    if (this.rebuyData[playerId]) {
      this.rebuyData[playerId].type = type;
      this.autoSave();
      this.updateSummary();
    }
  }
  
  removeFromRebuyList(playerId) {
    if (UI.confirm(Resources.get('confirmations.removePlayer'))) {
      delete this.rebuyData[playerId];
      this.autoSave();
      this.renderRebuyList();
      this.updateSummary();
    }
  }
  
  renderRebuyList() {
    const list = DOM.$('rebuyList');
    if (!list) return;
    
    const entries = Object.values(this.rebuyData);
    
    if (entries.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${Resources.icon('empty')}</div>
          <div>${Resources.get('emptyStates.noRebuys')}</div>
        </div>
      `;
      return;
    }
    
    DOM.clear(list);
    entries.forEach(rebuy => {
      const item = this.createRebuyItem(rebuy);
      list.appendChild(item);
    });
  }
  
  createRebuyItem(rebuy) {
    const player = rebuy.player;
    const div = document.createElement('div');
    div.className = 'rebuy-item';
    
    const nameClass = player.isGuest ? 'guest' : '';
    
    div.innerHTML = `
      <div class="rebuy-header">
        <div class="rebuy-player-name ${nameClass}">${player.displayName}</div>
        <button class="remove-btn" data-player-id="${player.id}">${Resources.icon('trash')}</button>
      </div>
      <div class="rebuy-types">
        ${this.createRebuyTypeOptions(player.id, rebuy.type)}
      </div>
    `;
    
    // Attach event listeners
    const removeBtn = div.querySelector('.remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => this.removeFromRebuyList(player.id));
    }
    
    const radioButtons = div.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.updateRebuyType(player.id, e.target.value);
      });
    });
    
    return div;
  }
  
  createRebuyTypeOptions(playerId, selectedType) {
    const types = Rebuy.getValidTypes();
    return types.map(type => `
      <div class="rebuy-type-option">
        <input type="radio" 
               id="${type}_${playerId}" 
               name="rebuy_${playerId}" 
               value="${type}"
               ${selectedType === type ? 'checked' : ''}>
        <label class="rebuy-type-label" for="${type}_${playerId}">
          ${Resources.icon(type)} ${Resources.get(`rebuyTypes.${type}`)}
        </label>
      </div>
    `).join('');
  }
  
  updateSummary() {
    const entries = Object.values(this.rebuyData);
    const totalRebuys = entries.length;
    
    const regular = entries.filter(r => r.type === 'regular').length;
    const house = entries.filter(r => r.type === 'house').length;
    const dotke = entries.filter(r => r.type === 'dotke').length;
    
    const totalRebuysEl = DOM.$('totalRebuys');
    const rebuyBreakdownEl = DOM.$('rebuyBreakdown');
    
    if (totalRebuysEl) totalRebuysEl.textContent = totalRebuys;
    if (rebuyBreakdownEl) rebuyBreakdownEl.textContent = `${regular}/${house}/${dotke}`;
  }
  
  autoSave() {
    if (!CONFIG.features.autoSave) return;
    
    const data = {
      rebuys: Object.keys(this.rebuyData).map(key => this.rebuyData[key].toJSON()),
      nextGuestId: this.nextGuestId
    };
    
    StorageManager.save(CONFIG.storage.rebuyData, data);
  }
  
  loadFromStorage() {
    const data = StorageManager.load(CONFIG.storage.rebuyData, CONFIG.features.validateDates);
    
    if (data && data.rebuys) {
      this.rebuyData = {};
      data.rebuys.forEach(rebuyData => {
        const rebuy = Rebuy.fromJSON(rebuyData);
        this.rebuyData[rebuy.player.id] = rebuy;
      });
      
      this.nextGuestId = data.nextGuestId || 1001;
      
      UI.showMessage(Resources.get('messages.dataLoaded'), 'success', 2000);
    }
  }
  
  async saveRebuys() {
    const entries = Object.values(this.rebuyData);
    
    if (entries.length === 0) {
      if (UI.confirm(Resources.get('confirmations.continueWithoutRebuys'))) {
        // TODO: Navigate to results page
        UI.showMessage(Resources.get('messages.rebuysSaved'), 'success');
        setTimeout(() => {
          alert('????? ????? ??? ????? ??????? (??????)');
        }, 1500);
      }
      return;
    }
    
    const btn = DOM.$$('.btn-primary');
    UI.setButtonLoading(btn, true);
    
    try {
      const rebuyRecord = {
        rebuys: entries.map(r => r.toJSON()),
        summary: {
          total: entries.length,
          regular: entries.filter(r => r.type === 'regular').length,
          house: entries.filter(r => r.type === 'house').length,
          dotke: entries.filter(r => r.type === 'dotke').length
        }
      };
      
      // Save via data service
      await this.dataService.saveRebuys(rebuyRecord);
      
      UI.showMessage(Resources.get('messages.rebuysSaved'), 'success');
      
      // TODO: Navigate to results recording page
      setTimeout(() => {
        alert('????? ????? ??? ????? ??????? (??????)');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save rebuys:', error);
      UI.showMessage('Failed to save: ' + error.message, 'error');
    } finally {
      UI.setButtonLoading(btn, false);
    }
  }
}

// Global app instance
let app;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Initializing Rebuy Recorder App...');
    app = new RebuyRecorderApp();
    
    // Expose functions to window for inline onclick handlers
    window.addPlayerToRebuyList = () => app.addPlayerToRebuyList();
    window.confirmGuest = () => app.confirmGuest();
    window.closeGuestModal = () => app.closeGuestModal();
    window.saveRebuys = () => app.saveRebuys();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    alert('Failed to initialize app. Check console for details.');
  }
});
