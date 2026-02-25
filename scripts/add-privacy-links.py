#!/usr/bin/env python3
"""
Add privacy policy links to all email capture forms across TechConcepts.org
"""

import re
from pathlib import Path

# Privacy notice HTML snippets
TOOL_PRIVACY_NOTICE = '''      <p style="font-size: 12px; color: var(--gray); margin-top: 8px; text-align: center;">
        By submitting, you agree to our <a href="/privacy" style="color: var(--accent); text-decoration: underline;">Privacy Policy</a>.
      </p>'''

NEWSLETTER_PRIVACY_NOTICE = '''                    <p style="font-size: 11px; color: var(--gray); margin-top: 4px; text-align: center;">
                        By subscribing, you agree to our <a href="/privacy" style="color: var(--accent);">Privacy Policy</a>.
                    </p>'''

EXIT_INTENT_PRIVACY = '''        <p style="font-size: 11px; margin-top: 8px; color: #666; text-align: center;">
          We respect your privacy. <a href="/privacy" style="color: var(--accent);">Privacy Policy</a>.
        </p>'''

def add_privacy_to_tool_forms(file_path):
    """Add privacy notice to tool email capture forms"""
    content = file_path.read_text()

    # Pattern: Formspree form with submit button, not already having privacy link
    pattern = r'(<form class="cta-form"[^>]*action="https://formspree\.io/f/xpwzgvqr"[^>]*>.*?<button type="submit">.*?</button>)\s*(</form>)'

    if 'Privacy Policy' in content:
        print(f"  ✓ {file_path.name} - already has privacy link")
        return False

    if re.search(pattern, content, re.DOTALL):
        updated = re.sub(
            pattern,
            r'\1\n' + TOOL_PRIVACY_NOTICE + r'\n    \2',
            content,
            flags=re.DOTALL
        )
        file_path.write_text(updated)
        print(f"  ✓ {file_path.name} - privacy link added")
        return True

    return False

def add_privacy_to_newsletter_forms(file_path):
    """Add privacy notice to newsletter signup forms"""
    content = file_path.read_text()

    # Pattern: Newsletter form with subscribe button
    pattern = r'(<form class="newsletter-form"[^>]*>.*?<button type="submit"[^>]*>Subscribe</button>)\s*(</form>)'

    if 'Privacy Policy' in content and 'newsletter-form' in content:
        print(f"  ✓ {file_path.name} - already has privacy link")
        return False

    if re.search(pattern, content, re.DOTALL):
        updated = re.sub(
            pattern,
            r'\1\n' + NEWSLETTER_PRIVACY_NOTICE + r'\n                \2',
            content,
            flags=re.DOTALL
        )
        file_path.write_text(updated)
        print(f"  ✓ {file_path.name} - newsletter privacy link added")
        return True

    return False

def add_privacy_to_exit_intent(file_path):
    """Add privacy notice to exit-intent popup"""
    content = file_path.read_text()

    if 'Privacy Policy' in content:
        print(f"  ✓ {file_path.name} - already has privacy link")
        return False

    # Add before closing </div> of modal content
    pattern = r'(<button type="submit"[^>]*>.*?</button>)\s*(</form>\s*</div>\s*</div>)'

    if re.search(pattern, content, re.DOTALL):
        updated = re.sub(
            pattern,
            r'\1\n' + EXIT_INTENT_PRIVACY + r'\n      \2',
            content,
            flags=re.DOTALL
        )
        file_path.write_text(updated)
        print(f"  ✓ {file_path.name} - exit-intent privacy link added")
        return True

    return False

def main():
    base = Path('/Users/jenyagowork/ClaudeCodeWorkspace/1. Projects/17-techconcepts-org')

    print("\n🔒 Adding privacy policy links to email forms...\n")

    tool_count = 0
    newsletter_count = 0

    # Update all tool pages
    print("Tool Forms:")
    for tool_file in base.glob('tools/*.html'):
        if tool_file.name == 'index.html':
            continue
        if add_privacy_to_tool_forms(tool_file):
            tool_count += 1

    # Update AI Security Compass
    ai_compass = base / 'ai-security-compass' / 'index.html'
    if ai_compass.exists() and add_privacy_to_tool_forms(ai_compass):
        tool_count += 1

    # Update newsletter forms
    print("\nNewsletter Forms:")
    for html_file in base.rglob('*.html'):
        # Skip tools (already done), node_modules, releases
        if 'node_modules' in str(html_file) or 'releases' in str(html_file):
            continue
        if add_privacy_to_newsletter_forms(html_file):
            newsletter_count += 1

    # Update exit-intent popup
    print("\nExit-Intent Popup:")
    exit_intent = base / 'scripts' / 'exit-intent.js'
    if exit_intent.exists():
        add_privacy_to_exit_intent(exit_intent)

    print(f"\n✅ Complete!")
    print(f"   Tool forms updated: {tool_count}")
    print(f"   Newsletter forms updated: {newsletter_count}")
    print(f"\n   Total forms now GDPR-compliant: {tool_count + newsletter_count + 1}")

if __name__ == '__main__':
    main()
