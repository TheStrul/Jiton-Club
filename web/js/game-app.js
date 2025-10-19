// Integrated Game Recorder Application Controller
class GameRecorderApp {
  constructor() {
    this.dataService = DataServiceFactory.create();
    this.gameData = {}; // { playerId: { player, rebuyType, payment, position, playing } }
    this.nextGuestId = 1001;
    this.players = [];
    
    this.init();
  }
  
  async init() {
    try {
      // Initialize UI text from resources
      this.initializeUIText();
      
      // Set current date
      this.updateDateDisplay();
      
      // Load players
      await this.loadPlayers();
      
      // Initialize game data for all players
      this.initializeGameData();
      
      // Load saved game data
      this.loadFromStorage();
      
      // Render initial state
      this.renderPlayers();
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
      document.title = Resources.get('titles.gameRecorder');
      const pageTitle = DOM.$('pageTitle');
      if (pageTitle) pageTitle.textContent = `${Resources.icon('game')} ${Resources.get('titles.gameRecorder')} ${Resources.icon('game')}`;
      
      const summaryTitle = DOM.$('summaryTitle');
      if (summaryTitle) summaryTitle.textContent = `${Resources.icon('stats')} ${Resources.get('titles.gameSummary')}`;
      
      const totalPlayersLabel = DOM.$('totalPlayersLabel');
      if (totalPlayersLabel) totalPlayersLabel.textContent = Resources.get('labels.totalPlayers');
      
      const totalMoneyLabel = DOM.$('totalMoneyLabel');
      if (totalMoneyLabel) totalMoneyLabel.textContent = Resources.get('labels.totalMoney');
      
      const selectAllBtn = DOM.$('selectAllBtn');
      if (selectAllBtn) selectAllBtn.textContent = `${Resources.icon('check')} ${Resources.get('buttons.selectAll')}`;
      
      const clearAllBtn = DOM.$('clearAllBtn');
      if (clearAllBtn) clearAllBtn.textContent = `${Resources.icon('cross')} ${Resources.get('buttons.clearAll')}`;
      
      const addGuestBtn = DOM.$('addGuestBtn');
      if (addGuestBtn) addGuestBtn.textContent = `${Resources.icon('plus')} ${Resources.get('buttons.addGuest')}`;
      
      const saveBtn = DOM.$('saveBtn');
      if (saveBtn) saveBtn.textContent = `${Resources.icon('check')} ${Resources.get('buttons.finished')}`;
      
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
  
  initializeGameData() {
    // Initialize all club members with default values
    this.players.forEach(player => {
      this.gameData[player.id] = {
        player: player,
        playing: false,
        rebuyType: 'none',
        payment: 200,
        position: ''
      };
    });
  }
  
  setupEventListeners() {
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
      const playingPlayers = Object.values(this.gameData).filter(p => p.playing);
      if (playingPlayers.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
  
  addGuest() {
    this.openGuestModal();
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
    if (modal) modal.classList.remove('active');
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
    
    // Add to game data
    this.gameData[guestId] = {
      player: guestPlayer,
      playing: true, // Auto-select guest
      rebuyType: 'none',
      payment: 200,
      position: ''
    };
    
    this.closeGuestModal();
    this.autoSave();
    this.renderPlayers();
    this.updateSummary();
    
    UI.showMessage(Resources.get('messages.guestAdded', { name: guestName }), 'success');
  }
  
  togglePlayer(playerId) {
    if (this.gameData[playerId]) {
      this.gameData[playerId].playing = !this.gameData[playerId].playing;
      
      // Reset values when unchecked
      if (!this.gameData[playerId].playing) {
        this.gameData[playerId].rebuyType = 'none';
        this.gameData[playerId].payment = 200;
        this.gameData[playerId].position = '';
      }
      
      this.autoSave();
      this.renderPlayers();
      this.updateSummary();
    }
  }
  
  updateRebuyType(playerId, type) {
    if (this.gameData[playerId]) {
      this.gameData[playerId].rebuyType = type;
      
      // Update payment based on rebuy type
      if (type === 'house') {
        this.gameData[playerId].payment = 200; // Only buy-in, no rebuy cost
      } else if (type === 'none') {
        this.gameData[playerId].payment = 200;
      } else {
        this.gameData[playerId].payment = 400; // Buy-in + rebuy
      }
      
      this.autoSave();
      this.updateSummary();
    }
  }
  
  updatePayment(playerId, value) {
    if (this.gameData[playerId]) {
      this.gameData[playerId].payment = parseInt(value) || 0;
      this.autoSave();
      this.updateSummary();
    }
  }
  
  updatePosition(playerId, value) {
    if (this.gameData[playerId]) {
      this.gameData[playerId].position = value ? parseInt(value) : '';
      this.autoSave();
    }
  }
  
  removeGuest(guestId) {
    if (UI.confirm(Resources.get('confirmations.removeGuest'))) {
      delete this.gameData[guestId];
      this.autoSave();
      this.renderPlayers();
      this.updateSummary();
    }
  }
  
  selectAll() {
    Object.keys(this.gameData).forEach(id => {
      this.gameData[id].playing = true;
    });
    this.autoSave();
    this.renderPlayers();
    this.updateSummary();
  }
  
  clearAll() {
    if (UI.confirm(Resources.get('confirmations.clearAll'))) {
      Object.keys(this.gameData).forEach(id => {
        if (this.gameData[id].player.isGuest) {
          delete this.gameData[id];
        } else {
          this.gameData[id].playing = false;
          this.gameData[id].rebuyType = 'none';
          this.gameData[id].payment = 200;
          this.gameData[id].position = '';
        }
      });
      localStorage.removeItem(CONFIG.storage.gameData);
      this.renderPlayers();
      this.updateSummary();
    }
  }
  
  renderPlayers() {
    const list = DOM.$('playersList');
    if (!list) return;
    
    DOM.clear(list);
    
    // Render club members
    this.players.forEach(player => {
      const data = this.gameData[player.id];
      if (data) {
        const card = this.createPlayerCard(data);
        list.appendChild(card);
      }
    });
    
    // Render guests
    Object.values(this.gameData).forEach(data => {
      if (data.player.isGuest) {
        const card = this.createPlayerCard(data, true);
        list.appendChild(card);
      }
    });
  }
  
  createPlayerCard(data, isGuest = false) {
    const player = data.player;
    const card = document.createElement('div');
    card.className = 'player-card' + (data.playing ? ' selected' : '');
    
    const removeBtn = isGuest ? `<button class="remove-guest-btn" data-player-id="${player.id}">${Resources.icon('trash')}</button>` : '';
    
    const rebuyOptions = data.playing ? this.createRebuyOptions(player.id, data.rebuyType) : '';
    const paymentInput = data.playing ? `
      <div class="input-box">
        <label>${Resources.get('labels.payment')}</label>
        <input type="number" 
               inputmode="numeric"
               value="${data.payment}" 
               step="50"
               min="0"
               data-player-id="${player.id}"
               data-field="payment"
               onclick="event.stopPropagation(); this.select()">
      </div>
    ` : '';
    
    const positionInput = data.playing ? `
      <div class="input-box">
        <label>${Resources.get('labels.position')}</label>
        <input type="number" 
               inputmode="numeric"
               value="${data.position}" 
               placeholder="${Resources.get('placeholders.positionPlaceholder')}"
               min="1"
               max="30"
               data-player-id="${player.id}"
               data-field="position"
               onclick="event.stopPropagation(); this.select()">
      </div>
    ` : '';
    
    card.innerHTML = `
      <div class="player-checkbox">
        <input type="checkbox" 
               id="check_${player.id}" 
               ${data.playing ? 'checked' : ''}
               data-player-id="${player.id}">
        <label for="check_${player.id}">${player.displayName}</label>
        ${removeBtn}
      </div>
      ${data.playing ? `
        <div class="player-details">
          <div class="rebuy-section">
            <label class="rebuy-label">${Resources.get('labels.rebuyType')}</label>
            <div class="rebuy-types">
              ${rebuyOptions}
            </div>
          </div>
          <div class="player-inputs">
            ${paymentInput}
            ${positionInput}
          </div>
        </div>
      ` : ''}
    `;
    
    // Attach event listeners
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        this.togglePlayer(player.id);
      });
    }
    
    const removeButton = card.querySelector('.remove-guest-btn');
    if (removeButton) {
      removeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeGuest(player.id);
      });
    }
    
    const rebuyRadios = card.querySelectorAll('input[name="rebuy_' + player.id + '"]');
    rebuyRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.updateRebuyType(player.id, e.target.value);
      });
    });
    
    const inputs = card.querySelectorAll('input[data-field]');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const playerId = e.target.dataset.playerId;
        const field = e.target.dataset.field;
        
        if (field === 'payment') {
          this.updatePayment(playerId, e.target.value);
        } else if (field === 'position') {
          this.updatePosition(playerId, e.target.value);
        }
      });
    });
    
    // Card click to toggle
    card.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'LABEL') {
        this.togglePlayer(player.id);
      }
    });
    
    return card;
  }
  
  createRebuyOptions(playerId, selectedType) {
    const types = ['none', 'regular', 'house', 'dotke'];
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
    const playingPlayers = Object.values(this.gameData).filter(p => p.playing);
    const totalPlayers = playingPlayers.length;
    const totalMoney = playingPlayers.reduce((sum, p) => sum + p.payment, 0);
    
    const totalPlayersEl = DOM.$('totalPlayers');
    const totalMoneyEl = DOM.$('totalMoney');
    
    if (totalPlayersEl) totalPlayersEl.textContent = totalPlayers;
    if (totalMoneyEl) totalMoneyEl.textContent = UI.formatCurrency(totalMoney);
  }
  
  autoSave() {
    if (!CONFIG.features.autoSave) return;
    
    const data = {
      gameData: Object.keys(this.gameData).map(key => {
        const entry = this.gameData[key];
        return {
          player: entry.player.toJSON(),
          playing: entry.playing,
          rebuyType: entry.rebuyType,
          payment: entry.payment,
          position: entry.position
        };
      }),
      nextGuestId: this.nextGuestId
    };
    
    StorageManager.save(CONFIG.storage.gameData, data);
  }
  
  loadFromStorage() {
    const data = StorageManager.load(CONFIG.storage.gameData, CONFIG.features.validateDates);
    
    if (data && data.gameData) {
      data.gameData.forEach(entry => {
        const player = new Player(entry.player);
        this.gameData[player.id] = {
          player: player,
          playing: entry.playing,
          rebuyType: entry.rebuyType,
          payment: entry.payment,
          position: entry.position
        };
      });
      
      this.nextGuestId = data.nextGuestId || 1001;
      UI.showMessage(Resources.get('messages.dataLoaded'), 'success', 2000);
    }
  }
  
  async saveGame() {
    const playingPlayers = Object.values(this.gameData).filter(p => p.playing);
    
    if (playingPlayers.length === 0) {
      UI.showMessage(Resources.get('errors.noPlayers'), 'error');
      return;
    }
    
    const btn = DOM.$('saveBtn');
    UI.setButtonLoading(btn, true);
    
    try {
      const gameRecord = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('he-IL'),
        players: playingPlayers.map(p => ({
          name: p.player.nickName,
          fullName: p.player.fullName,
          type: p.player.type,
          rebuyType: p.rebuyType,
          payment: p.payment,
          position: p.position || null
        })),
        summary: {
          totalPlayers: playingPlayers.length,
          totalMoney: playingPlayers.reduce((sum, p) => sum + p.payment, 0),
          members: playingPlayers.filter(p => p.player.isMember).length,
          guests: playingPlayers.filter(p => p.player.isGuest).length,
          rebuys: {
            none: playingPlayers.filter(p => p.rebuyType === 'none').length,
            regular: playingPlayers.filter(p => p.rebuyType === 'regular').length,
            house: playingPlayers.filter(p => p.rebuyType === 'house').length,
            dotke: playingPlayers.filter(p => p.rebuyType === 'dotke').length
          }
        }
      };
      
      // Save via data service
      await this.dataService.saveGame(gameRecord);
      
      // Format for WhatsApp
      const whatsappText = this.formatForWhatsApp(gameRecord);
      
      // Try to share
      const shared = await UI.share({
        title: Resources.get('titles.gameRecorder'),
        text: whatsappText
      });
      
      if (!shared) {
        UI.openWhatsApp(whatsappText);
      }
      
      UI.showMessage(Resources.get('messages.gameSaved'), 'success');
      
    } catch (error) {
      console.error('Failed to save game:', error);
      UI.showMessage('Failed to save: ' + error.message, 'error');
    } finally {
      UI.setButtonLoading(btn, false);
    }
  }
  
  formatForWhatsApp(gameRecord) {
    let text = `${Resources.icon('game')} *${Resources.get('titles.gameRecorder')} - ${gameRecord.date}*\n`;
    text += `? ${gameRecord.time}\n`;
    text += `${'='.repeat(30)}\n\n`;
    text += `?? *??"? ??????:* ${gameRecord.summary.totalPlayers}`;
    if (gameRecord.summary.guests > 0) {
      text += ` (${gameRecord.summary.members} ????? + ${gameRecord.summary.guests} ??????)`;
    }
    text += `\n`;
    text += `?? *??"? ???:* ${UI.formatCurrency(gameRecord.summary.totalMoney)}\n`;
    text += `?? *?????:* ????: ${gameRecord.summary.rebuys.regular}, ???: ${gameRecord.summary.rebuys.house}, ?????: ${gameRecord.summary.rebuys.dotke}\n\n`;
    text += `*????? ??????:*\n`;
    text += `${'-'.repeat(30)}\n`;
    
    gameRecord.players
      .sort((a, b) => (a.position || 999) - (b.position || 999))
      .forEach((player, index) => {
        const num = player.position ? `${Resources.icon('trophy')}${player.position}` : `${index + 1}.`;
        const guestMarker = player.type === 'guest' ? ` ${Resources.icon('guest')}` : '';
        const rebuyMarker = player.rebuyType !== 'none' ? ` [${Resources.get(`rebuyTypes.${player.rebuyType}`)}]` : '';
        text += `${num} ${player.name}${guestMarker}${rebuyMarker} - ${UI.formatCurrency(player.payment)}\n`;
      });
    
    return text;
  }
}

// Global app instance
let app;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Initializing Game Recorder App...');
    app = new GameRecorderApp();
    
    // Expose functions to window for inline onclick handlers
    window.addGuest = () => app.addGuest();
    window.confirmGuest = () => app.confirmGuest();
    window.closeGuestModal = () => app.closeGuestModal();
    window.selectAll = () => app.selectAll();
    window.clearAll = () => app.clearAll();
    window.saveGame = () => app.saveGame();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    alert('Failed to initialize app. Check console for details.');
  }
});
