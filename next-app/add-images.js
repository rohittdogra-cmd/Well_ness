const fs = require('fs');
const https = require('https');
const path = require('path');

const files = [
  'src/views/MindfulMeetupPage.tsx',
  'src/views/SocialGatheringPage.tsx',
  'src/views/TaskSharingPage.tsx'
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirect for loremflickr or picsum
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function processFiles() {
  for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Find all blocks like:
    // {
    //   emoji: "...",
    //   name: "Something",
    const regex = /\{\s*emoji: "([^"]+)",\s*name: "([^"]+)",/g;
    
    let match;
    const modifications = [];
    
    while ((match = regex.exec(content)) !== null) {
      const emoji = match[1];
      const name = match[2];
      const matchIndex = match.index;
      const fullMatch = match[0];
      
      // check if it already has an image property just above the emoji
      // by checking the preceding 50 chars
      const preceding = content.substring(Math.max(0, matchIndex - 50), matchIndex);
      if (preceding.includes('image:')) {
        continue; // Already has an image
      }
      
      const slug = slugify(name);
      const imagePath = `/images/activities/${slug}.jpg`;
      const diskPath = path.join(process.cwd(), 'public', imagePath);
      
      console.log(`Downloading image for ${name}...`);
      await downloadImage('https://picsum.photos/800/600', diskPath);
      
      modifications.push({
        index: matchIndex,
        fullMatch: fullMatch,
        replacement: `{\n    image: "${imagePath}",\n    emoji: "${emoji}",\n    name: "${name}",`
      });
    }
    
    // Apply modifications from last to first to not mess up indices
    modifications.sort((a, b) => b.index - a.index);
    for (const mod of modifications) {
      content = content.substring(0, mod.index) + mod.replacement + content.substring(mod.index + mod.fullMatch.length);
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file} with ${modifications.length} images.`);
  }
}

processFiles().catch(console.error);
