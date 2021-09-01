import Command, { flags as Flag } from '@oclif/command';
import { args as Argument } from '@oclif/parser/lib';
import * as NodeVault from 'node-vault';

class VaultRead extends Command {
  static description = 'Read secrets from the vault';

  static flags = {
    // add --version flag to show CLI version
    version: Flag.version({ char: 'v' }),
    help: Flag.help({ char: 'h' }),
    username: Flag.string(
      { char: 'u', description: 'The LDAP username for Vault, alternatively provide CI_VAULT_USER env variable' },
    ),
    password: Flag.string(
      { char: 'p', description: 'The LDAP password for Vault, alternatively provide CI_VAULT_PASSWORD env variable' },
    ),
    address: Flag.string(
      { char: 'a', description: 'The Vault url, alternatively provide CI_VAULT_ADDRESS env variable' },
    ),
  };

  static args: Argument.IArg[] = [
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
    const { args, flags } = this.parse(VaultRead);
    const username = flags.username || process.env.CI_VAULT_USER as string || false;
    const password = flags.password || process.env.CI_VAULT_PASSWORD as string || false;
    const address = flags.address || process.env.CI_VAULT_ADDRESS as string || false;

    if (!address) {
      this.error(
        'No vault address provided as flag or via CI_VAULT_ADDRESS environment variable.',
        { exit: 1 },
      );
    }

    if (!username || !password) {
      this.error(
        'Please provide username and password either as flags or via CI_VAULT_USER and CI_VAULT_PASSWORD environment variables.',
        { exit: 1 },
      );
    }

    const vault = NodeVault({
      endpoint: address as string,
    });

    try {
      await vault.ldapLogin({ username, password });
      const response = await vault.read(args.path);
      this.log(
        VaultRead.parseSecret(response, args.key),
      );
    } catch (err) {
      this.error((err as Error), { exit: 1 });
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
}

export = VaultRead;
