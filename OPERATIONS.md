# Production Operations Runbook

## Monitoring

- Health check: GET /health
- Metrics: GET /metrics
- Alert when:
  - health endpoint fails for 2 consecutive checks
  - error rate > 5% for 5 minutes
  - response time > 2s for 10 minutes

## Deployment

1. Build and verify locally.
2. Run `npm test`.
3. Build container image.
4. Deploy to staging first.
5. Validate health and metrics.
6. Promote production only after manual signoff.

## Rollback

1. Redeploy the previous known-good image or git tag.
2. Confirm /health is successful.
3. Recheck inbound contact flow.
4. Review logs and alert history.

## Incident response

- Check /health and /metrics first.
- Review Express access logs for spikes or 4xx/5xx errors.
- Reduce rate limits if abuse is detected.
- Revert to a previous deployment if service availability drops.

## Backup and recovery

- Back up deployment configuration and environment files.
- Keep previous release tags and built images.
- Validate restore procedure before launch.
