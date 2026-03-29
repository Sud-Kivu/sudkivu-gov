# DEPLOYMENT.md – Deploying Sud-Kivu to Microsoft Azure

This guide explains how to deploy the **Province du Sud-Kivu** Next.js application
to Microsoft Azure using Azure App Service (container mode) and Azure Pipelines for
automated CI/CD.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Docker | ≥ 24 |
| Azure CLI | latest |

---

## 1. Local Development

```bash
# Install dependencies
npm ci

# Start the development server (hot-reload)
npm run dev
# → http://localhost:3000

# Production build + start
npm run build
npm start
# → http://localhost:3000
```

---

## 2. Run with Docker Locally

```bash
docker build -t sudkivu .
docker run -p 3000:3000 -e NODE_ENV=production sudkivu
# → http://localhost:3000
```

---

## 3. Azure Resources Setup

### 3.1 Create a Resource Group

```bash
az login
az group create --name rg-sudkivu --location eastus
```

### 3.2 Create an Azure Container Registry (ACR)

```bash
az acr create \
  --resource-group rg-sudkivu \
  --name sudkivuacr \
  --sku Basic \
  --admin-enabled true
```

### 3.3 Push the Docker Image to ACR

```bash
az acr login --name sudkivuacr

docker build -t sudkivuacr.azurecr.io/sudkivu:latest .
docker push sudkivuacr.azurecr.io/sudkivu:latest
```

### 3.4 Create an App Service Plan (Linux)

```bash
az appservice plan create \
  --name plan-sudkivu \
  --resource-group rg-sudkivu \
  --is-linux \
  --sku B1
```

### 3.5 Create a Web App for Containers

```bash
az webapp create \
  --resource-group rg-sudkivu \
  --plan plan-sudkivu \
  --name app-sudkivu \
  --deployment-container-image-name sudkivuacr.azurecr.io/sudkivu:latest
```

### 3.6 Configure App Service Environment Variables

```bash
az webapp config appsettings set \
  --resource-group rg-sudkivu \
  --name app-sudkivu \
  --settings \
    WEBSITES_PORT=3000 \
    NODE_ENV=production \
    NEXT_PUBLIC_BASE_URL=https://sudkivu.cd
```

### 3.7 Map a Custom Domain

```bash
# Verify domain ownership first, then:
az webapp config hostname add \
  --webapp-name app-sudkivu \
  --resource-group rg-sudkivu \
  --hostname sudkivu.cd
```

---

## 4. Azure Pipelines CI/CD Setup

### 4.1 Create an Azure DevOps Project

1. Go to https://dev.azure.com and create (or open) your organization.
2. Create a new project **sudkivu**.

### 4.2 Connect the GitHub Repository

In Azure DevOps → **Project Settings → Pipelines → Service connections**:

- Add a **GitHub** service connection pointing to `cerccongo/sudkivu`.

### 4.3 Add Required Service Connections

| Name (use in azure-pipelines.yml) | Type |
|---|---|
| `<acr-service-connection-name>` | Docker Registry → Azure Container Registry |
| `<azure-subscription-service-connection>` | Azure Resource Manager |

### 4.4 Create the Pipeline

1. **Pipelines → New pipeline → GitHub → select `cerccongo/sudkivu`**.
2. Choose **Existing Azure Pipelines YAML file** and point to `/azure-pipelines.yml`.
3. Replace all `<placeholder>` values in the YAML with your actual resource names.
4. Save and run.

---

## 5. Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Next.js server listens on | `3000` |
| `NODE_ENV` | Node environment | `production` |
| `NEXT_PUBLIC_BASE_URL` | Public site URL (used in meta tags) | `https://sudkivu.cd` |
| `NEXT_PUBLIC_SITE_NAME` | Site display name | `Province du Sud-Kivu` |

Set these in Azure App Service → **Configuration → Application settings**.

---

## 6. Azure Static Web Apps (Alternative – Free Tier)

For a fully static deployment without a Node.js server:

1. Change `next.config.js` → `output: 'export'` (removes SSR features).
2. Run `npm run build` – this creates an `out/` directory.
3. Deploy via:

```bash
az staticwebapp create \
  --name swa-sudkivu \
  --resource-group rg-sudkivu \
  --source https://github.com/cerccongo/sudkivu \
  --branch main \
  --app-location "/" \
  --output-location "out" \
  --login-with-github
```

> **Note:** The `output: 'export'` mode does not support `getServerSideProps`.
> Switch the catch-all route to use `getStaticPaths` / `getStaticProps` before
> enabling this mode.

---

## 7. Estimated Azure Costs

| Service | SKU | Monthly estimate |
|---|---|---|
| App Service (B1) | Basic, 1 core, 1.75 GB RAM | ~$13 USD |
| Azure Container Registry (Basic) | 10 GB storage | ~$5 USD |
| Bandwidth (outbound, 5 GB/month) | – | ~$0.45 USD |
| **Static Web Apps (alternative)** | Free | **$0** |

---

## 8. Incremental Migration to React

The existing 148 HTML pages are served by the Next.js catch-all route
(`pages/[...slug].js`) as raw HTML. Migrate pages incrementally:

1. Create a new file under `pages/` (e.g. `pages/province.js`).
2. Build it as a React component using `components/Layout.js`.
3. The new page automatically overrides the catch-all for that route.
4. Remove the legacy `province.html` once the React page is stable.
