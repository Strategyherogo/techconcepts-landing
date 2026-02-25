/**
 * TechConcepts Chat Framework
 * Typeform-style conversational UI for lead magnets
 * Version 1.0
 */

class ChatEngine {
  constructor(config) {
    this.config = config;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.isTyping = false;

    this.container = null;
    this.chatMessages = null;
    this.inputArea = null;
    this.progressBar = null;

    this.init();
  }

  init() {
    this.createUI();
    this.attachEventListeners();
    this.trackEvent('chat_started');
    setTimeout(() => this.showQuestion(0), 300);
  }

  createUI() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'chat-container';
    this.container.innerHTML = `
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

// Make ChatEngine globally available
window.ChatEngine = ChatEngine;
