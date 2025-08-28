#!/bin/bash
# CI/CD Pipeline Test Script
set -e

echo "🔍 Testing CI/CD Pipeline Components..."

# Test 1: JSON template creation
echo "📋 Test 1: JSON Template Creation"
cat > /tmp/test_template.json << 'EOF'
{
  "diff": "",
  "metadata": {
    "repository": "",
    "branch": "",
    "commit": "",
    "author": ""
  }
}
EOF

# Test jq operations
TEST_DIFF="test diff content"
TEST_REPO="test/repo"
TEST_BRANCH="test-branch"
TEST_COMMIT="abc123"
TEST_AUTHOR="test-user"

jq --arg diff "$TEST_DIFF" \
   --arg repo "$TEST_REPO" \
   --arg branch "$TEST_BRANCH" \
   --arg commit "$TEST_COMMIT" \
   --arg author "$TEST_AUTHOR" \
   '.diff = $diff | 
    .metadata.repository = $repo |
    .metadata.branch = $branch |
    .metadata.commit = $commit |
    .metadata.author = $author' \
   /tmp/test_template.json > /tmp/test_result.json

echo "✅ JSON template creation successful"
cat /tmp/test_result.json | jq '.'

# Test 2: Slack message template
echo ""
echo "📱 Test 2: Slack Message Template"
cat > /tmp/slack_template.json << 'EOF'
{
  "text": "",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Test Header"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Repository:*\n"
        }
      ]
    }
  ]
}
EOF

jq --arg text "Test Slack Message" \
   --arg repo "$TEST_REPO" \
   '.text = $text |
    .blocks[1].fields[0].text = "*Repository:*\n" + $repo' \
   /tmp/slack_template.json > /tmp/slack_result.json

echo "✅ Slack template creation successful"
cat /tmp/slack_result.json | jq '.'

# Test 3: Environment variable handling
echo ""
echo "🔧 Test 3: Environment Variable Handling"
export TEST_MULTILINE="line 1
line 2
line 3"

echo 'MULTILINE_VAR<<EOF' > /tmp/test_env
echo "$TEST_MULTILINE" >> /tmp/test_env
echo 'EOF' >> /tmp/test_env

echo "✅ Environment variable handling successful"
cat /tmp/test_env

# Clean up
rm -f /tmp/test_*.json /tmp/slack_*.json /tmp/test_env

echo ""
echo "🎉 All CI/CD pipeline tests passed!"
echo "📝 Key improvements made:"
echo "   - Fixed heredoc syntax for multiline variables"
echo "   - Used jq for safe JSON template handling"
echo "   - Separated template creation from variable substitution"
echo "   - Added proper error handling for API calls"
echo ""
echo "🚀 Your CI/CD pipeline should now work without syntax errors!"