# Quick Start Guide - Dual-Mode Chat Framework

## 30-Second Setup

### 1. Add Files
```html
<link rel="stylesheet" href="../styles/chat-ui.css">
<script src="../scripts/chat-framework.js"></script>
```

### 2. Configure
```javascript
const config = {
  // Basic info
  title: "My Tool",
  emoji: "🎯",
  toolName: "my-tool",

  // Enable dual-mode
  modes: ['chat', 'survey'],
  defaultMode: 'chat',
  allowToggle: true,

  // Questions
  questions: [
    {
      id: 'question1',
      type: 'yes-no',
      botMessage: "Your question here?",
      emoji: "❓"
    }
  ],

  // Results handler
  onComplete: (answers, chat) => {
    console.log(answers);
  }
};
```

### 3. Initialize
```javascript
document.addEventListener('DOMContentLoaded', () => {
  new ChatEngine(config);
});
```

Done! You now have a working dual-mode chat framework.

---

## Question Types

### Yes/No
```javascript
{
  id: 'ready',
  type: 'yes-no',
  botMessage: "Are you ready?",
  emoji: "🚀"
}
```

### Multiple Choice
```javascript
{
  id: 'choice',
  type: 'choice',
  botMessage: "Pick one:",
  emoji: "🎯",
  options: [
    { value: 'a', label: 'Option A', emoji: '🅰️' },
    { value: 'b', label: 'Option B', emoji: '🅱️' }
  ]
}
```

### Number Input
```javascript
{
  id: 'count',
  type: 'number',
  botMessage: "How many?",
  emoji: "🔢",
  min: 0,
  max: 100,
  defaultValue: 10,
  placeholder: "Enter number"
}
```

### Text Input
```javascript
{
  id: 'feedback',
  type: 'text',
  botMessage: "Your thoughts?",
  emoji: "💭",
  placeholder: "Type here..."
}
```

### Email Input
```javascript
{
  id: 'email',
  type: 'email',
  botMessage: "Your email?",
  emoji: "📧",
  placeholder: "you@example.com"
}
```

---

## Results Handler

```javascript
onComplete: (answers, chat) => {
  // Access answers
  const ready = answers.ready;        // 'yes' or 'no'
  const choice = answers.choice;      // 'a' or 'b'
  const count = answers.count;        // number
  const feedback = answers.feedback;  // string
  const email = answers.email;        // string

  // Show results card
  chat.showResultsCard([
    { label: 'Status', value: ready === 'yes' ? '✅' : '❌' },
    { label: 'Choice', value: choice.toUpperCase(), highlight: true },
    { label: 'Count', value: count }
  ]);

  // Show message
  setTimeout(() => {
    chat.showBotMessage("Thanks! 🎉", '✅');
  }, 1000);

  // Email capture
  setTimeout(() => {
    chat.showEmailCapture("Get your report:");
  }, 2000);
}
```

---

## Mode Options

### Chat Only (Default v1.0 behavior)
```javascript
const config = {
  // modes, defaultMode, allowToggle omitted
  questions: [...]
};
```

### Survey Only
```javascript
const config = {
  modes: ['survey'],
  defaultMode: 'survey',
  allowToggle: false,
  questions: [...]
};
```

### Both Modes (Recommended)
```javascript
const config = {
  modes: ['chat', 'survey'],
  defaultMode: 'chat',
  allowToggle: true,
  questions: [...]
};
```

---

## Helper Functions

### Format Currency
```javascript
chat.formatCurrency(1234.56) // "$1,235"
```

### Format Number
```javascript
chat.formatNumber(1234.56) // "1,235"
```

### Format Percent
```javascript
chat.formatPercent(45.67) // "46%"
```

### Track Event
```javascript
chat.trackEvent('custom_event', {
  property: 'value'
});
```

---

## Styling Customization

### CSS Variables (Add to your page)
```css
:root {
  --color-accent-blue: #007AFF;      /* Primary color */
  --color-success: #30D158;          /* Success color */
  --color-bg-primary: #FFFFFF;       /* Background */
  --color-text-primary: #1D1D1F;     /* Text color */
}
```

### Custom Styles
```css
/* Override specific elements */
.chat-button {
  border-radius: 20px;
}

.question-card {
  border: 3px solid purple;
}
```

---

## Common Patterns

### Show Loading State
```javascript
onComplete: (answers, chat) => {
  chat.showBotMessage("Calculating...", "⏳");

  setTimeout(() => {
    // Show results after delay
    chat.showResultsCard([...]);
  }, 2000);
}
```

### Conditional Results
```javascript
onComplete: (answers, chat) => {
  if (answers.ready === 'yes') {
    chat.showResultsCard([
      { label: 'Status', value: '✅ Ready!' }
    ]);
  } else {
    chat.showBotMessage("No worries, come back later!", "👋");
  }
}
```

### External API Call
```javascript
onComplete: async (answers, chat) => {
  chat.showBotMessage("Fetching data...", "⏳");

  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      body: JSON.stringify(answers)
    });
    const data = await response.json();

    chat.showResultsCard([
      { label: 'Result', value: data.result }
    ]);
  } catch (error) {
    chat.showBotMessage("Error! Try again.", "⚠️");
  }
}
```

---

## Debugging

### Check Console
```javascript
onComplete: (answers, chat) => {
  console.log('Answers:', answers);
  console.log('Config:', chat.config);
  console.log('Mode:', chat.currentMode);
}
```

### Verify Config
```javascript
// Before initialization
console.log('Config:', config);
console.log('Questions count:', config.questions.length);
```

### Test Mode Switch
```javascript
// In browser console
localStorage.getItem('techconcepts_mode')  // Check saved mode
localStorage.clear()                        // Clear all saved data
```

---

## Examples

### Simple Calculator
```javascript
const config = {
  modes: ['chat', 'survey'],
  defaultMode: 'chat',
  allowToggle: true,

  questions: [
    {
      id: 'num1',
      type: 'number',
      botMessage: "First number?",
      emoji: "1️⃣",
      min: 0,
      max: 1000
    },
    {
      id: 'num2',
      type: 'number',
      botMessage: "Second number?",
      emoji: "2️⃣",
      min: 0,
      max: 1000
    }
  ],

  onComplete: (answers, chat) => {
    const sum = answers.num1 + answers.num2;
    chat.showResultsCard([
      { label: 'Sum', value: sum, highlight: true }
    ]);
  }
};
```

### User Survey
```javascript
const config = {
  modes: ['survey'],  // Survey only
  defaultMode: 'survey',
  allowToggle: false,

  questions: [
    {
      id: 'satisfaction',
      type: 'choice',
      botMessage: "How satisfied are you?",
      emoji: "😊",
      options: [
        { value: 'very', label: 'Very Satisfied', emoji: '😍' },
        { value: 'somewhat', label: 'Somewhat', emoji: '🙂' },
        { value: 'not', label: 'Not Satisfied', emoji: '😞' }
      ]
    },
    {
      id: 'recommend',
      type: 'yes-no',
      botMessage: "Would you recommend us?",
      emoji: "👍"
    },
    {
      id: 'comments',
      type: 'text',
      botMessage: "Any comments?",
      emoji: "💬",
      placeholder: "Optional feedback..."
    }
  ],

  onComplete: (answers, chat) => {
    chat.showBotMessage("Thanks for your feedback! 🙏", "✅");
  }
};
```

---

## Troubleshooting

### Mode toggle not showing?
- Check `allowToggle: true` in config
- Check `modes` array has 2+ items

### Survey answers not restoring?
- Check browser console for errors
- Verify `toolName` is set in config
- Try `localStorage.clear()` and test again

### Animations not smooth?
- Check browser supports CSS Grid
- Try disabling browser extensions
- Check `prefers-reduced-motion` setting

### Progress bar not updating?
- Check `questions` array has items
- Verify each question has unique `id`
- Check browser console for errors

---

## Full Example

See `/tools/api-cost.html` for a complete working example.

See `/test-dual-mode.html` for testing template.

---

## Need Help?

1. Check browser console for errors
2. Verify config matches examples above
3. Test in latest Chrome first
4. Check `DUAL-MODE-SYSTEM.md` for detailed docs

---

**Version:** 2.0
**Files:** `chat-framework.js`, `chat-ui.css`
**Size:** ~70KB total (uncompressed)
