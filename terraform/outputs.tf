output "vm_public_ip" {
  value = azurerm_public_ip.pip.ip_address
}

output "vm_private_ip" {
  value = azurerm_network_interface.nic.private_ip_address
}

output "ssh_command" {
  value = "ssh ${var.admin_username}@${azurerm_public_ip.pip.ip_address}"
}
