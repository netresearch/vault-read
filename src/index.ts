import Command, { flags } from '@oclif/command'
import { args } from '@oclif/parser/lib'
import * as NodeVault from 'node-vault'

class VaultRead extends Command {
  static description = 'Read secrets from the vault';

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    username: flags.string({ char: 'u', description: 'ldap username to login' }),
    password: flags.string({ char: 'p', description: 'ldap password' }),
    address: flags.string({ char: 'a', description: 'vault address' }),
  };

  static args: args.IArg[] = [
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

  async run() {
    const { args, flags } = this.parse(VaultRead);
    const username = flags.username || process.env.CI_VAULT_USER as string || false;
    const password = flags.password || process.env.CI_VAULT_PASSWORD as string || false;
    const address = flags.address || process.env.CI_VAULT_ADDRESS as string || false;

    if (!address) {
      this.error(
        'No vault address provided as flag or via CI_VAULT_ADDRESS environment variable.',
        { exit: 1 }
      );
    }

    if (!(username && password)) {
      this.error(
        'Please provide username and password either as flags or via CI_VAULT_USER and CI_VAULT_PASSWORD environment variables.',
        { exit: 1 }
      );
    }

    const vault = NodeVault({
      endpoint: address as string,
    });
    try {

      await vault.ldapLogin({ username, password });
      let response = await vault.read(args.path)
      this.parseSecret(response, args.key)
    } catch (error) {
      this.error(error, { exit: 1 });
    };
  }

  private parseSecret(response: { data: { [p: string]: string } }, key: string) {
    if (key === '') {
      this.log(JSON.stringify(response.data))
    } else {
      if (!response.data[key]) {
        this.error(`Searched key '${key}' is not available in result set.`, { exit: 1 });
      }
      this.log(response.data[key] as string)
    }
  }
}

export = VaultRead
