import { Command, Flags } from '@oclif/core';
import * as NodeVault from 'node-vault';

class VaultRead extends Command {
  static description = 'Read secrets from the vault';

  static flags = {
    // add --version flag to show CLI version
    version: Flags.version({ char: 'v' }),
    help: Flags.help({ char: 'h' }),
    username: Flags.string(
      { char: 'u', description: 'The LDAP username for Vault, alternatively provide CI_VAULT_USER env variable' },
    ),
    password: Flags.string(
      { char: 'p', description: 'The LDAP password for Vault, alternatively provide CI_VAULT_PASSWORD env variable' },
    ),
    address: Flags.string(
      { char: 'a', description: 'The Vault url, alternatively provide CI_VAULT_ADDRESS env variable' },
    ),
  };

  static args = [
    {
      name: 'path',
      description: 'Path from which to read the secret',
      required: true,
    },
    {
      name: 'key',
      description: 'Specific key from the data store in the path',
      default: '',
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(VaultRead);
    const username = flags.username || process.env.CI_VAULT_USER || '';
    const password = flags.password || process.env.CI_VAULT_PASSWORD || '';
    const address = flags.address || process.env.CI_VAULT_ADDRESS || '';

    if (!address || address.trim() === '') {
      this.error(
        'No vault address provided as flag or via CI_VAULT_ADDRESS environment variable.',
        { exit: 1 },
      );
    }

    if (!username || username.trim() === '' || !password || password.trim() === '') {
      this.error(
        'Please provide username and password either as flags or via CI_VAULT_USER and CI_VAULT_PASSWORD environment variables.',
        { exit: 1 },
      );
    }

    const vault = NodeVault({
      endpoint: address,
    });

    try {
      await vault.ldapLogin({ username, password });
      const response = await vault.read(args.path);
      this.log(
        VaultRead.parseSecret(response, args.key),
      );
    } catch (err) {
      const sanitizedError = VaultRead.sanitizeError(err as Error);
      this.error(sanitizedError, { exit: 1 });
    }
  }

  private static parseSecret(response: { data: { [p: string]: string } }, key: string): string {
    if (key === '') {
      return JSON.stringify(response.data);
    }
    if (!response.data[key]) {
      throw new Error(`Searched key '${key}' is not available in result set.`);
    } else {
      return (response.data[key] as string);
    }
  }

  private static sanitizeError(error: Error): string {
    const { message } = error;

    const sensitivePatterns = [
      /token["\s]*[:=]["\s]*[a-zA-Z0-9_-]+/gi,
      /password["\s]*[:=]["\s]*[^\s"]+/gi,
      /secret["\s]*[:=]["\s]*[^\s"]+/gi,
      /key["\s]*[:=]["\s]*[^\s"]+/gi,
      /auth["\s]*[:=]["\s]*[^\s"]+/gi,
    ];

    let sanitized = message;

    sensitivePatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, (match) => {
        const parts = match.split(/[:=]/);
        return parts.length > 1 ? `${parts[0]}=[REDACTED]` : '[REDACTED]';
      });
    });

    if (message.includes('401') && message.includes('Unauthorized')) {
      return '401 (Unauthorized) - Invalid credentials provided';
    }

    if (message.includes('403') && message.includes('Forbidden')) {
      return '403 (Forbidden) - Access denied to the requested resource';
    }

    if (message.includes('404') && message.includes('Not Found')) {
      return '404 (Not Found) - The requested path does not exist';
    }

    return sanitized;
  }
}

export = VaultRead;
