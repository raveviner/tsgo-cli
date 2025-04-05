import morgan from 'morgan';

export const createLogger = (appName: string) => {
  morgan.token('app-name', () => appName);
  morgan.format('custom', `[:app-name][:date[iso]] :method :url :status :response-time ms`);
  return morgan('custom');
}