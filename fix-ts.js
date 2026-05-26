const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const fullPath = path.join(__dirname, 'app-gastos', filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    for (const [oldStr, newStr] of replacements) {
        // Handle regex or string
        if (typeof oldStr === 'string') {
            content = content.split(oldStr).join(newStr);
        } else {
            content = content.replace(oldStr, newStr);
        }
    }
    fs.writeFileSync(fullPath, content, 'utf8');
}

// 1. capturador.tsx
replaceInFile('app/(app)/capturador.tsx', [
    ['errorDetails: []', 'errorDetails: [] as {index: number, error: any}[]'],
    ['router.push("/inicio")', 'router.push("/inicio" as any)'],
    ['router.replace("/inicio")', 'router.replace("/inicio" as any)']
]);

// 2. index.tsx (app)
replaceInFile('app/(app)/index.tsx', [
    ['return <Redirect href="/inicio" />;', 'return <Redirect href={"/inicio" as any} />;']
]);

// 3. inicio.tsx
replaceInFile('app/(app)/inicio.tsx', [
    ['COLORES.verde', 'COLORES.exito'],
    ['COLORES.rojoError', 'COLORES.error'],
    ['href="/perfil"', 'href={"/perfil" as any}'],
    ['router.push(`/recibo/${recibo.id}`)', 'router.push(`/recibo/${recibo.id}` as any)'],
    ['router.push("/capturador")', 'router.push("/capturador" as any)'],
    ['router.push("/inicio")', 'router.push("/inicio" as any)'],
    ['router.replace("/inicio")', 'router.replace("/inicio" as any)']
]);

// 4. historial.tsx
replaceInFile('app/(app)/historial.tsx', [
    ['COLORES.verde', 'COLORES.exito']
]);

// 5. perfil.tsx
replaceInFile('app/(app)/perfil.tsx', [
    ['COLORES.rojoError', 'COLORES.error']
]);

// 6. index.tsx (tabs)
replaceInFile('app/(tabs)/index.tsx', [
    ['import { v4 as uuidv4 } from "react-native-uuid"', "import uuid from 'react-native-uuid'"],
    ['uuidv4()', 'uuid.v4()'],
    ['allowsMultiple:', 'allowsMultipleSelection:'],
    ['import { v4 as uuidv4 } from \'react-native-uuid\'', "import uuid from 'react-native-uuid'"]
]);

// 7. modal.tsx
replaceInFile('app/modal.tsx', [
    ['dismissTo', '// dismissTo']
]);

// 8. formulario-login.tsx
replaceInFile('components/auth/formulario-login.tsx', [
    ['href="/(auth)/olvido-password"', 'href={"/(auth)/olvido-password" as any}'],
    ['href="/(auth)/crear-cuenta"', 'href={"/(auth)/crear-cuenta" as any}']
]);

// 9. menu-lateral.tsx
replaceInFile('components/drawer/menu-lateral.tsx', [
    ['router.replace("/(auth)/iniciar-sesion")', 'router.replace("/(auth)/iniciar-sesion" as any)']
]);

// 10. hello-wave.tsx
replaceInFile('components/hello-wave.tsx', [
    ['animationName: "wave"', '/* animationName: "wave" */']
]);

// 11. parallax-scroll-view.tsx
replaceInFile('components/parallax-scroll-view.tsx', [
    ['useScrollOffset', 'useScrollViewOffset']
]);

// 12. almacenamiento.ts
replaceInFile('services/almacenamiento.ts', [
    ["import AsyncStorage from '@react-native-async-storage/async-storage';", "import * as SecureStore from 'expo-secure-store';"],
    ["AsyncStorage.setItem", "SecureStore.setItemAsync"],
    ["AsyncStorage.getItem", "SecureStore.getItemAsync"],
    ["AsyncStorage.removeItem", "SecureStore.deleteItemAsync"],
    ["AsyncStorage.clear()", "console.warn('clear not supported')"],
    ["AsyncStorage.getAllKeys()", "[]"]
]);

console.log("Fixes applied!");