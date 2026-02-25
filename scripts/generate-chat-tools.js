#!/usr/bin/env node

/**
 * Tool Conversion Generator
 * Generates chat-based versions of all TechConcepts tools
 */

const fs = require('fs');
const path = require('path');

// Tool configurations with their specific questions and calculations
const tools = {
  'slack-roi': {
    title: 'Slack Bot ROI Calculator',
    description: 'Calculate time and cost savings from automating support tickets with a Slack bot.',
    emoji: '🤖',
    ogTitle: 'Slack Bot ROI Calculator',
    ogDescription: 'Calculate ROI from automating Slack support with a bot. Get cost savings and payback analysis.',
    questions: [
      {
        id: 'team_size',
        type: 'number',
        botMessage: "How many people are on your support team?",
        placeholder: "e.g., 15",
        emoji: "👥",
        min: 1,
        max: 1000,
        defaultValue: 15
      },
      {
        id: 'tickets_per_day',
        type: 'number',
        botMessage: "How many support tickets do you get per day?",
        placeholder: "e.g., 50",
        emoji: "📋",
        min: 1,
        max: 10000,
        defaultValue: 50
      },
      {
        id: 'minutes_per_ticket',
        type: 'number',
        botMessage: "How many minutes does it take to resolve an average ticket?",
        placeholder: "e.g., 8",
        emoji: "⏱️",
        min: 1,
        max: 120,
        defaultValue: 8
      },
      {
        id: 'hourly_cost',
        type: 'number',
        botMessage: "What's the fully-loaded hourly cost per employee? (salary + benefits + overhead)",
        placeholder: "e.g., 50",
        emoji: "💰",
        min: 10,
        max: 500,
        defaultValue: 50
      }
    ],
    calculation: `
      const teamSize = answers.team_size;
      const ticketsPerDay = answers.tickets_per_day;
      const minutesPerTicket = answers.minutes_per_ticket;
      const hourlyCost = answers.hourly_cost;

      const workingDaysPerYear = 250;
      const annualTickets = ticketsPerDay * workingDaysPerYear;
      const annualHours = (annualTickets * minutesPerTicket) / 60;
      const annualCost = annualHours * hourlyCost;

      const automationRate = 0.8;
      const timeSaved = annualHours * automationRate;
      const costSavings = timeSaved * hourlyCost;

      const implementationCost = 5000;
      const monthlyWage = costSavings / 12;
      const paybackMonths = Math.ceil(implementationCost / monthlyWage);

      answers.annual_savings = Math.round(costSavings);

      chat.showResultsCard([
        { label: 'Annual Hours Spent', value: chat.formatNumber(annualHours) + ' hrs' },
        { label: 'Annual Cost (Current)', value: chat.formatCurrency(annualCost) },
        { label: 'Time Saved with Bot (80%)', value: chat.formatNumber(timeSaved) + ' hrs', highlight: true },
        { label: 'Annual Cost Savings', value: chat.formatCurrency(costSavings), highlight: true },
        { label: 'Payback Period', value: paybackMonths + ' months', highlight: true }
      ]);

      setTimeout(() => {
        chat.showBotMessage(\`A Slack bot can automate 80% of routine tickets, saving your team \${chat.formatCurrency(costSavings)} annually! 🎉\`, '💡');
      }, 1000);

      setTimeout(() => {
        chat.showEmailCapture("Want a detailed implementation plan? Drop your email 👇");
      }, 2500);
    `
  },

  'email-migration': {
    title: 'Email Migration Cost Estimator',
    description: 'Calculate time and cost for Google to Outlook, MBOX to PST, or archive migrations.',
    emoji: '📧',
    ogTitle: 'Email Migration Cost Estimator',
    ogDescription: 'Calculate email migration costs and timeline for Google, Outlook, MBOX, PST, and EML.',
    questions: [
      {
        id: 'mailbox_count',
        type: 'number',
        botMessage: "How many mailboxes need to be migrated?",
        placeholder: "e.g., 100",
        emoji: "📬",
        min: 1,
        max: 100000,
        defaultValue: 100
      },
      {
        id: 'avg_mailbox_size',
        type: 'number',
        botMessage: "What's the average mailbox size in GB?",
        placeholder: "e.g., 5",
        emoji: "💾",
        min: 1,
        max: 100,
        defaultValue: 5
      },
      {
        id: 'migration_type',
        type: 'choice',
        botMessage: "What type of migration are you planning?",
        emoji: "🔄",
        options: [
          { value: 'cloud_to_cloud', label: 'Cloud to Cloud (Google ↔ Microsoft)', emoji: '☁️' },
          { value: 'on_prem_to_cloud', label: 'On-Premises to Cloud', emoji: '📤' },
          { value: 'archive', label: 'Archive Migration', emoji: '📦' },
          { value: 'pst_conversion', label: 'PST/MBOX Conversion', emoji: '🔧' }
        ]
      },
      {
        id: 'downtime_acceptable',
        type: 'yes-no',
        botMessage: "Can users tolerate some downtime during migration?",
        emoji: "⏸️"
      }
    ],
    calculation: `
      const mailboxCount = answers.mailbox_count;
      const avgSize = answers.avg_mailbox_size;
      const totalSize = mailboxCount * avgSize;
      const migrationType = answers.migration_type;

      // Migration speed: GB per hour
      const speeds = {
        cloud_to_cloud: 50,
        on_prem_to_cloud: 30,
        archive: 40,
        pst_conversion: 20
      };

      const speed = speeds[migrationType];
      const totalHours = totalSize / speed;
      const totalDays = Math.ceil(totalHours / 24);

      // Cost estimates
      const costPerMailbox = {
        cloud_to_cloud: 15,
        on_prem_to_cloud: 25,
        archive: 20,
        pst_conversion: 30
      };

      const estimatedCost = mailboxCount * costPerMailbox[migrationType];
      const supportHours = mailboxCount * 0.5; // 30 min per user
      const totalProjectHours = totalHours + supportHours;

      answers.estimated_cost = Math.round(estimatedCost);

      chat.showResultsCard([
        { label: 'Total Data to Migrate', value: chat.formatNumber(totalSize) + ' GB' },
        { label: 'Estimated Timeline', value: totalDays + ' days', highlight: true },
        { label: 'Project Hours', value: chat.formatNumber(Math.round(totalProjectHours)) + ' hrs' },
        { label: 'Estimated Cost', value: chat.formatCurrency(estimatedCost), highlight: true }
      ]);

      setTimeout(() => {
        const downtimeMsg = answers.downtime_acceptable === 'yes'
          ? "With planned downtime, we can parallelize the migration and reduce timeline by 30%."
          : "For zero-downtime migration, we'll use staged sync with cutover windows.";
        chat.showBotMessage(downtimeMsg, '💡');
      }, 1000);

      setTimeout(() => {
        chat.showEmailCapture("Want a detailed migration plan? Drop your email 👇");
      }, 2500);
    `
  },

  'jira-health': {
    title: 'Jira Health Check',
    description: '15 questions to assess workflow complexity, SLA tracking, automation, and user satisfaction.',
    emoji: '🏥',
    ogTitle: 'Jira Health Check',
    ogDescription: 'Free Jira health check. 15 questions, instant score and recommendations.',
    questions: [
      {
        id: 'workflow_count',
        type: 'choice',
        botMessage: "How many active workflows do you have across all projects?",
        emoji: "🔄",
        options: [
          { value: 'under_5', label: 'Under 5', emoji: '✅' },
          { value: '5_to_10', label: '5-10', emoji: '⚠️' },
          { value: '10_to_20', label: '10-20', emoji: '🟡' },
          { value: 'over_20', label: 'Over 20', emoji: '🔴' }
        ]
      },
      {
        id: 'custom_fields',
        type: 'choice',
        botMessage: "How many custom fields do you have?",
        emoji: "📝",
        options: [
          { value: 'under_20', label: 'Under 20', emoji: '✅' },
          { value: '20_to_50', label: '20-50', emoji: '⚠️' },
          { value: '50_to_100', label: '50-100', emoji: '🟡' },
          { value: 'over_100', label: 'Over 100', emoji: '🔴' }
        ]
      },
      {
        id: 'automation_rules',
        type: 'number',
        botMessage: "How many automation rules do you have configured?",
        placeholder: "e.g., 25",
        emoji: "🤖",
        min: 0,
        max: 1000,
        defaultValue: 10
      },
      {
        id: 'sla_tracking',
        type: 'yes-no',
        botMessage: "Do you actively track SLAs for support tickets?",
        emoji: "⏱️"
      },
      {
        id: 'user_satisfaction',
        type: 'choice',
        botMessage: "How would you rate overall user satisfaction with Jira?",
        emoji: "⭐",
        options: [
          { value: 'high', label: 'High - Users love it', emoji: '😍' },
          { value: 'medium', label: 'Medium - It works', emoji: '😐' },
          { value: 'low', label: 'Low - Lots of complaints', emoji: '😤' }
        ]
      }
    ],
    calculation: `
      let score = 100;
      const issues = [];

      // Workflow complexity penalty
      const workflowPenalties = { under_5: 0, '5_to_10': -10, '10_to_20': -20, over_20: -30 };
      score += workflowPenalties[answers.workflow_count];
      if (workflowPenalties[answers.workflow_count] < 0) {
        issues.push('Too many workflows cause confusion');
      }

      // Custom fields penalty
      const fieldPenalties = { under_20: 0, '20_to_50': -10, '50_to_100': -20, over_100: -30 };
      score += fieldPenalties[answers.custom_fields];
      if (fieldPenalties[answers.custom_fields] < 0) {
        issues.push('Excessive custom fields slow down Jira');
      }

      // Automation bonus
      if (answers.automation_rules < 5) {
        score -= 10;
        issues.push('Underutilizing automation capabilities');
      } else if (answers.automation_rules > 50) {
        score -= 15;
        issues.push('Too many automation rules may conflict');
      }

      // SLA tracking
      if (answers.sla_tracking === 'no') {
        score -= 15;
        issues.push('No SLA tracking for support tickets');
      }

      // User satisfaction
      const satisfactionScores = { high: 0, medium: -10, low: -25 };
      score += satisfactionScores[answers.user_satisfaction];

      score = Math.max(0, Math.min(100, score));

      let healthStatus = 'Critical';
      let healthEmoji = '🔴';
      if (score >= 80) {
        healthStatus = 'Healthy';
        healthEmoji = '✅';
      } else if (score >= 60) {
        healthStatus = 'Needs Attention';
        healthEmoji = '⚠️';
      } else if (score >= 40) {
        healthStatus = 'Poor';
        healthEmoji = '🟡';
      }

      answers.health_score = score;

      chat.showResultsCard([
        { label: 'Health Score', value: score + '/100', highlight: true },
        { label: 'Status', value: healthStatus + ' ' + healthEmoji },
        { label: 'Issues Found', value: issues.length }
      ]);

      setTimeout(() => {
        if (issues.length > 0) {
          chat.showBotMessage(\`Key issues: \${issues.join('; ')}. Let's fix these! 🔧\`, '💡');
        } else {
          chat.showBotMessage("Your Jira instance is in great shape! Keep up the good work. 🎉", '✅');
        }
      }, 1000);

      setTimeout(() => {
        chat.showEmailCapture("Want a detailed health report with recommendations? Drop your email 👇");
      }, 2500);
    `
  }
};

// Generate HTML template
function generateToolHTML(toolKey, config) {
  const canonicalUrl = `https://techconcepts.org/tools/${toolKey}.html`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${config.title} | TechConcepts</title>

<!-- SEO -->
<meta name="description" content="${config.description}">
<meta name="author" content="Evgeny Goncharov">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonicalUrl}">

<!-- Resource Hints -->
<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
<link rel="preconnect" href="https://formspree.io" crossorigin>
<link rel="dns-prefetch" href="https://formspree.io">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:title" content="${config.ogTitle}">
<meta property="og:description" content="${config.ogDescription}">
<meta property="og:image" content="https://techconcepts.org/techconcepts-og.png">
<meta property="og:site_name" content="TechConcepts">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${config.ogTitle}">
<meta name="twitter:description" content="${config.ogDescription}">
<meta name="twitter:image" content="https://techconcepts.org/techconcepts-og.png">

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${config.emoji}</text></svg>">

<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-815E8YDZW8"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-815E8YDZW8', {page_path: '/tools/${toolKey}'});
</script>

<!-- Schema.org -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "${config.title}",
  "description": "${config.description}",
  "url": "${canonicalUrl}",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "provider": {
    "@type": "Organization",
    "name": "TechConcepts"
  }
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "TechConcepts",
      "item": "https://techconcepts.org/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": "https://techconcepts.org/tools/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "${config.title}",
      "item": "${canonicalUrl}"
    }
  ]
}
</script>

<!-- Chat Framework -->
<link rel="stylesheet" href="../styles/chat-ui.css">
<script src="../scripts/chat-framework.js"></script>

<style>
  :root {
    --primary: #1a1a2e;
    --accent: #e94560;
    --accent2: #0f3460;
    --bg: #f8f9fa;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: #2d3436;
    line-height: 1.6;
  }

  .hero {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent2) 100%);
    color: white;
    padding: 60px 24px 48px;
    text-align: center;
  }

  .hero h1 {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 12px;
  }

  .hero .icon {
    font-size: 3rem;
    margin-bottom: 16px;
  }

  .hero p {
    font-size: 1.1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }

  .container {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .back-link {
    text-align: center;
    margin: 24px 0;
  }

  .back-link a {
    color: var(--accent);
    text-decoration: none;
    font-size: 0.9rem;
  }

  @media (max-width: 600px) {
    .hero h1 { font-size: 1.6rem; }
  }
</style>
</head>
<body>

<div class="hero">
  <div class="container">
    <span class="icon">${config.emoji}</span>
    <h1>${config.title}</h1>
    <p>${config.description}</p>
  </div>
</div>

<div class="container">
  <div class="back-link">
    <a href="https://techconcepts.org/tools/">&larr; Back to Tools</a>
  </div>
</div>

<script>
  const chatConfig = {
    title: "${config.title}",
    emoji: "${config.emoji}",
    toolName: "${toolKey}",
    formspreeUrl: "https://formspree.io/f/xpwzgvqr",
    shareText: "I just used ${config.title} on TechConcepts.org",
    questions: ${JSON.stringify(config.questions, null, 6)},
    onComplete: (answers, chat) => {
      ${config.calculation}
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    new ChatEngine(chatConfig);
  });
</script>

</body>
</html>`;
}

// Generate all tools
Object.keys(tools).forEach(toolKey => {
  const html = generateToolHTML(toolKey, tools[toolKey]);
  const outputPath = path.join(__dirname, '../tools', `${toolKey}-v2.html`);
  fs.writeFileSync(outputPath, html);
  console.log(`✅ Generated: ${toolKey}-v2.html`);
});

console.log(`\n🎉 Generated ${Object.keys(tools).length} chat-based tools!`);
