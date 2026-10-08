#!/usr/bin/env node
/**
 * Create, update or deactivate an account.
 *
 * Accounts are provisioned by hand -- there is no registration endpoint -- so
 * this is the supported way to do it.
 *
 * Passwords are NEVER taken from a file or from argv. argv would land the
 * credential in shell history and in the process list where any other user on
 * the box can read it; a file risks being committed, which is exactly how this
 * project's original seed password ended up readable in git history. This
 * script prompts with echo suppressed, or reads USER_PASSWORD from the
 * environment when it needs to run unattended.
 *
 * Usage:
 *   node scripts/manage-user.js <email> --role admin --name "Full Name"
 *   node scripts/manage-user.js <email> --role viewer
 *   node scripts/manage-user.js <email> --deactivate
 *
 * Flags:
 *   --role <admin|operator|viewer>  role to set (default: viewer when creating)
 *   --name "<display name>"         display name, used when creating
 *   --deactivate                    set is_active = false, change nothing else
 *   --keep-password                 update role/name only, leave the password alone
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');
const { pool } = require('../config/database');

const VALID_ROLES = ['admin', 'operator', 'viewer'];
const BCRYPT_COST = 10; // matches the existing hashes in this database

function parseArgs(argv) {
  const args = { email: null, role: null, name: null, deactivate: false, keepPassword: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--role') {
      i += 1;
      args.role = argv[i];
    } else if (arg === '--name') {
      i += 1;
      args.name = argv[i];
    } else if (arg === '--deactivate') {
      args.deactivate = true;
    } else if (arg === '--keep-password') {
      args.keepPassword = true;
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown flag: ${arg}`);
    } else if (!args.email) {
      args.email = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  if (!args.email) throw new Error('Email is required');
  if (args.role && !VALID_ROLES.includes(args.role)) {
    throw new Error(`--role must be one of: ${VALID_ROLES.join(', ')}`);
  }
  return args;
}

/**
 * Prompt for a secret with the typed characters suppressed.
 *
 * readline has no masking option, so the write hook is replaced: the prompt
 * itself is still printed, everything the user types is swallowed.
 */
function promptSecret(label) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(new Error('No TTY available -- set USER_PASSWORD in the environment instead'));
      return;
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;

    rl._writeToOutput = (chunk) => {
      if (!muted) rl.output.write(chunk);
    };

    rl.question(label, (value) => {
      muted = false;
      rl.close();
      process.stdout.write('\n');
      resolve(value);
    });

    muted = true;
  });
}

async function readPassword() {
  if (process.env.USER_PASSWORD) return process.env.USER_PASSWORD;

  const first = await promptSecret('Password: ');
  if (!first) throw new Error('Password cannot be empty');

  const second = await promptSecret('Confirm : ');
  // Worth the second prompt: a mistyped password on a hand-provisioned account
  // is only ever discovered when somebody fails to log in.
  if (first !== second) throw new Error('Passwords do not match');

  return first;
}

function printAccounts(rows) {
  console.log('\nAccounts on this database:');
  rows.forEach((r) => {
    const state = r.is_active ? '[active]  ' : '[disabled]';
    console.log(`  ${state} ${r.role.padEnd(8)} ${r.email}`);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const client = await pool.connect();

  try {
    const existing = await client.query(
      'SELECT id, email, name, role, is_active FROM users WHERE email = $1',
      [args.email]
    );
    const found = existing.rows[0] || null;

    if (args.deactivate) {
      if (!found) throw new Error(`No account found for ${args.email}`);
      await client.query('UPDATE users SET is_active = false, updated_at = NOW() WHERE email = $1', [args.email]);
      console.log(`Deactivated ${args.email} (was role=${found.role}). Credentials left intact.`);
    } else if (found) {
      const role = args.role || found.role;

      if (args.keepPassword) {
        await client.query(
          'UPDATE users SET role = $2, is_active = true, updated_at = NOW() WHERE email = $1',
          [args.email, role]
        );
        console.log(`Updated ${args.email}: role ${found.role} -> ${role}, password unchanged.`);
      } else {
        const hash = await bcrypt.hash(await readPassword(), BCRYPT_COST);
        await client.query(
          'UPDATE users SET password_hash = $2, role = $3, is_active = true, updated_at = NOW() WHERE email = $1',
          [args.email, hash, role]
        );
        console.log(`Updated ${args.email}: role ${found.role} -> ${role}, password rotated.`);
      }
    } else {
      if (args.keepPassword) throw new Error('--keep-password needs an account that already exists');

      const role = args.role || 'viewer';
      const hash = await bcrypt.hash(await readPassword(), BCRYPT_COST);
      await client.query(
        'INSERT INTO users (email, password_hash, name, role, is_active) VALUES ($1, $2, $3, $4, true)',
        [args.email, hash, args.name || args.email, role]
      );
      console.log(`Created ${args.email} with role=${role}.`);
    }

    const after = await client.query('SELECT email, name, role, is_active FROM users ORDER BY role, email');
    printAccounts(after.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(`\nFailed: ${err.message}`);
  process.exit(1);
});
