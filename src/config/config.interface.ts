export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

export interface MailgunConfig {
  apiKey: string;
  domain: string;
  fromEmail: string;
  fromName: string;
}

export interface Config {
  database: DatabaseConfig;
  jwt: JwtConfig;
  app: AppConfig;
  mailgun: MailgunConfig;
}
