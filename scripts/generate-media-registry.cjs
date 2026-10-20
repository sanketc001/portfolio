const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const portfolioDataPath = path.join(projectRoot, 'src/data/portfolioData.json');

// Helper to format file sizes
function getFileSizeString(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  } catch {
    return 'Unknown';
  }
}

// Read existing portfolio data
let portfolioData = {};
let eol = '\n';
try {
  const raw = fs.readFileSync(portfolioDataPath, 'utf8');
  // Keep the file's existing line endings so a build does not rewrite every line.
  if (raw.includes('\r\n')) eol = '\r\n';
  portfolioData = JSON.parse(raw);
} catch (e) {
  console.error('Error reading portfolioData.json:', e);
  process.exit(1);
}

// Keep track of external URLs from the configuration
// Any folder may be missing or empty; treat missing keys as empty lists.
const currentMedia = portfolioData.mediaGallery || {};
const isExternal = item => item && typeof item.url === 'string' && /^https?:\/\//.test(item.url);
const keepExternal = key => (Array.isArray(currentMedia[key]) ? currentMedia[key] : []).filter(isExternal);
const externalMedia = {
  documents: keepExternal('documents'),
  pictures: keepExternal('pictures'),
  music: keepExternal('music'),
  videos: keepExternal('videos')
};

// Stable id derived from the file path, so rebuilding does not churn the JSON.
function stableId(prefix, fileUrl) {
  let hash = 0;
  for (let i = 0; i < fileUrl.length; i++) {
    hash = (hash * 31 + fileUrl.charCodeAt(i)) >>> 0;
  }
  return `${prefix}-auto-${hash.toString(36)}`;
}

// Scan folders and merge with external links
const newMedia = {
  documents: [...externalMedia.documents],
  pictures: [...externalMedia.pictures],
  music: [...externalMedia.music],
  videos: [...externalMedia.videos]
};

// Check if Resume.pdf exists directly in public/
const resumePath = path.join(projectRoot, 'public/Resume.pdf');
if (fs.existsSync(resumePath)) {
  newMedia.documents.push({
    id: 'doc-resume-auto',
    name: 'Resume.pdf',
    url: 'Resume.pdf',
    size: getFileSizeString(resumePath)
  });
}

const folders = [
  { key: 'documents', folderName: 'documents', prefix: 'doc' },
  { key: 'pictures', folderName: 'pictures', prefix: 'pic' },
  { key: 'music', folderName: 'music', prefix: 'mus' },
  { key: 'videos', folderName: 'videos', prefix: 'vid' }
];

folders.forEach(({ key, folderName, prefix }) => {
  const dirPath = path.join(projectRoot, 'public', folderName);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath).sort();
    files.forEach(file => {
      // Ignore hidden files / system files
      if (file.startsWith('.')) return;
      
      const filePath = path.join(dirPath, file);
      const isDir = fs.statSync(filePath).isDirectory();
      if (isDir) return;

      const size = getFileSizeString(filePath);
      const fileUrl = `${folderName}/${file}`;
      
      // Prevent duplicates
      if (newMedia[key].some(item => item.url === fileUrl)) return;

      newMedia[key].push({
        id: stableId(prefix, fileUrl),
        name: file,
        url: fileUrl,
        size: size
      });
    });
  }
});

// Update portfolioData
portfolioData.mediaGallery = newMedia;

// Write back to src/data/portfolioData.json
fs.writeFileSync(portfolioDataPath, (JSON.stringify(portfolioData, null, 2) + '\n').replace(/\n/g, eol), 'utf8');
console.log('Successfully scanned physical folders and synchronized src/data/portfolioData.json.');
