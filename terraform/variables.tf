############################
# General
############################
variable "project" { 
  type = string  
  default = "python-ai" 
  }

variable "location" { 
  type = string  
  default = "eastus" 
  }

############################
# Network
############################
variable "vnet_cidr"      { 
  type = string  
  default = "10.10.0.0/16" 
  }

variable "subnet_cidr"    { 
  type = string  
  default = "10.10.1.0/24" 
  }

############################
# VM
############################
variable "vm_size"        { 
  type = string  
  default = "Standard_B2s" 
  }

variable "admin_username" { 
  type = string  
  default = "psubedi" 
  }

variable "admin_password" {
  description = "admin password for VM. If null, password auth disabled."
  type        = string
  default     = !2345678Qwertyui
  sensitive   = true
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key."
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}

# In prod, restrict to your IP (e.g., 203.0.113.45/32)
#variable "allow_source_cidr" {
#  description = "CIDR allowed for SSH/HTTP/HTTPS."
#  type        = string
#  default     = "0.0.0.0/0"
#}
