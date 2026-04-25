const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /\bSecure Terminal\b/g, replacement: 'Support Portal' },
  { regex: /\bOperational Anomaly\b/g, replacement: 'Issue Report' },
  { regex: /\bCore Intelligence\b/g, replacement: 'Core Information' },
  { regex: /\bLogistical Context\b/g, replacement: 'Location Context' },
  { regex: /\bIntelligence Narrative\b/g, replacement: 'Additional Details' },
  { regex: /\bSubmission Protocol\b/g, replacement: 'Submission Guide' },
  { regex: /\bdispatch matrix\b/g, replacement: 'dispatch system' },
  { regex: /\bresolution velocity\b/g, replacement: 'resolution time' },
  { regex: /\bGlobal Network\b/g, replacement: 'Campus Network' },
  { regex: /\binfrastructure monitoring\b/g, replacement: 'facility monitoring' },
  { regex: /\bFacilities Management Interface\b/g, replacement: 'Facilities Management' },
  { regex: /\bStrategic Search\b/g, replacement: 'Search' },
  { regex: /\bPhysical Building\b/g, replacement: 'Building' },
  { regex: /\bReset Matrix\b/g, replacement: 'Clear Filters' },
  { regex: /\bRegistry Archive Empty\b/g, replacement: 'No Records Found' },
  { regex: /\bNode Synchronized\b/g, replacement: 'Last Updated' },
  { regex: /\bView Dossier\b/g, replacement: 'View Details' },
  { regex: /\bDossier\b/g, replacement: 'Record' },
  { regex: /\bdossier\b/g, replacement: 'record' },
  { regex: /\bdossiers\b/g, replacement: 'records' },
  { regex: /\bDossiers\b/g, replacement: 'Records' },
  { regex: /\bMatrix\b/g, replacement: 'System' },
  { regex: /\bmatrix\b/g, replacement: 'system' },
  { regex: /\bTerminal\b/g, replacement: 'Portal' },
  { regex: /\bterminal\b/g, replacement: 'portal' },
  { regex: /\bRegistry\b/g, replacement: 'Directory' },
  { regex: /\bregistry\b/g, replacement: 'directory' },
  { regex: /\bSynchronized\b/g, replacement: 'Updated' },
  { regex: /\bsynchronize\b/g, replacement: 'update' },
  { regex: /\bsynchronizing\b/g, replacement: 'updating' },
  { regex: /\bSector\b/g, replacement: 'Location' },
  { regex: /\bsector\b/g, replacement: 'location' },
  { regex: /\bSectors\b/g, replacement: 'Locations' },
  { regex: /\bsectors\b/g, replacement: 'locations' },
  { regex: /\bDecommission\b/g, replacement: 'Delete' },
  { regex: /\bDecommissioning\b/g, replacement: 'Deleting' },
  { regex: /\bdecommission\b/g, replacement: 'delete' },
  { regex: /\bdecommissioning\b/g, replacement: 'deleting' },
  { regex: /\bAnomaly\b/g, replacement: 'Issue' },
  { regex: /\banomaly\b/g, replacement: 'issue' },
  { regex: /\bProtocol\b/g, replacement: 'Procedure' },
  { regex: /\bprotocol\b/g, replacement: 'procedure' },
  { regex: /\bPax\b/g, replacement: 'People' }
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const targetDirs = [
  path.join(__dirname, 'campus-client/src/pages'),
  path.join(__dirname, 'campus-client/src/components')
];

let changedFiles = 0;

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = walkDir(dir);
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      changedFiles++;
      console.log(`Updated ${file}`);
    }
  });
});

console.log(`Done! Modified ${changedFiles} files.`);
