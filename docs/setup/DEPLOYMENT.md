# Screengraph Deployment Guide

## 🚀 Quick Deploy

Deploy to US East, US Central, and India regions with a single command:

```bash
npm run deploy
```

## 📍 Target Regions

- **🇺🇸 US East (Virginia)** - `iad` - Primary region
- **🇺🇸 US Central (Texas)** - `dfw` - Secondary US region
- **🇮🇳 India (Mumbai)** - `bom` - Asia Pacific region

## 🌐 Live URLs

### Production Dashboards

| Region     | Service      | URL                                       | Status  |
| ---------- | ------------ | ----------------------------------------- | ------- |
| US East    | UI Dashboard | https://screengraph-ui.fly.dev            | 🟢 Live |
| US East    | Agent API    | https://screengraph-agent.fly.dev         | 🟢 Live |
| US East    | Health Check | https://screengraph-agent.fly.dev/healthz | 🟢 Live |
| US Central | UI Dashboard | https://screengraph-ui.fly.dev            | 🟢 Live |
| US Central | Agent API    | https://screengraph-agent.fly.dev         | 🟢 Live |
| India      | UI Dashboard | https://screengraph-ui.fly.dev            | 🟢 Live |
| India      | Agent API    | https://screengraph-agent.fly.dev         | 🟢 Live |

### Monitoring URLs

- **Fly.io Dashboard**: https://fly.io/dashboard
- **Agent Logs**: `fly logs --app screengraph-agent`
- **UI Logs**: `fly logs --app screengraph-ui`

## 🏥 Health Monitoring

### Automated Health Check

```bash
npm run health
```

This script checks:

- ✅ Agent API health in all 3 regions
- ✅ UI Dashboard availability
- ✅ Response times and status codes
- 📊 Detailed health information

### Manual Health Checks

```bash
# Check specific region
curl https://screengraph-agent.fly.dev/healthz

# Check UI availability
curl https://screengraph-ui.fly.dev
```

## 🔧 Deployment Commands

### Full Deployment

```bash
npm run deploy
```

### Individual Services

```bash
# Deploy Agent only
cd agent && fly deploy --app screengraph-agent

# Deploy UI only
cd ui && fly deploy --app screengraph-ui
```

### Specific Region

```bash
# Deploy to US East
cd agent && fly deploy --region iad --app screengraph-agent
cd ui && fly deploy --region iad --app screengraph-ui

# Deploy to US Central
cd agent && fly deploy --region dfw --app screengraph-agent
cd ui && fly deploy --region dfw --app screengraph-ui

# Deploy to India
cd agent && fly deploy --region bom --app screengraph-agent
cd ui && fly deploy --region bom --app screengraph-ui
```

## 📊 Status Monitoring

### Real-time Status

- Use `npm run health` for comprehensive status
- Check Fly.io dashboard for infrastructure status
- Monitor logs for real-time debugging

### Performance Metrics

- Response times per region
- Uptime statistics
- Error rates and patterns

## 🔍 Troubleshooting

### Common Issues

1. **Deployment Fails**

   ```bash
   # Check Fly.io authentication
   fly auth whoami

   # Check app status
   fly status --app screengraph-agent
   ```

2. **Health Checks Fail**

   ```bash
   # Check logs
   fly logs --app screengraph-agent

   # Restart services
   fly deploy --app screengraph-agent
   ```

3. **Database Connection Issues**
   ```bash
   # Verify Supabase connection
   curl https://screengraph-agent.fly.dev/healthz
   ```

### Log Access

```bash
# Agent logs
fly logs --app screengraph-agent

# UI logs
fly logs --app screengraph-ui

# Follow logs in real-time
fly logs --app screengraph-agent --follow
```

## 🚀 Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Supabase database set up
- [ ] Fly.io apps created
- [ ] Secrets configured
- [ ] Health checks passing
- [ ] All regions accessible

## 📞 Support

For deployment issues:

1. Check the health status: `npm run health`
2. Review logs: `fly logs --app screengraph-agent`
3. Verify Fly.io dashboard: https://fly.io/dashboard
4. Check Supabase status: https://supabase.com/dashboard
