# Launch Checklist

## Pre-launch

- [ ] Confirm environment variables are set.
- [ ] Confirm rate limits are configured.
- [ ] Confirm CSP and security headers are active.
- [ ] Confirm all asset paths are valid.
- [ ] Confirm health and metrics endpoints return 200.
- [ ] Confirm the contact endpoint rejects invalid payloads.
- [ ] Confirm the contact endpoint accepts valid payloads.
- [ ] Confirm monitoring and alerting endpoints are configured.
- [ ] Confirm backup and rollback procedure is documented and tested.

## Production validation

- [ ] Staging deployment is healthy.
- [ ] Smoke tests pass in CI.
- [ ] Production DNS points to the correct target.
- [ ] TLS is active and valid.
- [ ] Logs are being captured.
- [ ] Alerts are configured and tested.

## Launch

- [ ] Trigger production deployment.
- [ ] Validate /health.
- [ ] Validate /metrics.
- [ ] Validate contact submission with a real test message.
- [ ] Monitor for errors for 30 minutes post launch.
