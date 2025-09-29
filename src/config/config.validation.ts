export function validate(config: Record<string, unknown>) {
  // Basic validation for required environment variables
  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
  ];

  const missingVars = requiredVars.filter((varName) => !config[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
  }

  // Validate port numbers
  const portVars = ['DB_PORT', 'PORT'];
  for (const varName of portVars) {
    if (config[varName]) {
      const port = parseInt(String(config[varName]), 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`${varName} must be a valid port number (1-65535)`);
      }
    }
  }

  // Validate NODE_ENV
  if (
    config.NODE_ENV &&
    !['development', 'production', 'test'].includes(String(config.NODE_ENV))
  ) {
    throw new Error('NODE_ENV must be one of: development, production, test');
  }

  return config;
}
