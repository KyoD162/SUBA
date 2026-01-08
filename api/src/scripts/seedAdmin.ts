/**
 * Script para crear el administrador inicial del sistema
 * 
 * IMPORTANTE: Este script solo debe ejecutarse UNA VEZ durante la configuración inicial.
 * Después de crear el primer admin, usar la API protegida para crear más admins.
 * 
 * Uso:
 *   npx ts-node src/scripts/seedAdmin.ts
 * 
 * O añadir al package.json:
 *   "seed:admin": "ts-node src/scripts/seedAdmin.ts"
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { Admin } from '../models/Admin';
import { User } from '../models/User';

// Cargar variables de entorno
dotenv.config();

// Configuración del admin inicial (cambiar estos valores o usar variables de entorno)
const ADMIN_CONFIG = {
  email: process.env.SEED_ADMIN_EMAIL || 'admin@suba.com',
  password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
  name: process.env.SEED_ADMIN_NAME || 'Administrador SUBA',
  phone: process.env.SEED_ADMIN_PHONE || '0412-000-0000',
  department: 'Administración General',
};

async function seedAdmin() {
  console.log('='.repeat(50));
  console.log('SUBA - Seed de Administrador Inicial');
  console.log('='.repeat(50));

  // Conectar a MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/suba';
  console.log(`\n📡 Conectando a MongoDB: ${mongoUri.replace(/\/\/.*@/, '//<credentials>@')}`);

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Conexión exitosa a MongoDB\n');
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  }

  try {
    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Ya existe al menos un administrador en el sistema:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   ID: ${existingAdmin.id}`);
      console.log('\n💡 Si necesitas crear más admins, usa la API con un admin existente.');
      console.log('   POST /api/auth/register/admin (requiere token de admin)');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Verificar si el email ya está en uso
    const existingUser = await User.findOne({ email: ADMIN_CONFIG.email.toLowerCase() });
    if (existingUser) {
      console.error(`❌ El email ${ADMIN_CONFIG.email} ya está en uso por otro usuario.`);
      console.log('   Cambia SEED_ADMIN_EMAIL en las variables de entorno.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Crear el admin
    console.log('📝 Creando administrador inicial...');
    console.log(`   Email: ${ADMIN_CONFIG.email}`);
    console.log(`   Nombre: ${ADMIN_CONFIG.name}`);
    console.log(`   Departamento: ${ADMIN_CONFIG.department}`);

    const admin = await Admin.create({
      email: ADMIN_CONFIG.email.toLowerCase(),
      password: ADMIN_CONFIG.password,
      name: ADMIN_CONFIG.name,
      phone: ADMIN_CONFIG.phone,
      department: ADMIN_CONFIG.department,
      role: 'admin',
    });

    console.log('\n✅ Administrador creado exitosamente!');
    console.log('='.repeat(50));
    console.log('CREDENCIALES DE ACCESO:');
    console.log('='.repeat(50));
    console.log(`📧 Email: ${ADMIN_CONFIG.email}`);
    console.log(`🔑 Contraseña: ${ADMIN_CONFIG.password}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log('='.repeat(50));
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login.');
    console.log('📱 Puedes iniciar sesión desde la app móvil o panel web.\n');

  } catch (error) {
    const err = error as Error & { errors?: Record<string, { message: string }> };
    console.error('❌ Error creando administrador:', err.message);
    if (err.errors) {
      Object.keys(err.errors).forEach(field => {
        console.error(`   - ${field}: ${err.errors![field].message}`);
      });
    }
    await mongoose.disconnect();
    process.exit(1);
  }

  await mongoose.disconnect();
  console.log('📡 Desconectado de MongoDB');
  process.exit(0);
}

// Ejecutar
seedAdmin();
