#!/usr/bin/env node

/**
 * Script para generar claves JWT seguras
 * Uso: node generate-jwt-secrets.js
 */

const crypto = require('crypto');

console.log('\n=== Generador de Claves JWT Seguras ===\n');
console.log('Copia estas claves a tu archivo .env:\n');

const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);

console.log('\n⚠️  IMPORTANTE:');
console.log('1. Guarda estas claves en un lugar seguro');
console.log('2. NUNCA las compartas o subas a repositorios públicos');
console.log('3. Usa claves diferentes para desarrollo y producción');
console.log('4. Si comprometes estas claves, genera nuevas inmediatamente\n');
