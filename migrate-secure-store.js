const fs = require('fs');
const path = require('path');

const files = [
  'app-gastos/context/auth-context.tsx',
  'app-gastos/services/api.service.ts',
  'app-gastos/services/auth.service.ts',
  'app-gastos/services/gastos.service.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace imports
  content = content.replace(/import AsyncStorage from '@react-native-async-storage\/async-storage';/g, "import * as SecureStore from 'expo-secure-store';");
  
  // Replace getItem
  content = content.replace(/AsyncStorage\.getItem/g, 'SecureStore.getItemAsync');
  
  // Replace setItem
  content = content.replace(/AsyncStorage\.setItem/g, 'SecureStore.setItemAsync');
  
  // Replace removeItem
  content = content.replace(/AsyncStorage\.removeItem/g, 'SecureStore.deleteItemAsync');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
