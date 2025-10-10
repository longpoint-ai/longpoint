import { Controller, Get, Res } from '@nestjs/common';
import { type Response } from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';

@Controller()
export class AppController {
  @Get()
  getIndex(@Res() res: Response) {
    try {
      const indexPath = join(__dirname, 'assets', 'index.html');
      const indexHtml = readFileSync(indexPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.send(indexHtml);
    } catch (error) {
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Longpoint</title>
          </head>
          <body>
            <h1>Welcome to Longpoint</h1>
            <p>Web app is being built. Please run the build process first.</p>
            <p>API is available at <a href="/api">/api</a></p>
            <p>Error: ${
              error instanceof Error ? error.message : 'Unknown error'
            }</p>
          </body>
        </html>
      `);
    }
  }
}
