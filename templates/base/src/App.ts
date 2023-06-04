import express from 'express';

export class App {
  private app: express.Application;

  constructor() {
    this.app = express();
  }

  private configureRoutes(): void {
    this.app.get('/', (req, res) => {
      res.send('Hello, World!');
    });
  }

  public start(): void {
    this.configureRoutes();
    this.app.listen(3000, () => {
      console.log('Server started on port 3000');
    });
  }
}