/**
 * Parameters required for establishing a MySQL connection.
 */
export abstract class AbstractMySqlConfig {
  /** Database server hostname. */
  abstract getHost(): string;
  /** Username for database authentication. */
  abstract getUsername(): string;
  /** Password for database authentication. */
  abstract getPassword(): string;
  /** Name of the database to connect to. */
  abstract getDatabaseName(): string;
  /** Optional SSL configuration for secure connections. */
  abstract useSSL(): boolean;
  /** CA certificate for SSL. */
  abstract getCertificate(): string;
}
