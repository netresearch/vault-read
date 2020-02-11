vault-read
==========

Read and print secrets from Hashicorp Vault

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/vault-read.svg)](https://npmjs.org/package/vault-read)
[![Downloads/week](https://img.shields.io/npm/dw/vault-read.svg)](https://npmjs.org/package/vault-read)
[![License](https://img.shields.io/npm/l/vault-read.svg)](https://github.com/netresearch/vault-read/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g vault-read
$ vault-read [-u|--username Vault user] [-p|--password Vault password] [-a|--address Vault address] PATH [KEY]
$ vault-read (-v|--version|version)
vault-read/0.0.0 linux-x64 node-v10.16.3
$ vault-read --help
Read secrets from the vault

USAGE
  $ vault-read PATH [KEY]

ARGUMENTS
  PATH  Path from which to read the secret
  KEY   Specific key from the data store in the path

OPTIONS
  -a, --address=address    The Vault url, alternatively provide CI_VAULT_ADDRESS env variable
  -h, --help               show CLI help
  -p, --password=password  The LDAP password for Vault, alternatively provide CI_VAULT_PASSORD env variable
  -u, --username=username  The LDAP username for Vault, alternatively provide CI_VAULT_USER env variable
  -v, --version            show CLI version
```
<!-- usagestop -->
# Commands
<!-- commands -->

<!-- commandsstop -->
