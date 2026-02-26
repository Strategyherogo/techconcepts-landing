/**
 * TechConcepts Chat Framework
 * Dual-mode conversational UI: Chat + Interactive Survey
 * Version 2.0
 */

class ChatEngine {
  constructor(config) {
    this.config = {
      modes: ['chat', 'survey'],
      defaultMode: 'chat',
      allowToggle: true,
      ...config
    };
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.isTyping = false;
    this.currentMode = this.config.defaultMode;

    this.container = null;
    this.chatMessages = null;
    this.inputArea = null;
    this.progressBar = null;

    this.init();
  }

  init() {
    this.createUI();
    this.attachEventListeners();
    this.trackEvent('framework_started', { mode: this.currentMode });

    // Load saved mode from localStorage
    const savedMode = localStorage.getItem('techconcepts_mode');
    if (savedMode && this.config.modes.includes(savedMode)) {
      this.currentMode = savedMode;
    }

    this.renderMode();
  }

  createUI() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'chat-container';

    // Mode toggle (if enabled)
    let modeToggleHTML = '';
    if (this.config.allowToggle && this.config.modes.length > 1) {
      modeToggleHTML = `
        <div class="mode-toggle">
          <button class="mode-btn ${this.currentMode === 'chat' ? 'active' : ''}" data-mode="chat">
            <span class="icon">💬</span> Chat
          </button>
          <button class="mode-btn ${this.currentMode === 'survey' ? 'active' : ''}" data-mode="survey">
            <span class="icon">📋</span> Survey
          </button>
        </div>
      `;
    }

    this.container.innerHTML = `
      ${modeToggleHTML}
      <div class="chat-progress">
        <div class="chat-progress-bar" id="chat-progress-bar"></div>
        <div class="chat-progress-text" id="chat-progress-text">0/${this.config.questions.length}</div>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input-area" id="chat-input-area"></div>
    `;

    // Replace existing content
    const existingContent = document.querySelector('.calculator-card, .hero + .container');
    if (existingContent) {
      existingContent.parentNode.insertBefore(this.container, existingContent);
      existingContent.style.display = 'none';
    }

    this.chatMessages = document.getElementById('chat-messages');
    this.inputArea = document.getElementById('chat-input-area');
    this.progressBar = document.getElementById('chat-progress-bar');
    this.progressText = document.getElementById('chat-progress-text');

    // Attach mode toggle listeners
    if (this.config.allowToggle) {
      const modeButtons = this.container.querySelectorAll('.mode-btn');
      modeButtons.forEach(btn => {
        btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
      });
    }
  }

  renderMode() {
    if (this.currentMode === 'chat') {
      this.startChatMode();
    } else if (this.currentMode === 'survey') {
      this.startSurveyMode();
    }
  }

  switchMode(newMode) {
    if (newMode === this.currentMode) return;

    this.currentMode = newMode;
    localStorage.setItem('techconcepts_mode', newMode);

    // Update UI
    const modeButtons = this.container.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === newMode);
    });

    // Reset state
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.chatMessages.innerHTML = '';
    this.inputArea.innerHTML = '';
    this.progressBar.style.width = '0';
    this.progressText.textContent = `0/${this.config.questions.length}`;

    // Track mode switch
    this.trackEvent('mode_switched', { mode: newMode });

    // Render new mode
    this.renderMode();
  }

  startChatMode() {
    this.chatMessages.classList.remove('survey-mode');
    setTimeout(() => this.showQuestion(0), 300);
  }

  startSurveyMode() {
    this.chatMessages.classList.add('survey-mode');
    this.inputArea.style.display = 'none';
    this.renderSurveyMode();
  }

  renderSurveyMode() {
    const survey = new SurveyMode(this.config, this);
    survey.render(this.chatMessages);
  }

  attachEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.isTyping) {
        const activeButton = document.querySelector('.chat-button:focus, .chat-button:hover');
        if (activeButton) {
          activeButton.click();
        } else {
          this.handleEnterKey();
        }
      }
    });
  }

  handleEnterKey() {
    const input = this.inputArea.querySelector('input[type="text"], input[type="number"], input[type="email"]');
    if (input && input.value.trim()) {
      const submitBtn = this.inputArea.querySelector('.chat-submit-btn');
      if (submitBtn) submitBtn.click();
    }
  }

  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing-indicator';
    typingDiv.style.animationDelay = '100ms';
    typingDiv.innerHTML = `
      <div class="chat-bubble">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    this.chatMessages.appendChild(typingDiv);
    this.scrollToBottom();
    return typingDiv;
  }

  removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
      indicator.remove();
    }
  }

  showBotMessage(message, emoji = '') {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message bot fade-in';
    msgDiv.style.animationDelay = '50ms';
    msgDiv.innerHTML = `
      <div class="chat-bubble">
        ${emoji ? `<span class="chat-emoji">${emoji}</span> ` : ''}${message}
      </div>
    `;
    this.chatMessages.appendChild(msgDiv);
    this.scrollToBottom();

    // Add spring physics to bubble
    this.addSpringPhysics(msgDiv.querySelector('.chat-bubble'));
  }

  showUserMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message user fade-in';
    msgDiv.style.animationDelay = '50ms';
    msgDiv.innerHTML = `
      <div class="chat-bubble">${message}</div>
    `;
    this.chatMessages.appendChild(msgDiv);
    this.scrollToBottom();

    // Add spring physics to bubble
    this.addSpringPhysics(msgDiv.querySelector('.chat-bubble'));
  }

  showQuestion(index) {
    if (index >= this.config.questions.length) {
      this.showResults();
      return;
    }

    const question = this.config.questions[index];
    this.currentQuestionIndex = index;

    // Update progress with spring animation
    const progress = ((index) / this.config.questions.length) * 100;
    this.progressBar.style.width = progress + '%';
    this.progressText.textContent = `${index}/${this.config.questions.length}`;

    // Color shift on completion
    if (progress === 100) {
      this.progressBar.style.background = 'linear-gradient(90deg, #30D158 0%, #34C759 100%)';
    }

    // Show typing indicator
    this.isTyping = true;
    const typingIndicator = this.showTypingIndicator();

    // Simulate typing delay
    setTimeout(() => {
      this.removeTypingIndicator(typingIndicator);
      this.isTyping = false;

      // Show bot message
      this.showBotMessage(question.botMessage, question.emoji || this.config.emoji);

      // Show input based on question type
      this.renderInput(question);
    }, 500);
  }

  renderInput(question) {
    this.inputArea.innerHTML = '';

    switch (question.type) {
      case 'yes-no':
        this.renderYesNo(question);
        break;
      case 'choice':
        this.renderChoice(question);
        break;
      case 'number':
        this.renderNumber(question);
        break;
      case 'text':
        this.renderText(question);
        break;
      case 'email':
        this.renderEmail(question);
        break;
    }
  }

  renderYesNo(question) {
    const container = document.createElement('div');
    container.className = 'chat-buttons';
    container.innerHTML = `
      <button class="chat-button yes-button" data-value="yes">
        <span class="button-emoji">✅</span> Yes
      </button>
      <button class="chat-button no-button" data-value="no">
        <span class="button-emoji">❌</span> No
      </button>
    `;

    container.querySelectorAll('.chat-button').forEach((btn, index) => {
      // Stagger animation
      btn.style.animation = `slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms backwards`;

      btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        const label = btn.textContent.trim();
        this.handleAnswer(question.id, value, label);

        // Scale down animation on click
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
        }, 100);
      });
    });

    this.inputArea.appendChild(container);
  }

  renderChoice(question) {
    const container = document.createElement('div');
    container.className = 'chat-buttons';

    question.options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.className = 'chat-button choice-button';
      btn.dataset.value = option.value;
      btn.innerHTML = `
        ${option.emoji ? `<span class="button-emoji">${option.emoji}</span>` : ''}
        ${option.label}
      `;

      // Stagger animation
      btn.style.animation = `slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms backwards`;

      btn.addEventListener('click', () => {
        this.handleAnswer(question.id, option.value, option.label);

        // Scale down animation on click
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
        }, 100);
      });

      container.appendChild(btn);
    });

    this.inputArea.appendChild(container);
  }

  renderNumber(question) {
    const container = document.createElement('div');
    container.className = 'chat-input-group';

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'chat-input';
    input.placeholder = question.placeholder || 'Enter a number';
    input.min = question.min || 0;
    input.max = question.max || 999999999;
    input.value = question.defaultValue || '';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'chat-submit-btn';
    submitBtn.innerHTML = '→';
    submitBtn.addEventListener('click', () => {
      if (input.value && parseInt(input.value) >= (question.min || 0)) {
        this.handleAnswer(question.id, parseInt(input.value), input.value);
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value) {
        submitBtn.click();
      }
    });

    container.appendChild(input);
    container.appendChild(submitBtn);
    this.inputArea.appendChild(container);

    // Focus input
    setTimeout(() => input.focus(), 100);
  }

  renderText(question) {
    const container = document.createElement('div');
    container.className = 'chat-input-group';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'chat-input';
    input.placeholder = question.placeholder || 'Type your answer';
    input.value = question.defaultValue || '';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'chat-submit-btn';
    submitBtn.innerHTML = '→';
    submitBtn.addEventListener('click', () => {
      if (input.value.trim()) {
        this.handleAnswer(question.id, input.value, input.value);
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        submitBtn.click();
      }
    });

    container.appendChild(input);
    container.appendChild(submitBtn);
    this.inputArea.appendChild(container);

    // Focus input
    setTimeout(() => input.focus(), 100);
  }

  renderEmail(question) {
    const container = document.createElement('div');
    container.className = 'chat-input-group';

    const input = document.createElement('input');
    input.type = 'email';
    input.className = 'chat-input';
    input.placeholder = question.placeholder || 'your@email.com';
    input.required = true;

    const submitBtn = document.createElement('button');
    submitBtn.className = 'chat-submit-btn';
    submitBtn.innerHTML = '→';
    submitBtn.addEventListener('click', () => {
      if (input.value && this.validateEmail(input.value)) {
        this.handleAnswer(question.id, input.value, input.value);
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value && this.validateEmail(input.value)) {
        submitBtn.click();
      }
    });

    container.appendChild(input);
    container.appendChild(submitBtn);
    this.inputArea.appendChild(container);

    // Focus input
    setTimeout(() => input.focus(), 100);
  }

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  handleAnswer(questionId, value, displayValue) {
    // Store answer
    this.answers[questionId] = value;

    // Show user message
    this.showUserMessage(displayValue);

    // Show checkmark feedback
    this.showFeedback();

    // Track event
    this.trackEvent('question_answered', {
      question_id: questionId,
      question_number: this.currentQuestionIndex + 1
    });

    // Clear input area
    this.inputArea.innerHTML = '';

    // Show next question after delay
    setTimeout(() => {
      this.showQuestion(this.currentQuestionIndex + 1);
    }, 800);
  }

  showFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'chat-feedback';
    feedback.innerHTML = '✓';
    this.chatMessages.appendChild(feedback);

    // Haptic-style feedback
    setTimeout(() => {
      feedback.style.transform = 'scale(0.8)';
      feedback.style.opacity = '0';
    }, 600);

    setTimeout(() => feedback.remove(), 1000);
  }

  showResults() {
    // Update progress to 100%
    this.progressBar.style.width = '100%';
    this.progressText.textContent = `${this.config.questions.length}/${this.config.questions.length}`;

    // Show typing indicator
    this.isTyping = true;
    const typingIndicator = this.showTypingIndicator();

    setTimeout(() => {
      this.removeTypingIndicator(typingIndicator);
      this.isTyping = false;

      // Call onComplete callback
      if (this.config.onComplete) {
        this.config.onComplete(this.answers, this);
      }

      this.trackEvent('chat_completed');
    }, 1000);
  }

  showResultsCard(results) {
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'chat-results-card';

    let html = `<h2>${this.config.resultsTitle || '📊 Your Results'}</h2>`;

    results.forEach(item => {
      html += `
        <div class="result-row">
          <span class="result-label">${item.label}</span>
          <span class="result-value ${item.highlight ? 'highlight' : ''}">${item.value}</span>
        </div>
      `;
    });

    resultsDiv.innerHTML = html;
    this.chatMessages.appendChild(resultsDiv);
    this.scrollToBottom();

    // Add blur-in effect
    this.addBlurInEffect(resultsDiv);
  }

  showEmailCapture(message = "Want your detailed report? Drop your email 👇") {
    // Show bot message
    this.showBotMessage(message, '📧');

    // Render email input
    const container = document.createElement('div');
    container.className = 'chat-input-group';

    const form = document.createElement('form');
    form.action = this.config.formspreeUrl || 'https://formspree.io/f/xpwzgvqr';
    form.method = 'POST';

    const input = document.createElement('input');
    input.type = 'email';
    input.name = 'email';
    input.className = 'chat-input';
    input.placeholder = 'your@email.com';
    input.required = true;

    // Add hidden fields for answers
    Object.keys(this.answers).forEach(key => {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = key;
      hidden.value = this.answers[key];
      form.appendChild(hidden);
    });

    // Add tool name
    const toolHidden = document.createElement('input');
    toolHidden.type = 'hidden';
    toolHidden.name = 'tool';
    toolHidden.value = this.config.toolName || 'chat-tool';
    form.appendChild(toolHidden);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'chat-submit-btn';
    submitBtn.innerHTML = '→';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input.value && this.validateEmail(input.value)) {
        this.handleEmailSubmit(input.value, form);
      }
    });

    form.appendChild(input);
    form.appendChild(submitBtn);
    container.appendChild(form);
    this.inputArea.appendChild(container);

    // Focus input
    setTimeout(() => input.focus(), 100);
  }

  async handleEmailSubmit(email, form) {
    this.showUserMessage(email);
    this.inputArea.innerHTML = '';

    // Track lead
    this.trackEvent('lead_submit', {
      email: email
    });

    // Submit form
    try {
      await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          'Accept': 'application/json'
        }
      });

      // Show success message
      setTimeout(() => {
        this.showBotMessage("Thanks! Check your email for the full report. 🎉", '✅');
        this.showShareButtons();
      }, 500);
    } catch (error) {
      this.showBotMessage("Oops! Something went wrong. Please try again.", '⚠️');
    }
  }

  showShareButtons() {
    const shareDiv = document.createElement('div');
    shareDiv.className = 'chat-share-buttons fade-in';
    shareDiv.innerHTML = `
      <p style="text-align: center; margin-bottom: 12px; font-weight: 600;">Share your results:</p>
      <div class="share-button-group">
        <a href="${this.getTwitterShareUrl()}" target="_blank" class="share-btn twitter">
          <span>🐦</span> Twitter
        </a>
        <a href="${this.getLinkedInShareUrl()}" target="_blank" class="share-btn linkedin">
          <span>💼</span> LinkedIn
        </a>
      </div>
    `;
    this.chatMessages.appendChild(shareDiv);
    this.scrollToBottom();

    // Track share clicks
    shareDiv.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.trackEvent('results_shared', {
          platform: btn.classList.contains('twitter') ? 'twitter' : 'linkedin'
        });
      });
    });
  }

  getTwitterShareUrl() {
    const text = this.config.shareText || `I just used ${this.config.title} on TechConcepts.org`;
    const url = window.location.href;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  }

  getLinkedInShareUrl() {
    const url = window.location.href;
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 100);
  }

  trackEvent(eventName, params = {}) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        ...params,
        tool: this.config.toolName || 'chat-tool'
      });
    }
  }

  formatCurrency(value) {
    return '$' + Math.round(value).toLocaleString('en-US');
  }

  formatNumber(value) {
    return Math.round(value).toLocaleString('en-US');
  }

  formatPercent(value) {
    return Math.round(value) + '%';
  }

  // Apple-style spring physics for bubbles
  addSpringPhysics(element) {
    if (!element) return;

    // Add subtle hover effect
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'scale(1.02)';
      element.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'scale(1)';
    });
  }

  // Blur-in effect for results card
  addBlurInEffect(element) {
    if (!element) return;

    let blurValue = 20;
    const interval = setInterval(() => {
      blurValue -= 2;
      if (blurValue <= 0) {
        clearInterval(interval);
        element.style.backdropFilter = 'blur(20px) saturate(180%)';
        element.style.webkitBackdropFilter = 'blur(20px) saturate(180%)';
      } else {
        element.style.backdropFilter = `blur(${blurValue}px) saturate(180%)`;
        element.style.webkitBackdropFilter = `blur(${blurValue}px) saturate(180%)`;
      }
    }, 30);
  }
}

/**
 * Survey Mode - Interactive form with all questions visible
 */
class SurveyMode {
  constructor(config, chatEngine) {
    this.config = config;
    this.chatEngine = chatEngine;
    this.answers = {};
    this.container = null;
  }

  render(parentElement) {
    this.container = document.createElement('div');
    this.container.className = 'survey-container';

    // Create progress circle
    const progressCircle = this.createProgressCircle();

    // Create questions
    const questionsContainer = document.createElement('div');
    questionsContainer.className = 'survey-questions';

    this.config.questions.forEach((question, index) => {
      const questionCard = this.createQuestionCard(question, index);
      questionsContainer.appendChild(questionCard);
    });

    // Add to container
    this.container.appendChild(progressCircle);
    this.container.appendChild(questionsContainer);

    // Clear and append
    parentElement.innerHTML = '';
    parentElement.appendChild(this.container);

    // Load saved answers from localStorage
    this.loadSavedAnswers();

    // Update progress
    this.updateProgress();
  }

  createProgressCircle() {
    const progressDiv = document.createElement('div');
    progressDiv.className = 'survey-progress-circle';
    progressDiv.innerHTML = `
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="6"/>
        <circle cx="40" cy="40" r="34" fill="none" stroke="url(#gradient)" stroke-width="6"
                stroke-linecap="round" stroke-dasharray="213.6" stroke-dashoffset="213.6"
                transform="rotate(-90 40 40)" class="progress-ring"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#007AFF"/>
            <stop offset="100%" stop-color="#5AC8FA"/>
          </linearGradient>
        </defs>
      </svg>
      <div class="progress-text">
        <span class="progress-number">0</span>
        <span class="progress-total">/${this.config.questions.length}</span>
      </div>
    `;
    return progressDiv;
  }

  createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.dataset.questionId = question.id;
    card.dataset.index = index;

    const emoji = question.emoji || this.config.emoji || '❓';

    let inputHTML = '';
    switch (question.type) {
      case 'yes-no':
        inputHTML = this.renderYesNoInput(question);
        break;
      case 'choice':
        inputHTML = this.renderChoiceInput(question);
        break;
      case 'number':
        inputHTML = this.renderNumberInput(question);
        break;
      case 'text':
        inputHTML = this.renderTextInput(question);
        break;
      case 'email':
        inputHTML = this.renderEmailInput(question);
        break;
    }

    card.innerHTML = `
      <div class="question-header">
        <span class="question-emoji">${emoji}</span>
        <h3 class="question-title">${question.botMessage}</h3>
        <span class="question-checkmark">✓</span>
      </div>
      <div class="question-input">
        ${inputHTML}
      </div>
    `;

    return card;
  }

  renderYesNoInput(question) {
    return `
      <div class="toggle-switch" data-question="${question.id}">
        <button class="toggle-option" data-value="yes">
          <span class="toggle-emoji">✅</span> Yes
        </button>
        <button class="toggle-option" data-value="no">
          <span class="toggle-emoji">❌</span> No
        </button>
      </div>
    `;
  }

  renderChoiceInput(question) {
    return `
      <div class="choice-options" data-question="${question.id}">
        ${question.options.map(option => `
          <button class="choice-option" data-value="${option.value}">
            ${option.emoji ? `<span class="choice-emoji">${option.emoji}</span>` : ''}
            ${option.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  renderNumberInput(question) {
    return `
      <div class="number-input-wrapper" data-question="${question.id}">
        <input type="number" class="survey-number-input"
               min="${question.min || 0}"
               max="${question.max || 999999999}"
               value="${question.defaultValue || ''}"
               placeholder="${question.placeholder || 'Enter a number'}">
        <div class="slider-track">
          <input type="range" class="survey-slider"
                 min="${question.min || 0}"
                 max="${question.max || 999999999}"
                 value="${question.defaultValue || question.min || 0}">
        </div>
      </div>
    `;
  }

  renderTextInput(question) {
    return `
      <textarea class="survey-text-input"
                data-question="${question.id}"
                placeholder="${question.placeholder || 'Type your answer'}"
                rows="3"></textarea>
    `;
  }

  renderEmailInput(question) {
    return `
      <input type="email" class="survey-email-input"
             data-question="${question.id}"
             placeholder="${question.placeholder || 'your@email.com'}">
    `;
  }

  loadSavedAnswers() {
    const savedAnswers = localStorage.getItem(`techconcepts_survey_${this.config.toolName}`);
    if (savedAnswers) {
      try {
        this.answers = JSON.parse(savedAnswers);
        this.restoreAnswers();
      } catch (e) {
        console.warn('Failed to load saved answers:', e);
      }
    }

    // Attach event listeners after loading
    this.attachInputListeners();
  }

  restoreAnswers() {
    Object.keys(this.answers).forEach(questionId => {
      const value = this.answers[questionId];
      const card = this.container.querySelector(`[data-question-id="${questionId}"]`);
      if (!card) return;

      const question = this.config.questions.find(q => q.id === questionId);
      if (!question) return;

      switch (question.type) {
        case 'yes-no':
        case 'choice':
          const btn = card.querySelector(`[data-value="${value}"]`);
          if (btn) {
            btn.classList.add('selected');
            card.classList.add('answered');
          }
          break;
        case 'number':
          const numInput = card.querySelector('.survey-number-input');
          const slider = card.querySelector('.survey-slider');
          if (numInput) numInput.value = value;
          if (slider) slider.value = value;
          card.classList.add('answered');
          break;
        case 'text':
        case 'email':
          const textInput = card.querySelector('.survey-text-input, .survey-email-input');
          if (textInput) {
            textInput.value = value;
            card.classList.add('answered');
          }
          break;
      }
    });
  }

  attachInputListeners() {
    // Toggle switches (yes/no)
    this.container.querySelectorAll('.toggle-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const questionId = btn.parentElement.dataset.question;
        const value = btn.dataset.value;

        // Remove previous selection
        btn.parentElement.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        this.handleAnswer(questionId, value);
      });
    });

    // Choice buttons
    this.container.querySelectorAll('.choice-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const questionId = btn.parentElement.dataset.question;
        const value = btn.dataset.value;

        // Remove previous selection
        btn.parentElement.querySelectorAll('.choice-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        this.handleAnswer(questionId, value);
      });
    });

    // Number inputs with sliders
    this.container.querySelectorAll('.number-input-wrapper').forEach(wrapper => {
      const questionId = wrapper.dataset.question;
      const numberInput = wrapper.querySelector('.survey-number-input');
      const slider = wrapper.querySelector('.survey-slider');

      if (numberInput && slider) {
        numberInput.addEventListener('input', (e) => {
          slider.value = e.target.value;
          this.handleAnswer(questionId, parseInt(e.target.value));
        });

        slider.addEventListener('input', (e) => {
          numberInput.value = e.target.value;
          this.handleAnswer(questionId, parseInt(e.target.value));
        });
      }
    });

    // Text inputs
    this.container.querySelectorAll('.survey-text-input').forEach(input => {
      const questionId = input.dataset.question;
      input.addEventListener('input', (e) => {
        this.handleAnswer(questionId, e.target.value);
      });
    });

    // Email inputs
    this.container.querySelectorAll('.survey-email-input').forEach(input => {
      const questionId = input.dataset.question;
      input.addEventListener('input', (e) => {
        this.handleAnswer(questionId, e.target.value);
      });
    });
  }

  handleAnswer(questionId, value) {
    this.answers[questionId] = value;

    // Mark card as answered
    const card = this.container.querySelector(`[data-question-id="${questionId}"]`);
    if (card) {
      card.classList.add('answered');

      // Spring animation
      card.style.transform = 'scale(0.98)';
      setTimeout(() => {
        card.style.transform = 'scale(1)';
      }, 150);
    }

    // Save to localStorage
    localStorage.setItem(`techconcepts_survey_${this.config.toolName}`, JSON.stringify(this.answers));

    // Update progress
    this.updateProgress();

    // Track event
    this.chatEngine.trackEvent('survey_question_answered', {
      question_id: questionId
    });

    // Check if all answered
    if (Object.keys(this.answers).length === this.config.questions.length) {
      this.handleCompletion();
    }
  }

  updateProgress() {
    const answeredCount = Object.keys(this.answers).length;
    const totalCount = this.config.questions.length;
    const percentage = (answeredCount / totalCount) * 100;

    // Update progress circle
    const progressRing = this.container.querySelector('.progress-ring');
    const progressNumber = this.container.querySelector('.progress-number');

    if (progressRing) {
      const circumference = 213.6;
      const offset = circumference - (percentage / 100) * circumference;
      progressRing.style.strokeDashoffset = offset;
      progressRing.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    if (progressNumber) {
      progressNumber.textContent = answeredCount;
    }

    // Update main progress bar
    if (this.chatEngine.progressBar) {
      this.chatEngine.progressBar.style.width = percentage + '%';
      this.chatEngine.progressText.textContent = `${answeredCount}/${totalCount}`;
    }
  }

  handleCompletion() {
    // Wait a bit for the last animation
    setTimeout(() => {
      // Scroll to top
      this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Add confetti effect
      this.showConfetti();

      // Call onComplete callback
      setTimeout(() => {
        if (this.config.onComplete) {
          this.chatEngine.answers = this.answers;
          this.config.onComplete(this.answers, this.chatEngine);
        }
        this.chatEngine.trackEvent('survey_completed');
      }, 1000);
    }, 500);
  }

  showConfetti() {
    // Simple confetti effect
    const confettiCount = 30;
    const colors = ['#007AFF', '#30D158', '#FF453A', '#FFD60A', '#BF5AF2'];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
      this.container.appendChild(confetti);

      setTimeout(() => confetti.remove(), 4000);
    }
  }
}

// Make ChatEngine globally available
window.ChatEngine = ChatEngine;
