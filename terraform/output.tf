################################################################################
# BEGIN google_compute_instance.vm_instance_public.network_interface outputs
#
# The following Terraform resources reference the google_compute_instance.vm_instance_public.network_interface
# which is not enabled. If the google_compute_instance.vm_instance_public.network_interface is re-enabled,
# you can uncomment the below Terraform outputs as well
################################################################################

# output "public_vm_external_ip" {
#   value =   google_compute_instance.vm_instance_public.network_interface.0.access_config.0.nat_ip
# }

# output "public_vm_internal_ip" {
#   value = google_compute_instance.vm_instance_public.network_interface.0.network_ip
# }

################################################################################
# END google_compute_instance.vm_instance_public.network_interface outputs
################################################################################
