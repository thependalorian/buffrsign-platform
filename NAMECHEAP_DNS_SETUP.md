# NAMECHEAP DNS CONFIGURATION GUIDE - BUFFRSIGN

## 🎯 **DNS SETUP STATUS: READY FOR CONFIGURATION**

**Domain**: `buffr.ai`  
**Provider**: Namecheap  
**Configuration Date**: January 2025  
**Status**: ⚠️ **NEEDS CONFIGURATION** (Updated email: george@buffr.ai)

---

## 📋 **REQUIRED DNS RECORDS**

### **A Records**
Configure these A records to point to your DigitalOcean VM IP:

| Type | Host | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| A | `api.sign` | `192.34.63.153` | Automatic | API Server |
| A | `sign` | `192.34.63.153` | Automatic | Frontend App |
| A | `www.sign` | `192.34.63.153` | Automatic | Frontend App (www) |

### **CNAME Records**
| Type | Host | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| CNAME | `www` | `buffr.ai` | Automatic | Root domain redirect |

### **TXT Records**
| Type | Host | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| TXT | `@` | `google-site-verification=_HIvRg6b2jVDkaI1CZOnEtwzj18iFf3k4Ri4drEHz8c` | Automatic | Google verification |

---

## 🌐 **RESULTING URLS**

### **Primary URLs**
- **Frontend (Primary)**: `https://sign.buffr.ai`
- **Frontend (Alternative)**: `https://www.sign.buffr.ai`
- **API**: `https://api.sign.buffr.ai`

### **Marketing URLs**
- **Marketing Site**: `https://www.buffr.ai`
- **Root Domain**: `https://buffr.ai`

### **Direct Access**
- **VM IP**: `http://192.34.63.153`
- **Frontend Port**: `http://192.34.63.153:3000`
- **API Port**: `http://192.34.63.153:8003`

---

## 🔧 **DNS PROPAGATION**

### **Expected Timeline**
- **Local**: 5-10 minutes
- **Regional**: 15-30 minutes
- **Global**: 24-48 hours (typically much faster)

### **Testing DNS Resolution**
```bash
# Test A records
dig +short api.sign.buffr.ai
dig +short sign.buffr.ai
dig +short www.sign.buffr.ai

# Expected output: 192.34.63.153
```

---

## 📱 **NAMECHEAP DASHBOARD LOCATION**

### **Access Path**
1. **Login**: [namecheap.com](https://namecheap.com)
2. **Domain List**: Click on `buffr.ai`
3. **DNS Management**: Go to "Advanced DNS" tab
4. **Host Records**: View/edit DNS records

### **Current Configuration**
```
Domain Products → buffr.ai → Advanced DNS → Host Records
```

---

## 🔒 **SECURITY CONSIDERATIONS**

### **DNS Security**
- ✅ **DNSSEC**: Available but not required for basic setup
- ✅ **DNS Privacy**: Standard DNS queries
- ✅ **TTL Settings**: Automatic (optimal for performance)

### **SSL/TLS**
- ✅ **Automatic SSL**: Handled by Caddy reverse proxy
- ✅ **Certificate Renewal**: Automatic via Let's Encrypt
- ✅ **HTTPS Redirect**: Automatic HTTP to HTTPS redirect

---

## 🚀 **VERIFICATION STEPS**

### **1. DNS Resolution Test**
```bash
# Test from your local machine
nslookup api.sign.buffr.ai
nslookup sign.buffr.ai
nslookup www.sign.buffr.ai
```

### **2. SSL Certificate Test**
```bash
# Test SSL certificates
openssl s_client -connect api.sign.buffr.ai:443 -servername api.sign.buffr.ai
openssl s_client -connect sign.buffr.ai:443 -servername sign.buffr.ai
```

### **3. Application Test**
```bash
# Test API health
curl -I https://api.sign.buffr.ai/health

# Test frontend
curl -I https://sign.buffr.ai
```

---

## 📋 **CONFIGURATION CHECKLIST**

### **Before Deployment**
- [ ] DNS records configured in Namecheap
- [ ] VM IP address confirmed (`192.34.63.153`)
- [ ] Domain ownership verified
- [ ] SSL certificates ready for provisioning

### **After Deployment**
- [ ] DNS propagation complete
- [ ] SSL certificates provisioned
- [ ] Frontend accessible via HTTPS
- [ ] API accessible via HTTPS
- [ ] All redirects working correctly

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **DNS Not Resolving**
```bash
# Check if DNS is propagated
dig +short api.sign.buffr.ai
# If empty, wait for propagation or check DNS configuration
```

#### **SSL Certificate Issues**
```bash
# Check certificate status
openssl s_client -connect api.sign.buffr.ai:443 -servername api.sign.buffr.ai
# Look for "Verify return code: 0 (ok)"
```

#### **Application Not Accessible**
```bash
# Check if application is running
ssh root@192.34.63.153 'docker ps'
# Check logs
ssh root@192.34.63.153 'docker logs buffrsign-api'
```

---

## 📞 **SUPPORT**

### **Namecheap Support**
- **Live Chat**: Available 24/7
- **Email**: support@namecheap.com
- **Phone**: +1 (661) 310-2107

### **Technical Support**
- **Documentation**: Check deployment guides
- **Logs**: SSH into VM and check Docker logs
- **Monitoring**: Use health check endpoints

---

## 🎉 **SUCCESS INDICATORS**

### **DNS Configuration Success**
- ✅ All A records resolve to `192.34.63.153`
- ✅ CNAME records redirect correctly
- ✅ No DNS resolution errors

### **SSL Configuration Success**
- ✅ HTTPS accessible on all domains
- ✅ SSL certificates valid and trusted
- ✅ No certificate warnings

### **Application Success**
- ✅ Frontend loads at `https://sign.buffr.ai`
- ✅ API responds at `https://api.sign.buffr.ai/health`
- ✅ All features working correctly

---

**BuffrSign** - Empowering Namibia with legally compliant digital signatures 🇳🇦
