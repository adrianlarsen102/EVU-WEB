import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');

    // Check if CHANGELOG.md exists
    if (!fs.existsSync(changelogPath)) {
      return res.status(200).json({ releases: [] });
    }

    const changelogContent = fs.readFileSync(changelogPath, 'utf-8');
    const releases = parseChangelog(changelogContent);

    res.status(200).json({ releases });
  } catch (error) {
    console.error('Error reading CHANGELOG.md:', error);
    res.status(500).json({ error: 'Failed to read changelog' });
  }
}

function parseChangelog(content) {
  const releases = [];
  const lines = content.split('\n');

  let currentRelease = null;
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match version headers:
    // - "## [2.0.0] - 2025-10-06"
    // - "### 2.0.1 (2025-10-06)"
    // - "### [2.1.1](https://github.com/...) (2025-10-06)"
    const versionMatch = line.match(/^###?\s+\[?(\d+\.\d+\.\d+)\]?(?:\([^)]*\))?\s*[-–—(]*\s*(\d{4}-\d{2}-\d{2})/);

    if (versionMatch) {
      // Save previous release
      if (currentRelease) {
        releases.push(currentRelease);
      }

      // Start new release
      currentRelease = {
        version: versionMatch[1],
        date: versionMatch[2],
        features: [],
        fixes: [],
        improvements: [],
        performance: [],
        refactoring: [],
        documentation: [],
        other: []
      };
      currentSection = null;
      continue;
    }

    if (!currentRelease) continue;

    // Match section headers (### Features, ### Bug Fixes, etc.)
    // Only match if it doesn't look like a version header (no date pattern)
    if (line.startsWith('###') && !line.match(/\d{4}-\d{2}-\d{2}/)) {
      const sectionTitle = line.replace(/^###\s*/, '').toLowerCase();

      if (sectionTitle.includes('feature')) {
        currentSection = 'features';
      } else if (sectionTitle.includes('fix')) {
        currentSection = 'fixes';
      } else if (sectionTitle.includes('improvement')) {
        currentSection = 'improvements';
      } else if (sectionTitle.includes('performance')) {
        currentSection = 'performance';
      } else if (sectionTitle.includes('refactor')) {
        currentSection = 'refactoring';
      } else if (sectionTitle.includes('documentation') || sectionTitle.includes('docs')) {
        currentSection = 'documentation';
      } else {
        currentSection = 'other';
      }
      continue;
    }

    // Match list items
    if (line.startsWith('-') || line.startsWith('*')) {
      const item = line.replace(/^[-*]\s*/, '').trim();
      if (item && currentSection && currentRelease[currentSection]) {
        currentRelease[currentSection].push(item);
      }
      continue;
    }
  }

  // Save last release
  if (currentRelease) {
    releases.push(currentRelease);
  }

  return releases;
}