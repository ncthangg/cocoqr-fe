# Release and Deployment Workflow

## Purpose
Automate Docker image build and deployment for staging and production from Git tags.

## Environments
Staging: https://staging.fe.cocoqr.cocome.online  
Production: https://cocoqr.cocome.online

## Branch and Tag Strategy
Deployment targets and release types are strictly controlled by the tag pattern and its source branch.

| Tag Pattern | Source Branch | Environment | GitHub Release |
|-------------|---------------|-------------|----------------|
| `v*.*.*-rc*` | `dev` | Staging | None |
| `v*.*.*` | `main` | Production | Full Release |
| `v*.*.*-pre` | `main` | Production | Pre-release |
| `v*.*.*-no-release` | `main` | Production | None |

Note: Production releases (`v*.*.*`) will automatically fail if no corresponding `-rc*` tag is found in the commit history.

## Deployment Flow
1. **Validation**: Verifies the tag format and ensures it originates from the required source branch.
2. **Build**: Builds the Docker image with environment-specific arguments.
3. **Push**: Pushes the image to the Docker Hub registry.
4. **Release**: Creates a GitHub Release and generates release notes for production tags.
5. **Deploy**: Connects to the VPS via SSH, pulls the new Docker image, updates the `.env` file, and restarts the environment using `docker compose`.

## How to Trigger Deployments

**Deploy to Staging:**
```bash
git checkout dev
git pull origin dev
git tag v1.0.0-rc1
git push origin v1.0.0-rc1
```

**Deploy to Production:**
```bash
git checkout main
git pull origin main
git tag v1.0.0
git push origin v1.0.0
```

## Docker Image
```text
dockerhub/cocoqr-fe.X.X
```

Built and pushed as:
```text
<DOCKER_USERNAME>/cocoqr-fe:<tag>
```

## Rollback
```bash
git tag v1.0.0
git push origin v1.0.0
```
