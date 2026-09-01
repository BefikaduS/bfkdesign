const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = 4310;
const appPath = path.join(__dirname, '..', 'server.js');

function waitForServer(url, timeoutMs = 10000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch (err) {
        // retry until timeout
      }

      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Server did not start on ${url}`));
      }

      setTimeout(check, 200);
    };

    check();
  });
}

test('health endpoint responds successfully', async () => {
  const child = spawn(process.execPath, [appPath], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
    stdio: 'inherit'
  });

  try {
    await waitForServer(`http://localhost:${PORT}/health`);
    const res = await fetch(`http://localhost:${PORT}/health`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.ok, true);
  } finally {
    child.kill('SIGTERM');
  }
});

test('contact endpoint rejects invalid payloads', async () => {
  const child = spawn(process.execPath, [appPath], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(PORT + 1), NODE_ENV: 'test' },
    stdio: 'inherit'
  });

  try {
    await waitForServer(`http://localhost:${PORT + 1}/health`);
    const res = await fetch(`http://localhost:${PORT + 1}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'name=&email=bad&message=too short'
    });
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.error, 'Invalid contact form payload');
  } finally {
    child.kill('SIGTERM');
  }
});

test('contact endpoint accepts valid payloads and metrics endpoint is exposed', async () => {
  const child = spawn(process.execPath, [appPath], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(PORT + 2), NODE_ENV: 'test' },
    stdio: 'inherit'
  });

  try {
    await waitForServer(`http://localhost:${PORT + 2}/health`);
    const valid = await fetch(`http://localhost:${PORT + 2}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'name=Test+User&email=test@example.com&message=This+is+a+test+message+for+the+contact+flow.'
    });
    const metrics = await fetch(`http://localhost:${PORT + 2}/metrics`);
    const validBody = await valid.json();
    const metricsBody = await metrics.json();

    assert.equal(valid.status, 200);
    assert.equal(validBody.ok, true);
    assert.equal(metrics.status, 200);
    assert.ok(metricsBody.uptimeSeconds >= 0);
    assert.ok(metricsBody.memoryUsageMb >= 0);
  } finally {
    child.kill('SIGTERM');
  }
});
