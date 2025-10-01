############################
# local variables
############################
locals {
  ssh_pubkey = trimspace(file(pathexpand(var.ssh_public_key_path)))

  ssh_pwauth = var.admin_password == null ? "false" : "true"

  cloud_init = <<-YAML
    package_update: true
    package_upgrade: false
    packages:
      - python3
      - python3-pip
      - curl
      - git
    users:
      - name: ${var.admin_username}
        sudo: ALL=(ALL) NOPASSWD:ALL
        groups: sudo
        shell: /bin/bash
        ssh_authorized_keys:
          - ${local.ssh_pubkey}
    ssh_pwauth: ${local.ssh_pwauth}
  YAML
}


############################
# Resource Group
############################
resource "azurerm_resource_group" "rg" {
  name     = "${var.project}-rg"
  location = var.location
  tags     = { project = var.project }
}


############################
# Networking
############################
resource "azurerm_virtual_network" "vnet" {
  name                = "${var.project}-vnet"
  address_space       = [var.vnet_cidr]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet" {
  name                 = "${var.project}-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = [var.subnet_cidr]
}


############################
# Public IP
############################
resource "azurerm_public_ip" "pip" {
  name                = "${var.project}-pip"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = { project = var.project }
}

resource "azurerm_public_ip" "bastion_pip" {
  name                = "${var.project}-bastion-pip"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = { project = var.project }
}

############################
# Network Security Groups
############################
resource "azurerm_network_security_group" "nsg" {
  name                = "${var.project}-nsg"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name                       = "allow_ssh"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.allow_source_cidr
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "allow_http"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = var.allow_source_cidr
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "allow_https"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = var.allow_source_cidr
    destination_address_prefix = "*"
  }

  tags = { project = var.project }
}

resource "azurerm_network_security_group" "bastion_nsg" {
  name                = "${var.project}-bastion-nsg"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name                       = "allow_ssh"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.allow_source_cidr
    destination_address_prefix = "*"
  }

  tags = { project = var.project }
}


############################
# NIC
############################
resource "azurerm_network_interface" "nic" {
  name                = "${var.project}-nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.pip.id
  }

  tags = { project = var.project }
}

resource "azurerm_network_interface_security_group_association" "nic_nsg" {
  network_interface_id      = azurerm_network_interface.nic.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

resource "azurerm_network_interface" "bastion_nic" {
  name                = "${var.project}-bastion-nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.bastion_pip.id
  }

  tags = { project = var.project }
}

resource "azurerm_network_interface_security_group_association" "bastion_nic_nsg" {
  network_interface_id      = azurerm_network_interface.bastion_nic.id
  network_security_group_id = azurerm_network_security_group.bastion_nsg.id
}

############################
# Bastion
############################
resource "azurerm_linux_virtual_machine" "bastion" {
  name                = "${var.project}-bastion"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = var.bastion_vm_size

  admin_username = var.bastion_admin_username

  # Enable password when supplied
  disable_password_authentication = var.admin_password == null
  admin_password                  = var.admin_password

  network_interface_ids = [azurerm_network_interface.bastion_nic.id]

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  admin_ssh_key {
    username   = var.bastion_admin_username
    public_key = local.ssh_pubkey
  }

  os_disk {
    name                 = "${var.project}-bastion-osdisk"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
    disk_size_gb         = 32
  }

  # You can reuse your cloud_init 'local.cloud_init' if you like:
  custom_data = base64encode(local.cloud_init)

  tags = { project = var.project }

  depends_on = [
    azurerm_network_interface_security_group_association.bastion_nic_nsg
  ]
}

############################
# VM
############################
resource "azurerm_linux_virtual_machine" "vm" {
  name                = "${var.project}-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = var.vm_size
  admin_username      = var.admin_username

  # Enable password when supplied
  disable_password_authentication = var.admin_password == null
  admin_password                  = var.admin_password

  network_interface_ids = [azurerm_network_interface.nic.id]

  # Ubuntu 22.04 LTS (Jammy) Gen2
  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  admin_ssh_key {
    username   = var.admin_username
    public_key = local.ssh_pubkey
  }

  os_disk {
    name                 = "${var.project}-osdisk"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
    disk_size_gb         = 64
  }

  custom_data = base64encode(local.cloud_init)

  tags = { project = var.project }

  depends_on = [
    azurerm_network_interface_security_group_association.nic_nsg
  ]
}
