import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import nock from 'nock';
import cmd from '../src/index.js';

const address = 'https://vault.test.tld';
const username = 'testuser';
const password = 'testpassword';
const secretPath = 'secretPath';
const secretKey = 'secretKey';
describe('vault-read with arguments', () => {
  let stdOut: string[];

  beforeEach(() => {
    stdOut = [];
    vi.spyOn(process.stdout, 'write')
      .mockImplementation((val) => { stdOut.push(val as string); return true; });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    nock.cleanAll();
  });

  // Test without any arguments
  it('Error for missing vault address', async () => {
    try {
      await cmd.run([secretPath]);
    } catch (err) {
      expect((err as Error).message).toContain('CI_VAULT_ADDRESS');
    }
  });

  it('Error for missing vault user or password, with missing user/pass', async () => {
    try {
      await cmd.run([secretPath, '-a', address]);
    } catch (err) {
      expect((err as Error).message).toMatch(/.*CI_VAULT_USER.*/);
    }
  });

  it('Error for missing vault user or password, with missing username', async () => {
    try {
      await cmd.run([secretPath, '-a', address, '-p', password]);
    } catch (err) {
      expect((err as Error).message).toMatch(/.*CI_VAULT_USER.*/);
    }
  });

  it('Error for missing vault user or password, with missing password', async () => {
    try {
      await cmd.run([secretPath, '-a', address, '-u', username]);
    } catch (err) {
      expect((err as Error).message).toMatch(/.*CI_VAULT_USER.*/);
    }
  });

  it('Fail for unauthorized', async () => {
    const scope = nock(address)
      .post(`/v1/auth/ldap/login/${username}`)
      .reply(401);

    try {
      await cmd.run(['-u', username, '-p', password, '-a', address, secretPath, secretKey]);
    } catch (err) {
      expect((err as Error).message).toMatch(/.*401.*/);
      expect(scope.isDone()).toBeTruthy();
    }
  });

  it('Prints successful result with key', async () => {
    const scope = nock(address)
      .post(`/v1/auth/ldap/login/${username}`)
      // user is logged in, return their name
      .reply(200, { token: 'dasdae3wq412edasda' })
      .get(`/v1/${secretPath}`)
      .reply(200, { data: { secretKey: 'result' } });

    await cmd.run(['-u', username, '-p', password, '-a', address, secretPath, secretKey]);

    expect(scope.isDone()).toBeTruthy();
    expect(stdOut).toHaveLength(1);
    expect(stdOut[0]).not.toContain(secretKey);
    expect(stdOut[0]).toContain('result');
  });

  it('Prints successful result with wrong key', async () => {
    const scope = nock(address)
      .post(`/v1/auth/ldap/login/${username}`)
      // user is logged in, return their name
      .reply(200, { token: 'dasdae3wq412edasda' })
      .get(`/v1/${secretPath}`)
      .reply(200, { data: { secretKey: 'result' } });

    try {
      await cmd.run(['-u', username, '-p', password, '-a', address, secretPath, 'wrongKey']);
    } catch (err) {
      expect((err as Error).message).toContain("'wrongKey' is not available in result set.");
      expect(scope.isDone()).toBeTruthy();
    }
  });

  it('Prints successful result without key', async () => {
    const scope = nock(address)
      .post(`/v1/auth/ldap/login/${username}`)
      // user is logged in, return their name
      .reply(200, { token: 'dasdae3wq412edasda' })
      .get(`/v1/${secretPath}`)
      .reply(200, { data: { secretKey: 'result' } });

    await cmd.run(['-u', username, '-p', password, '-a', address, secretPath]);

    expect(scope.isDone()).toBeTruthy();
    expect(stdOut).toHaveLength(1);
    expect(stdOut[0]).toContain(secretKey);
    expect(stdOut[0]).toContain('result');
  });
});
