const fs = require('fs');
const files = [
  'app/(app)/capturador.tsx',
  'app/(app)/inicio.tsx',
  'components/auth/formulario-login.tsx',
  'components/drawer/menu-lateral.tsx'
];
files.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf8');
    // router.push
    content = content.replace(/router\.push\(['"](.*?)['"]\)/g, "router.push('$1' as any)");
    content = content.replace(/router\.push\(\`(.*?)\`\)/g, "router.push(`$1` as any)");
    // router.replace
    content = content.replace(/router\.replace\(['"](.*?)['"]\)/g, "router.replace('$1' as any)");
    // href="..."
    content = content.replace(/href=(['"])(.*?)\1/g, "href={'$2' as any}");
    fs.writeFileSync(f, content);
  } catch (e) {
    console.log("Error processing", f, e);
  }
});
console.log('Done!');