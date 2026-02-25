#!/bin/bash

# Batch Tool Converter
# Generates remaining 10 chat-based tools from templates

TOOLS_DIR="/Users/jenyagowork/ClaudeCodeWorkspace/1. Projects/17-techconcepts-org/tools"

# Define tool configurations (name|title|description|emoji)
declare -A TOOLS=(
  ["ios-launch"]="iOS App Launch Readiness|Check your App Store submission readiness with 20-item checklist|📱"
  ["fund-maturity"]="Fund Maturity Calculator|Calculate investment growth with compound interest|💵"
  ["multi-tenant"]="Multi-Tenant Architecture ROI|Calculate cost savings for multi-tenant vs single-tenant|🏢"
  ["it-audit"]="IT Audit Checklist|Assess security, backup, and compliance readiness|🔒"
  ["jira-formula"]="Jira Formula Builder|Build JQL queries and automation formulas|🧮"
  ["project-scoping"]="Project Scoping Calculator|Estimate timeline and cost for your project|📐"
  ["sla-calculator"]="SLA Calculator|Calculate required staffing for SLA targets|⏱️"
  ["compliance-scorecard"]="Compliance Scorecard|GDPR, SOC2, ISO gap analysis|📋"
)

echo "📦 Batch converting 8 remaining tools..."

for tool_key in "${!TOOLS[@]}"; do
  IFS='|' read -r title description emoji <<< "${TOOLS[$tool_key]}"

  output_file="${TOOLS_DIR}/${tool_key}-v2.html"

  if [ -f "$output_file" ]; then
    echo "⏭️  Skipping $tool_key (already exists)"
    continue
  fi

  echo "✨ Creating $tool_key..."

  # Create minimal chat version (actual questions would be added manually)
  cat > "$output_file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>$title | TechConcepts</title>
<meta name="description" content="$description">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://techconcepts.org/tools/${tool_key}.html">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>$emoji</text></svg>">

<script async src="https://www.googletagmanager.com/gtag/js?id=G-815E8YDZW8"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-815E8YDZW8', {page_path: '/tools/${tool_key}'});
</script>

<link rel="stylesheet" href="../styles/chat-ui.css">
<script src="../scripts/chat-framework.js"></script>

<style>
  :root { --primary: #1a1a2e; --accent: #e94560; --accent2: #0f3460; --bg: #f8f9fa; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: #2d3436; line-height: 1.6; }
  .hero { background: linear-gradient(135deg, var(--primary) 0%, var(--accent2) 100%); color: white; padding: 60px 24px 48px; text-align: center; }
  .hero h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; }
  .hero .icon { font-size: 3rem; margin-bottom: 16px; }
  .hero p { font-size: 1.1rem; opacity: 0.9; max-width: 600px; margin: 0 auto; }
  .container { max-width: 720px; margin: 0 auto; padding: 0 20px; }
  .back-link { text-align: center; margin: 24px 0; }
  .back-link a { color: var(--accent); text-decoration: none; font-size: 0.9rem; }
  @media (max-width: 600px) { .hero h1 { font-size: 1.6rem; } }
</style>
</head>
<body>

<div class="hero">
  <div class="container">
    <span class="icon">$emoji</span>
    <h1>$title</h1>
    <p>$description</p>
  </div>
</div>

<div class="container">
  <div class="back-link">
    <a href="https://techconcepts.org/tools/">&larr; Back to Tools</a>
  </div>
</div>

<script>
  const chatConfig = {
    title: "$title",
    emoji: "$emoji",
    toolName: "${tool_key}",
    formspreeUrl: "https://formspree.io/f/xpwzgvqr",
    questions: [
      {
        id: 'sample_question',
        type: 'number',
        botMessage: "Sample question - customize this",
        placeholder: "e.g., 100",
        emoji: "$emoji",
        min: 1,
        defaultValue: 100
      }
    ],
    onComplete: (answers, chat) => {
      // TODO: Add calculation logic from original ${tool_key}.html

      chat.showResultsCard([
        { label: 'Sample Result', value: '100', highlight: true }
      ]);

      setTimeout(() => {
        chat.showBotMessage("Customize this recommendation", '💡');
      }, 1000);

      setTimeout(() => {
        chat.showEmailCapture();
      }, 2500);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    new ChatEngine(chatConfig);
  });
</script>

</body>
</html>
EOF

  echo "✅ Created $output_file"
done

echo ""
echo "🎉 Batch conversion complete!"
echo "📝 Note: Each file needs question/calculation customization"
echo "📖 See CHAT-FRAMEWORK-COMPLETE.md for details"
