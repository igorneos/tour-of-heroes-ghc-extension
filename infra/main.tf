provider "azurerm" {

  subscription_id = var.subscription_id

  features {

  }
}

resource "azurerm_resource_group" "rg" {
  name     = "ghc-extension-demo"
  location = "spaincentral"
}

resource "azurerm_service_plan" "plan" {
  name                = "ghc-extension-demo-plan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "S1"
}

resource "azurerm_linux_web_app" "web" {

  name                = "hero-ghc-extension"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    application_stack {
      node_version = "20-lts"
    }
  }
}

resource "azurerm_linux_web_app_slot" "staging_slot" {
  name           = "staging"
  app_service_id = azurerm_linux_web_app.web.id

  site_config {
    application_stack {
      node_version = "20-lts"
    }
  }
}
