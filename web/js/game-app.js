// Simplified Game Recorder - Separate Rebuy/Score Lists
class GameRecorderApp {
  constructor() {
    this.dataService = DataServiceFactory.create();
    this.rebuys = []; // Array of { id, player, type, paid }
    this.scores = []; // Array of { id, player, position, paid }
    this.buyInAmount = 200;
    this.nextEntryId = 1;
    this.nextGuestId = 1001;
    this.players = [];
    this.editingEntryId = null; // Track which card is being edited
    
    this.init();
  }
  
  async init() {
    try {
      this.initializeUIText();
      this.updateDateDisplay();
      await this.loadPlayers();
      this.populateDropdowns();
      this.loadFromStorage();
      this.renderRebuys();
      this.renderScores();
      this.updateSummary();
      this.setupEventListeners();
    } catch (error) {
      console.error('Initialization failed:', error);
      UI.showMessage('Failed to initialize app: ' + error.message, 'error');
    }
  }
  
  initializeUIText() {
    try {
      document.title = Resources.get('titles.gameRecorder');
      DOM.$('pageTitle').textContent = `${Resources.icon('game')} ${Resources.get('titles.gameRecorder')} ${Resources.icon('game')}`;
      DOM.$('summaryTitle').textContent = `${Resources.icon('stats')} ${Resources.get('titles.gameSummary')}`;
      DOM.$('totalEntriesLabel').textContent = Resources.get('labels.totalEntries');
      DOM.$('totalPlayersLabel').textContent = Resources.get('labels.totalPlayers');
      DOM.$('totalMoneyLabel').textContent = Resources.get('labels.totalMoney');
      DOM.$('buyInLabel').textContent = Resources.get('labels.buyIn');
      DOM.$('rebuyListTitle').textContent = `${Resources.icon('money')} ${Resources.get('sections.rebuyListTitle')}`;
      DOM.$('scoreListTitle').textContent = `${Resources.icon('trophy')} ${Resources.get('sections.scoreListTitle')}`;
      DOM.$('playerSelectPlaceholder').textContent = Resources.get('placeholders.selectPlayer');
      DOM.$('addRebuyBtn').textContent = Resources.get('buttons.addRebuy');
      DOM.$('addScoreBtn').textContent = Resources.get('buttons.addScore');
      DOM.$('saveBtn').textContent = `${Resources.icon('check')} ${Resources.get('buttons.finished')}`;
      DOM.$('modalTitle').textContent = `${Resources.icon('guest')} ${Resources.get('buttons.addGuest')}`;
      DOM.$('guestNameInput').placeholder = Resources.get('placeholders.enterGuestName');
      DOM.$$('.modal-btn.confirm').textContent = Resources.get('buttons.confirm');
      DOM.$$('.modal-btn.cancel').textContent = Resources.get('buttons.cancel');
    } catch (error) {
      console.error('Failed to initialize UI text:', error);
    }
  }
  
  updateDateDisplay() {
    DOM.$('currentDate').textContent = UI.formatDate(new Date());
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
  
  populateDropdowns() {
    const select = DOM.$('playerSelect');
    
    if (select) {
      this.players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = player.nickName;
        select.appendChild(option);
      });
      
      // Add guest option
      const guestOption = document.createElement('option');
      guestOption.value = 'guest';
      guestOption.textContent = `${Resources.icon('guest')} ${Resources.get('placeholders.newGuest')}`;
      select.appendChild(guestOption);
    }
  }
  
  setupEventListeners() {
    const buyInInput = DOM.$('buyInAmount');
    const playerSelect = DOM.$('playerSelect');
    const addScoreBtn = DOM.$('addScoreBtn');
    const addRebuyBtn = DOM.$('addRebuyBtn');
    
    buyInInput.addEventListener('change', (e) => {
      this.buyInAmount = parseInt(e.target.value) || 200;
      this.autoSave();
      this.updateSummary();
    });
    
    DOM.$('guestNameInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.confirmGuest();
    });
    
    // Enable/disable action buttons based on player selection
    playerSelect.addEventListener('change', () => {
      const hasSelection = playerSelect.value !== '';
      addScoreBtn.disabled = !hasSelection;
      addRebuyBtn.disabled = !hasSelection;
    });
    
    // Initial state - buttons disabled
    addScoreBtn.disabled = true;
    addRebuyBtn.disabled = true;
  }
  
  addRebuy() {
    const select = DOM.$('playerSelect');
    if (!select || !select.value) {
      UI.showMessage(Resources.get('errors.noPlayerSelected'), 'error');
      return;
    }
    
    if (select.value === 'guest') {
      this.openGuestModal('rebuy');
      return;
    }
    
    const player = this.players.find(p => p.id === parseInt(select.value));
    if (!player) return;
    
    const entryId = this.nextEntryId++;
    this.rebuys.push({
      id: entryId,
      player: player,
      type: 'regular',
      paid: false
    });
    
    select.value = '';
    // Trigger change event to disable buttons
    select.dispatchEvent(new Event('change'));
    
    this.autoSave();
    this.renderRebuys();
    this.updateSummary();
    
    // Auto-expand newly added entry for editing
    setTimeout(() => this.toggleEditMode(entryId, 'rebuy'), 100);
    
    UI.showMessage(Resources.get('messages.rebuyAdded', { name: player.nickName }), 'success');
  }
  
  addScore() {
    const select = DOM.$('playerSelect');
    if (!select || !select.value) {
      UI.showMessage(Resources.get('errors.noPlayerSelected'), 'error');
      return;
    }
    
    if (select.value === 'guest') {
      this.openGuestModal('score');
      return;
    }
    
    const player = this.players.find(p => p.id === parseInt(select.value));
    if (!player) return;
    
    // Insert at the BEGINNING of the array (position 1)
    this.scores.unshift({
      id: this.nextEntryId++,
      player: player,
      paid: false
    });
    
    select.value = '';
    // Trigger change event to disable buttons
    select.dispatchEvent(new Event('change'));
    
    this.autoSave();
    this.renderScores();
    this.updateSummary();
    UI.showMessage(Resources.get('messages.scoreAdded', { name: player.nickName }), 'success');
  }
  
  openGuestModal(context) {
    const modal = DOM.$('guestModal');
    modal.dataset.context = context;
    modal.classList.add('active');
    DOM.$('guestNameInput').value = '';
    setTimeout(() => DOM.$('guestNameInput').focus(), 100);
  }
  
  closeGuestModal() {
    DOM.$('guestModal').classList.remove('active');
  }
  
  confirmGuest() {
    const input = DOM.$('guestNameInput');
    const guestName = input.value.trim();
    
    if (!guestName) {
      UI.showMessage(Resources.get('errors.noGuestName'), 'error');
      return;
    }
    
    const context = DOM.$('guestModal').dataset.context;
    const guestId = `guest_${this.nextGuestId++}`;
    const guestPlayer = Player.createGuest(guestName, guestId);
    
    if (context === 'rebuy') {
      const entryId = this.nextEntryId++;
      this.rebuys.push({
        id: entryId,
        player: guestPlayer,
        type: 'regular',
        paid: false
      });
      this.renderRebuys();
      setTimeout(() => this.toggleEditMode(entryId, 'rebuy'), 100);
    } else {
      // Insert guest score at the BEGINNING
      this.scores.unshift({
        id: this.nextEntryId++,
        player: guestPlayer,
        paid: false
      });
      this.renderScores();
    }
    
    this.closeGuestModal();
    this.autoSave();
    this.updateSummary();
    UI.showMessage(Resources.get('messages.guestAdded', { name: guestName }), 'success');
  }
  
  toggleEditMode(entryId, type) {
    if (this.editingEntryId === entryId) {
      this.editingEntryId = null;
    } else {
      this.editingEntryId = entryId;
    }
    
    if (type === 'rebuy') {
      this.renderRebuys();
    } else {
      this.renderScores();
    }
  }
  
  removeRebuy(entryId) {
    if (UI.confirm(Resources.get('confirmations.removeEntry'))) {
      this.rebuys = this.rebuys.filter(r => r.id !== entryId);
      this.editingEntryId = null;
      this.autoSave();
      this.renderRebuys();
      this.updateSummary();
    }
  }
  
  removeScore(entryId) {
    if (UI.confirm(Resources.get('confirmations.removeEntry'))) {
      this.scores = this.scores.filter(s => s.id !== entryId);
      this.autoSave();
      this.renderScores();
      this.updateSummary();
    }
  }
  
  updateRebuyType(entryId, type) {
    const rebuy = this.rebuys.find(r => r.id === entryId);
    if (rebuy) {
      rebuy.type = type;
      this.autoSave();
      this.renderRebuys();
    }
  }
  
  updateRebuyPaid(entryId, paid) {
    const rebuy = this.rebuys.find(r => r.id === entryId);
    if (rebuy) {
      rebuy.paid = paid;
      this.autoSave();
      this.updateSummary();
    }
  }
  
  updateSummary() {
    const totalEntries = this.rebuys.length + this.scores.length;
    const uniquePlayers = new Set([
      ...this.rebuys.map(r => r.player.id),
      ...this.scores.map(s => s.player.id)
    ]).size;
    const paidEntries = this.rebuys.filter(r => r.paid).length + this.scores.filter(s => s.paid).length;
    const totalMoney = paidEntries * this.buyInAmount;
    
    DOM.$('totalEntries').textContent = totalEntries;
    DOM.$('totalPlayers').textContent = uniquePlayers;
    DOM.$('totalMoney').textContent = UI.formatCurrency(totalMoney);
  }
  
  updateScorePosition(entryId, position) {
    const score = this.scores.find(s => s.id === entryId);
    if (score) {
      score.position = position ? parseInt(position) : '';
      this.autoSave();
    }
  }
  
  updateScorePaid(entryId, paid) {
    const score = this.scores.find(s => s.id === entryId);
    if (score) {
      score.paid = paid;
      this.autoSave();
      this.updateSummary();
    }
  }
  
  renderRebuys() {
    const list = DOM.$('rebuyList');
    const section = DOM.$('rebuySection');
    
    if (this.rebuys.length === 0) {
      section.classList.add('hidden');
      return;
    }
    
    section.classList.remove('hidden');
    DOM.clear(list);
    
    this.rebuys.forEach(rebuy => {
      const card = this.createRebuyCard(rebuy);
      list.appendChild(card);
    });
  }
  
  createRebuyCard(rebuy) {
    const card = document.createElement('div');
    const isEditing = this.editingEntryId === rebuy.id;
    card.className = 'entry-card rebuy-card' + (isEditing ? ' editing' : '');
    
    const typeIcon = Resources.icon(rebuy.type);
    const typeLabel = Resources.get(`rebuyTypes.${rebuy.type}`);
    
    card.innerHTML = `
      <div class="entry-header-compact">
        <div class="entry-name-section" data-id="${rebuy.id}" data-type="rebuy">
          <input type="checkbox" 
                 class="paid-checkbox-inline" 
                 id="paid_rebuy_${rebuy.id}" 
                 ${rebuy.paid ? 'checked' : ''}
                 data-id="${rebuy.id}"
                 data-type="rebuy">
          <label for="paid_rebuy_${rebuy.id}" class="paid-label-inline">
            ${rebuy.paid ? Resources.icon('check') : Resources.icon('cross')}
          </label>
          <span class="entry-player-name-compact">${rebuy.player.displayName}</span>
          <span class="rebuy-type-badge">${typeIcon} ${typeLabel}</span>
        </div>
        <button class="remove-entry-btn-compact" data-id="${rebuy.id}">${Resources.icon('trash')}</button>
      </div>
      ${isEditing ? `
        <div class="entry-edit-section">
          <div class="rebuy-type-selector-compact">
            ${this.createRebuyTypeRadios(rebuy.id, rebuy.type)}
          </div>
        </div>
      ` : ''}
    `;
    
    // Event listeners
    card.querySelector('.remove-entry-btn-compact').addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeRebuy(rebuy.id);
    });
    
    // Checkbox with stopPropagation to prevent card toggle
    card.querySelector('.paid-checkbox-inline').addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    card.querySelector('.paid-checkbox-inline').addEventListener('change', (e) => {
      e.stopPropagation();
      this.updateRebuyPaid(rebuy.id, e.target.checked);
    });
    
    // Only the player name area triggers edit mode
    const nameSpan = card.querySelector('.entry-player-name-compact');
    const badge = card.querySelector('.rebuy-type-badge');
    
    [nameSpan, badge].forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleEditMode(rebuy.id, 'rebuy');
      });
    });
    
    if (isEditing) {
      card.querySelectorAll('input[name="rebuy_type_' + rebuy.id + '"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          this.updateRebuyType(rebuy.id, e.target.value);
          this.toggleEditMode(rebuy.id, 'rebuy'); // Close after selection
        });
      });
    }
    
    return card;
  }
  
  createRebuyTypeRadios(entryId, selectedType) {
    const types = ['regular', 'house', 'dotke'];
    return types.map(type => `
      <input type="radio" 
             id="${type}_${entryId}" 
             name="rebuy_type_${entryId}" 
             value="${type}"
             ${selectedType === type ? 'checked' : ''}>
      <label class="rebuy-type-label-inline" for="${type}_${entryId}">
        ${Resources.icon(type)} ${Resources.get(`rebuyTypes.${type}`)}
      </label>
    `).join('');
  }
  
  renderScores() {
    const list = DOM.$('scoreList');
    const section = DOM.$('scoreSection');
    
    if (this.scores.length === 0) {
      section.classList.add('hidden');
      return;
    }
    
    section.classList.remove('hidden');
    DOM.clear(list);
    
    this.scores.forEach((score, index) => {
      const card = this.createScoreCard(score, index);
      list.appendChild(card);
    });
  }
  
  createScoreCard(score, index) {
    const card = document.createElement('div');
    card.className = 'entry-card score-card';
    card.draggable = true;
    card.dataset.entryId = score.id;
    
    const position = index + 1;
    
    card.innerHTML = `
      <div class="entry-header-compact score-header-full">
        <div class="drag-handle">${Resources.icon('trophy')} ${position}</div>
        <div class="entry-name-section">
          <input type="checkbox" 
                 class="paid-checkbox-inline" 
                 id="paid_score_${score.id}" 
                 ${score.paid ? 'checked' : ''}
                 data-id="${score.id}"
                 data-type="score">
          <label for="paid_score_${score.id}" class="paid-label-inline">
            ${score.paid ? Resources.icon('check') : Resources.icon('cross')}
          </label>
          <span class="entry-player-name-compact">${score.player.displayName}</span>
        </div>
        <button class="remove-entry-btn-compact" data-id="${score.id}">${Resources.icon('trash')}</button>
      </div>
    `;
    
    // Event listeners
    card.querySelector('.remove-entry-btn-compact').addEventListener('click', () => this.removeScore(score.id));
    
    card.querySelector('.paid-checkbox-inline').addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    card.querySelector('.paid-checkbox-inline').addEventListener('change', (e) => {
      e.stopPropagation();
      this.updateScorePaid(score.id, e.target.checked);
    });
    
    // Drag and drop events
    card.addEventListener('dragstart', (e) => this.handleDragStart(e));
    card.addEventListener('dragend', (e) => this.handleDragEnd(e));
    card.addEventListener('dragover', (e) => this.handleDragOver(e));
    card.addEventListener('drop', (e) => this.handleDrop(e));
    card.addEventListener('dragenter', (e) => this.handleDragEnter(e));
    card.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    
    return card;
  }
  
  handleDragStart(e) {
    this.draggedElement = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  }
  
  handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.entry-card.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
    this.draggedElement = null;
  }
  
  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }
  
  handleDragEnter(e) {
    if (e.currentTarget !== this.draggedElement) {
      e.currentTarget.classList.add('drag-over');
    }
  }
  
  handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }
  
  handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    
    e.preventDefault();
    
    const draggedId = parseInt(this.draggedElement.dataset.entryId);
    const droppedOnId = parseInt(e.currentTarget.dataset.entryId);
    
    if (draggedId !== droppedOnId) {
      // Find indices
      const draggedIndex = this.scores.findIndex(s => s.id === draggedId);
      const droppedOnIndex = this.scores.findIndex(s => s.id === droppedOnId);
      
      // Reorder array
      const [draggedItem] = this.scores.splice(draggedIndex, 1);
      this.scores.splice(droppedOnIndex, 0, draggedItem);
      
      // Re-render and save
      this.autoSave();
      this.renderScores();
    }
    
    return false;
  }
  
  autoSave() {
    if (!CONFIG.features.autoSave) return;
    
    const data = {
      rebuys: this.rebuys.map(r => ({
        id: r.id,
        player: r.player.toJSON(),
        type: r.type,
        paid: r.paid
      })),
      scores: this.scores.map(s => ({
        id: s.id,
        player: s.player.toJSON(),
        paid: s.paid
      })),
      buyInAmount: this.buyInAmount,
      nextEntryId: this.nextEntryId,
      nextGuestId: this.nextGuestId
    };
    
    StorageManager.save(CONFIG.storage.gameData, data);
  }
  
  loadFromStorage() {
    const data = StorageManager.load(CONFIG.storage.gameData, CONFIG.features.validateDates);
    
    if (data) {
      this.rebuys = (data.rebuys || []).map(r => ({
        id: r.id,
        player: new Player(r.player),
        type: r.type,
        paid: r.paid
      }));
      
      this.scores = (data.scores || []).map(s => ({
        id: s.id,
        player: new Player(s.player),
        paid: s.paid
      }));
      
      this.buyInAmount = data.buyInAmount || 200;
      this.nextEntryId = data.nextEntryId || 1;
      this.nextGuestId = data.nextGuestId || 1001;
      
      DOM.$('buyInAmount').value = this.buyInAmount;
      UI.showMessage(Resources.get('messages.dataLoaded'), 'success', 2000);
    }
  }
  
  async saveGame() {
    const totalEntries = this.rebuys.length + this.scores.length;
    
    if (totalEntries === 0) {
      UI.showMessage(Resources.get('errors.noEntries'), 'error');
      return;
    }
    
    const btn = DOM.$('saveBtn');
    UI.setButtonLoading(btn, true);
    
    try {
      const gameRecord = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('he-IL'),
        buyInAmount: this.buyInAmount,
        rebuys: this.rebuys.map(r => ({
          name: r.player.nickName,
          type: r.type,
          paid: r.paid
        })),
        scores: this.scores.map((s, index) => ({
          name: s.player.nickName,
          position: index + 1, // Position calculated from array order
          paid: s.paid
        })),
        summary: {
          totalEntries: totalEntries,
          totalPlayers: new Set([...this.rebuys.map(r => r.player.id), ...this.scores.map(s => s.player.id)]).size,
          totalMoney: (this.rebuys.filter(r => r.paid).length + this.scores.filter(s => s.paid).length) * this.buyInAmount
        }
      };
      
      await this.dataService.saveGame(gameRecord);
      
      const whatsappText = this.formatForWhatsApp(gameRecord);
      const shared = await UI.share({ title: Resources.get('titles.gameRecorder'), text: whatsappText });
      
      if (!shared) UI.openWhatsApp(whatsappText);
      
      UI.showMessage(Resources.get('messages.gameSaved'), 'success');
      localStorage.removeItem(CONFIG.storage.gameData);
      
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
    text += `?? *Buy-In:* ${UI.formatCurrency(gameRecord.buyInAmount)}\n`;
    text += `${'='.repeat(30)}\n\n`;
    text += `?? *?????:*\n`;
    text += `• ??"? ??????: ${gameRecord.summary.totalEntries}\n`;
    text += `• ??"? ??????: ${gameRecord.summary.totalPlayers}\n`;
    text += `• ??"? ????: ${UI.formatCurrency(gameRecord.summary.totalMoney)}\n\n`;
    
    if (gameRecord.rebuys.length > 0) {
      text += `?? *????? (${gameRecord.rebuys.length}):*\n`;
      gameRecord.rebuys.forEach(r => {
        const icon = Resources.icon(r.type);
        text += `• ${r.name} ${icon} ${Resources.get(`rebuyTypes.${r.type}`)} ${r.paid ? '?' : '?'}\n`;
      });
      text += '\n';
    }
    
    if (gameRecord.scores.length > 0) {
      text += `?? *?????? (${gameRecord.scores.length}):*\n`;
      gameRecord.scores.forEach((s, index) => {
        text += `${index + 1}. ${s.name} ${s.paid ? '?' : '?'}\n`;
      });
    }
    
    return text;
  }
}

// Global app instance
let app;

document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Initializing Game Recorder App...');
    app = new GameRecorderApp();
    
    window.addRebuy = () => app.addRebuy();
    window.addScore = () => app.addScore();
    window.confirmGuest = () => app.confirmGuest();
    window.closeGuestModal = () => app.closeGuestModal();
    window.saveGame = () => app.saveGame();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    alert('Failed to initialize app. Check console for details.');
  }
});
