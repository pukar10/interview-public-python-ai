############################
# VMs
############################
output "vm_public_ip" {
  value = azurerm_public_ip.pip.ip_address
}

# output "vm_private_ip" {
#   value = azurerm_network_interface.nic.private_ip_address
# }
output "vm_private_ip" {
  description = "Private IP of the app VM"
  value       = azurerm_network_interface.nic.ip_configuration[0].private_ip_address
}

output "ssh_command" {
  value = "ssh ${var.admin_username}@${azurerm_public_ip.pip.ip_address}"
}

############################
# Bastion
############################
output "bastion_public_ip" {
  value       = azurerm_public_ip.bastion_pip.ip_address
}

output "bastion_private_ip" {
  value       = azurerm_network_interface.bastion_nic.ip_configuration[0].private_ip_address
}


############################
# Useful commands
############################
output "ssh_vm" {
  description = "Direct SSH to node"
  value       = "ssh ${var.admin_username}@${azurerm_public_ip.pip.ip_address}"
}

output "ssh_bastion" {
  description = "SSH to bastion"
  value       = "ssh ${var.bastion_admin_username}@${azurerm_public_ip.bastion_pip.ip_address}"
}

output "ssh_vm_via_bastion" {
  description = "Bastion to node"
  value       = "ssh -J ${var.bastion_admin_username}@${azurerm_public_ip.bastion_pip.ip_address} ${var.admin_username}@${azurerm_network_interface.nic.ip_configuration[0].private_ip_address}"
}