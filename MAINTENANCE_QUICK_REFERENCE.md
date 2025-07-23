# EscaShop Maintenance Quick Reference Guide

**Version:** 3.1.0  
**Last Updated:** January 27, 2025  
**Purpose:** Quick reference for daily system maintenance and troubleshooting

---

## 🚀 Deployment Commands

### Railway Platform
```bash
# Login to Railway
railway login

# Deploy specific service
railway up --service backend
railway up --service frontend

# Check deployment status
railway status

# View logs
railway logs --service backend --tail
railway logs --service frontend --tail

# Environment variables
railway variables set NODE_ENV=production
railway variables list

# Database connection
railway connect postgresql
```

### Render Platform
```bash
# Deploy via git push (auto-deploy enabled)
git push origin main

# Manual deployment via Render dashboard
# Visit: https://dashboard.render.com
```

---

## 🔍 Health Monitoring

### Quick Health Checks
```bash
# Application health
curl https://your-app.railway.app/health

# Database connectivity test
curl https://your-app.railway.app/api/health/db

# WebSocket status
wscat -c wss://your-app.railway.app/socket.io

# Frontend availability
curl -I https://your-frontend.railway.app
```

### Monitoring Dashboard Access
```bash
# Grafana Dashboard
http://localhost:3002
# Username: admin, Password: admin123

# Loki Logs
http://localhost:3100

# Health check endpoints
GET /health          # Basic health check
GET /health/detailed # Detailed system status
GET /api/health/db   # Database connectivity
```

---

## 🗄️ Database Operations

### Connection Commands
```bash
# Connect to production database
psql $DATABASE_URL

# Connect via Railway CLI
railway connect postgresql

# Database status check
psql $DATABASE_URL -c "SELECT version();"
```

### Migration Commands
```bash
# Check migration status
npm run db:migrate:status

# Run pending migrations
npm run db:migrate:up

# Rollback last migration
npm run db:migrate:down

# Create new migration
npm run db:migrate:create add_new_feature
```

### Common Database Queries
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('escashop'));

-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Queue status overview
SELECT queue_status, COUNT(*) 
FROM customers 
WHERE created_at::date = CURRENT_DATE 
GROUP BY queue_status;

-- Performance stats
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del 
FROM pg_stat_user_tables;
```

---

## 📊 Monitoring & Alerts

### Log Analysis
```bash
# Backend error logs
railway logs --service backend | grep ERROR

# Frontend build logs
railway logs --service frontend | grep -E "(ERROR|WARN)"

# WebSocket connection logs
railway logs --service backend | grep "socket.io"

# Database connection logs
railway logs --service backend | grep -E "(database|postgres)"
```

### Performance Monitoring
```bash
# Resource usage
railway metrics --service backend
railway metrics --service frontend

# Response time testing
curl -w "@curl-format.txt" -o /dev/null https://your-app.railway.app/api/health

# Load testing (basic)
ab -n 100 -c 10 https://your-app.railway.app/health
```

### Alert Conditions
- **Critical**: Application down > 2 minutes
- **Warning**: Response time > 5 seconds
- **Info**: High memory usage > 80%

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Application Won't Start
```bash
# Check logs for startup errors
railway logs --service backend --tail

# Common causes:
# - Missing environment variables
# - Database connection failure
# - Port configuration issues

# Verify environment variables
railway variables list --service backend

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### 2. Database Connection Issues
```bash
# Check database service status
railway status

# Test connection manually
psql $DATABASE_URL

# Common fixes:
# - Restart database service
# - Check connection string
# - Verify firewall rules
```

#### 3. Frontend Build Failures
```bash
# Check build logs
railway logs --service frontend

# Common causes:
# - Node.js version mismatch
# - Missing dependencies
# - Environment variable issues

# Local build test
cd frontend
npm run build
```

#### 4. WebSocket Connection Problems
```bash
# Test WebSocket connectivity
wscat -c wss://your-app.railway.app/socket.io

# Check CORS configuration
curl -H "Origin: https://your-frontend.railway.app" \
     https://your-backend.railway.app/health

# Review Socket.IO logs
railway logs --service backend | grep socket
```

---

## 🔐 Security Maintenance

### Security Checklist
```bash
# Check for vulnerable dependencies
npm audit
npm audit fix

# Update dependencies
npm update
npm outdated

# Environment variable security
railway variables list | grep -E "(SECRET|PASSWORD|KEY)"

# SSL certificate status
curl -vI https://your-app.railway.app 2>&1 | grep -E "(expire|SSL)"
```

### Access Control
```bash
# Review user roles in database
psql $DATABASE_URL -c "SELECT role, count(*) FROM users GROUP BY role;"

# Check JWT token expiration settings
grep -r "JWT_EXPIRES_IN" backend/src/

# Audit API endpoint permissions
grep -r "requireRole\|requireAuth" backend/src/routes/
```

---

## 📈 Performance Optimization

### Database Performance
```sql
-- Slow query analysis
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Index usage stats
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
WHERE idx_scan = 0;

-- Table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Application Performance
```bash
# Bundle size analysis
cd frontend
npm run build
ls -la build/static/js/

# Memory usage monitoring
railway metrics --service backend --metric memory

# Response time optimization
curl -w "@curl-timing.txt" https://your-app.railway.app/api/customers
```

---

## 🔄 Backup & Recovery

### Database Backup
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_20250127_120000.sql

# Railway backup (automatic)
# Backups are handled automatically by Railway
# Access via Railway dashboard > Database > Backups
```

### Application State Backup
```bash
# Environment variables backup
railway variables list > env_backup_$(date +%Y%m%d).txt

# Configuration backup
cp railway.json railway.json.backup
cp render.yaml render.yaml.backup
```

---

## 🚨 Emergency Procedures

### Immediate Response
```bash
# 1. Check application status
curl https://your-app.railway.app/health

# 2. Review recent logs
railway logs --service backend --tail -n 100

# 3. Check recent deployments
railway deployments list

# 4. Rollback if needed
railway rollback --service backend
railway rollback --service frontend
```

### Escalation Contacts
- **Level 1**: Check documentation and logs
- **Level 2**: Platform support (Railway/Render)
- **Level 3**: Database administrator
- **Level 4**: Senior developer/architect

---

## 📋 Daily Maintenance Tasks

### Morning Checklist (5 minutes)
- [ ] Check application health endpoints
- [ ] Review overnight logs for errors
- [ ] Verify midnight reset completed successfully
- [ ] Check database connection status

### Weekly Checklist (30 minutes)
- [ ] Review performance metrics
- [ ] Update dependencies (patch versions)
- [ ] Check disk space usage
- [ ] Test backup/restore procedures
- [ ] Review security alerts

### Monthly Checklist (2 hours)
- [ ] Security dependency audit
- [ ] Performance optimization review
- [ ] Documentation updates
- [ ] Disaster recovery testing
- [ ] Cost optimization review

---

## 📞 Support Resources

### Platform Support
- **Railway**: https://railway.app/help
- **Render**: https://render.com/docs

### Internal Resources
- **Documentation**: [`MIGRATION_DEPLOYMENT_SUMMARY.md`](./MIGRATION_DEPLOYMENT_SUMMARY.md)
- **Architecture**: [`architecture_knowledge_base.md`](./architecture_knowledge_base.md)
- **API Docs**: [`backend/docs/`](./backend/docs/)

### Emergency Commands Reference
```bash
# Service restart
railway restart --service backend

# Scale service
railway scale --service backend --replicas 2

# Environment variable update
railway variables set NODE_ENV=production --service backend

# Database connection
railway connect postgresql

# Log streaming
railway logs --service backend --follow
```

---

**Quick Reference Guide**  
**For:** EscaShop v3.1.0  
**Next Update:** February 27, 2025  
**Emergency Contact:** [Your Team Contact Info]
