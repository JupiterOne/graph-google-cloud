output "public_vm_external_ip" {
  value =   google_compute_instance.vm_instance_public.network_interface.0.access_config.0.nat_ip
}

output "public_vm_internal_ip" {
  value = google_compute_instance.vm_instance_public.network_interface.0.network_ip
}
