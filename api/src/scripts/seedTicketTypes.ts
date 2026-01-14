import path from 'path';

import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { TicketType } from '../models/TicketType';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const defaultTicketTypes = [
  {
    name: 'Viaje Sencillo',
    description: 'Un solo viaje en cualquier ruta de SUBA. Perfecto para viajes ocasionales.',
    category: 'single',
    price: 0.50,
    usageLimit: 1,
    durationMinutes: null,
    color: '#0891B2',
    icon: 'ticket',
    isActive: true
  },
  {
    name: 'Pack 5 Viajes',
    description: 'Paquete de 5 viajes con un 10% de descuento. Ideal para uso semanal.',
    category: 'multi',
    price: 2.25, // 10% discount from 2.50
    usageLimit: 5,
    durationMinutes: null,
    color: '#059669',
    icon: 'layers',
    isActive: true
  },
  {
    name: 'Pack 10 Viajes',
    description: 'Paquete de 10 viajes con un 15% de descuento. La mejor opción para uso regular.',
    category: 'multi',
    price: 4.25, // 15% discount from 5.00
    usageLimit: 10,
    durationMinutes: null,
    color: '#7C3AED',
    icon: 'layers',
    isActive: true
  },
  {
    name: 'Pase Diario',
    description: 'Viajes ilimitados durante 24 horas. Viaja todo lo que necesites por un día.',
    category: 'time_based',
    price: 2.00,
    usageLimit: null, // unlimited
    durationMinutes: 1440, // 24 hours
    color: '#EA580C',
    icon: 'sunny',
    isActive: true
  },
  {
    name: 'Pase Semanal',
    description: 'Viajes ilimitados durante 7 días. La mejor opción para usuarios frecuentes.',
    category: 'time_based',
    price: 10.00,
    usageLimit: null,
    durationMinutes: 10080, // 7 days
    color: '#2563EB',
    icon: 'calendar',
    isActive: true
  },
  {
    name: 'Pase Mensual',
    description: 'Viajes ilimitados durante 30 días. Máximo ahorro para usuarios diarios.',
    category: 'time_based',
    price: 35.00,
    usageLimit: null,
    durationMinutes: 43200, // 30 days
    color: '#DB2777',
    icon: 'infinite',
    isActive: true
  }
];

async function seedTicketTypes() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI no está definido en las variables de entorno');
    process.exit(1);
  }

  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Check if ticket types already exist
    const existingCount = await TicketType.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️  Ya existen ${existingCount} tipos de tickets en la base de datos`);
      const overwrite = process.argv.includes('--force');
      
      if (overwrite) {
        console.log('🗑️  Eliminando tipos de tickets existentes...');
        await TicketType.deleteMany({});
      } else {
        console.log('💡 Use --force para sobrescribir los tipos de tickets existentes');
        await mongoose.disconnect();
        return;
      }
    }

    console.log('📝 Creando tipos de tickets predeterminados...');
    
    for (const ticketType of defaultTicketTypes) {
      const created = await TicketType.create(ticketType);
      console.log(`  ✓ ${created.name} - $${created.price} (${created.category})`);
    }

    console.log(`\n✅ Se crearon ${defaultTicketTypes.length} tipos de tickets exitosamente!`);
    
    // Show summary
    console.log('\n📊 Resumen de tipos de tickets:');
    const byCategory = {
      single: defaultTicketTypes.filter(t => t.category === 'single').length,
      multi: defaultTicketTypes.filter(t => t.category === 'multi').length,
      time_based: defaultTicketTypes.filter(t => t.category === 'time_based').length,
    };
    console.log(`  - Uso único: ${byCategory.single}`);
    console.log(`  - Múltiples usos: ${byCategory.multi}`);
    console.log(`  - Por tiempo: ${byCategory.time_based}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

seedTicketTypes();
