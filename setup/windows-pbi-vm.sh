#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso: $0 /ruta/a/Windows.iso [NOMBRE_VM]"
  exit 1
fi

ISO="$1"
VM_NAME="${2:-win11-powerbi}"
RAM_MB="8192"
VCPUS="4"
DISK_GB="100"
DISK_PATH="$HOME/VMs/${VM_NAME}.qcow2"
SHARE_PATH="$HOME/PowerBI-Shared"

if [[ ! -f "$ISO" ]]; then
  echo "No existe ISO: $ISO"
  exit 1
fi

mkdir -p "$(dirname "$DISK_PATH")" "$SHARE_PATH"

if [[ ! -f "$DISK_PATH" ]]; then
  qemu-img create -f qcow2 "$DISK_PATH" "${DISK_GB}G"
fi

# Crea la VM para instalación inicial de Windows 11
virt-install \
  --name "$VM_NAME" \
  --memory "$RAM_MB" \
  --vcpus "$VCPUS" \
  --cpu host-passthrough \
  --os-variant win11 \
  --cdrom "$ISO" \
  --disk path="$DISK_PATH",format=qcow2,bus=virtio \
  --network network=default,model=virtio \
  --graphics spice \
  --video qxl \
  --channel spicevmc \
  --sound ich9 \
  --tpm backend.type=emulator,backend.version=2.0,model=tpm-crb \
  --boot uefi \
  --noautoconsole

echo "VM creada: $VM_NAME"
echo "Abre virt-manager y completa instalación de Windows."
echo "Carpeta recomendada para compartir datos con la VM: $SHARE_PATH"
