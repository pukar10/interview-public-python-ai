# Deployment Steps

1. Copy configuration.yml.template to configuration.yml and fill out
2. generate dynamic inventory
    * `ansible-playbook 0100-generate_dynamic_inventory.yml`
3. preconfigure VM(s) - TBD - skip for now
    * `ansible-playbook 0200-generate_dynamic_inventory.yml`
4. Install k3s kubernetes onto VM(s)
    * `ansible-playbook 0300-generate_dynamic_inventory.yml`
5. Setup local kube env
    * `ansible-playbook 0310-generate_dynamic_inventory.yml`
