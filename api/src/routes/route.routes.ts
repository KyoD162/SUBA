import { Router } from 'express';

import { Route } from '../models/Route';

export const routeRouter = Router();

// Get all routes
routeRouter.get('/', async (_req, res, next) => {
  try {
    const routes = await Route.find({ isActive: true }).select('-locationHistory');
    res.json({ routes });
  } catch (error) {
    next(error);
  }
});

// Get single route by routeId
routeRouter.get('/:routeId', async (req, res, next) => {
  try {
    const route = await Route.findOne({ routeId: req.params.routeId });
    if (!route) {
      res.status(404).json({ message: 'Route not found' });
      return;
    }
    res.json({ route });
  } catch (error) {
    next(error);
  }
});

// Seed default routes (admin only - for development)
routeRouter.post('/seed', async (_req, res, next) => {
  try {
    const defaultRoutes = [
      {
        routeId: 'A1',
        name: 'Ruta A1 - Unare Centro',
        description: 'Ruta principal desde Unare hasta La Ceiba',
        color: '#1976D2',
        priceUSD: 0.5,
        frequency: '5-10 min',
        estimatedDuration: 25,
        distance: 8.5,
        stops: [
          { id: 'a1-1', name: 'Terminal Unare', lat: 8.3005, lng: -62.7343, order: 0 },
          { id: 'a1-2', name: 'Av. Principal', lat: 8.2950, lng: -62.7380, order: 1 },
          { id: 'a1-3', name: 'Plaza Alta Vista', lat: 8.2869, lng: -62.7442, order: 2 },
          { id: 'a1-4', name: 'CC Villa Asia', lat: 8.2830, lng: -62.7301, order: 3 },
          { id: 'a1-5', name: 'Parque Castillito', lat: 8.2880, lng: -62.7195, order: 4 },
          { id: 'a1-6', name: 'La Ceiba', lat: 8.2920, lng: -62.7100, order: 5 },
        ],
      },
      {
        routeId: 'B5',
        name: 'Ruta B5 - Alta Vista',
        description: 'Ruta rápida por Alta Vista',
        color: '#4CAF50',
        priceUSD: 0.75,
        frequency: '3-5 min',
        estimatedDuration: 20,
        distance: 6.2,
        stops: [
          { id: 'b5-1', name: 'Casa de la Cultura', lat: 8.2900, lng: -62.7500, order: 0 },
          { id: 'b5-2', name: 'Av. Las Américas', lat: 8.2870, lng: -62.7450, order: 1 },
          { id: 'b5-3', name: 'Plaza Bolívar', lat: 8.2840, lng: -62.7400, order: 2 },
          { id: 'b5-4', name: 'Centro Comercial', lat: 8.2810, lng: -62.7350, order: 3 },
          { id: 'b5-5', name: 'Chacao', lat: 8.2780, lng: -62.7300, order: 4 },
        ],
      },
      {
        routeId: 'C3',
        name: 'Ruta C3 - San Félix',
        description: 'Conexión con San Félix',
        color: '#0D47A1',
        priceUSD: 0.6,
        frequency: '8-12 min',
        estimatedDuration: 35,
        distance: 12.0,
        stops: [
          { id: 'c3-1', name: 'Terminal Puerto Ordaz', lat: 8.2856, lng: -62.7453, order: 0 },
          { id: 'c3-2', name: 'Puente Angostura', lat: 8.3100, lng: -62.7000, order: 1 },
          { id: 'c3-3', name: 'Entrada San Félix', lat: 8.3300, lng: -62.6700, order: 2 },
          { id: 'c3-4', name: 'Terminal San Félix', lat: 8.3530, lng: -62.6505, order: 3 },
        ],
      },
      {
        routeId: 'D2',
        name: 'Ruta D2 - Villa Asia',
        description: 'Ruta local Villa Asia',
        color: '#A9D6E5',
        priceUSD: 0.55,
        frequency: '6-8 min',
        estimatedDuration: 18,
        distance: 5.0,
        stops: [
          { id: 'd2-1', name: 'Villa Asia Norte', lat: 8.2850, lng: -62.7320, order: 0 },
          { id: 'd2-2', name: 'CC Villa Asia', lat: 8.2830, lng: -62.7301, order: 1 },
          { id: 'd2-3', name: 'Plaza Villa Asia', lat: 8.2800, lng: -62.7280, order: 2 },
          { id: 'd2-4', name: 'Centro', lat: 8.2770, lng: -62.7250, order: 3 },
        ],
      },
    ];

    for (const routeData of defaultRoutes) {
      await Route.findOneAndUpdate(
        { routeId: routeData.routeId },
        routeData,
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Routes seeded successfully', count: defaultRoutes.length });
  } catch (error) {
    next(error);
  }
});
