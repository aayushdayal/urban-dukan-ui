import { ServerRoute, RenderMode } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      const ids = [1, 2, 3, 4, 5]; // Replace with your actual product IDs
      return ids.map(id => ({ id: id.toString() }));
    }
  },

  // Render orders/:id on the server at request time (avoids needing prerender params)
  {
    path: 'orders/:id',
    renderMode: RenderMode.Server
  },

  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
