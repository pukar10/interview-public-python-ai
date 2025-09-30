project  = "python-ai"
location = "eastus"

vnet_cidr   = "10.10.0.0/16"
subnet_cidr = "10.10.1.0/24"

vm_size             = "Standard_B2s"
admin_username      = "psubedi"
ssh_public_key_path = "~/.ssh/id_ed25519.pub"

allow_source_cidr = "0.0.0.0/0"

# Comment out to disable password auth
admin_password = "!2345678Qwertyui"
