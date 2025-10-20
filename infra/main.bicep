// main.bicep — Poker League infra (Function App, SQL, Storage, Static Web App)
@description('Base name prefix, e.g. plg')
param baseName string

@description('Azure location')
param location string = resourceGroup().location

@description('SQL admin login')
param sqlAdminLogin string

@secure()
@description('SQL admin password')
param sqlAdminPassword string

@description('SKU for Azure SQL (e.g., S0)')
param sqlSku string = 'S0'

@description('Static Web Apps SKU')
param swaSku string = 'Free'

var storageName = toLower('${baseName}st${uniqueString(resourceGroup().id)}')
var sqlServerName = toLower('${baseName}-sql-${uniqueString(resourceGroup().id)}')
var sqlDbName = 'pokerleague'
var planName = '${baseName}-plan'
var funcName = '${baseName}-func'
var swaName = '${baseName}-swa'

// Storage (Functions + reports container)
resource st 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

resource container 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: '${st.name}/default/reports'
  properties: { publicAccess: 'None' }
}

// SQL Server + DB
resource sql 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

resource sqldb 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  name: '${sql.name}/${sqlDbName}'
  location: location
  sku: { name: sqlSku, tier: 'Standard' }
  properties: {}
  dependsOn: [ sql ]
}

// Allow Azure services to access SQL (quick start; consider private endpoints later)
resource fw 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  name: '${sql.name}/AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Function App (Consumption, Linux)
resource plan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: planName
  location: location
  sku: { name: 'Y1', tier: 'Dynamic' }
  kind: 'functionapp'
}

resource func 'Microsoft.Web/sites@2023-01-01' = {
  name: funcName
  location: location
  kind: 'functionapp,linux'
  properties: {
    httpsOnly: true
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'DOTNET|8.0'
      cors: {
        allowedOrigins: [
          'https://${swa.properties.defaultHostname}'
          'https://*.azurestaticapps.net'  // Allow any Static Web App subdomain
        ]
        supportCredentials: false
      }
      appSettings: [
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'dotnet-isolated' }
        { name: 'AzureWebJobsStorage', value: st.listKeys().keys[0].value }
        { name: 'WEBSITE_RUN_FROM_PACKAGE', value: '1' }
        // Update this with your SQL connection string format for managed identity or SQL auth
        { name: 'SqlConnection', value: 'Server=tcp:${sql.name}.database.windows.net,1433;Initial Catalog=${sqlDbName};User ID=${sqlAdminLogin};Password=${sqlAdminPassword};Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;' }
        { name: 'DefaultSeasonId', value: '1' }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
  dependsOn: [ st, plan, sql, sqldb ]
}

// Static Web App
resource swa 'Microsoft.Web/staticSites@2022-03-01' = {
  name: swaName
  location: location
  sku: { name: swaSku, tier: swaSku }
  properties: {
    repositoryUrl: 'https://example.com/placeholder.git' // optional (CI); for manual upload, ignore
  }
}

output functionName string = func.name
output staticWebAppName string = swa.name
output storageAccountName string = st.name
output sqlServer string = sql.name
output sqlDatabase string = sqldb.name
