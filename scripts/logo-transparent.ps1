# Remove o fundo creme do logo e gera versao com transparencia (PNG RGBA).
# Faz "un-matting": recupera a cor real das letras para evitar halo claro nas bordas.
Add-Type -AssemblyName System.Drawing

$src = "C:\Users\Jenifer Lopes\Downloads\jlonutri\assets\images\jlo-logo.png"
$dst = "C:\Users\Jenifer Lopes\Downloads\jlonutri\assets\images\jlo-logo-transparent.png"

$orig = [System.Drawing.Bitmap]::FromFile($src)
$w = $orig.Width; $h = $orig.Height

# Garante 32bpp com canal alfa
$bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($orig, 0, 0, $w, $h)
$g.Dispose(); $orig.Dispose()

$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

# Cor de fundo a partir do pixel (0,0) — ordem BGRA
$b0 = [double]$bytes[0]; $g0 = [double]$bytes[1]; $r0 = [double]$bytes[2]

# Distancia (soma dos canais) para alfa totalmente opaco
$T = 150.0

for ($y = 0; $y -lt $h; $y++) {
  $row = $y * $stride
  for ($x = 0; $x -lt $w; $x++) {
    $i = $row + $x * 4
    $b = [double]$bytes[$i]; $gg = [double]$bytes[$i + 1]; $r = [double]$bytes[$i + 2]
    $d = [math]::Abs($b - $b0) + [math]::Abs($gg - $g0) + [math]::Abs($r - $r0)
    $a = $d / $T
    if ($a -gt 1) { $a = 1 }

    if ($a -le 0.02) {
      $bytes[$i] = 0; $bytes[$i + 1] = 0; $bytes[$i + 2] = 0; $bytes[$i + 3] = 0
    } else {
      # Un-matting: P = a*F + (1-a)*C  =>  F = (P - (1-a)*C)/a
      $fb = ($b - (1 - $a) * $b0) / $a
      $fg = ($gg - (1 - $a) * $g0) / $a
      $fr = ($r - (1 - $a) * $r0) / $a
      $fb = [math]::Max(0, [math]::Min(255, $fb))
      $fg = [math]::Max(0, [math]::Min(255, $fg))
      $fr = [math]::Max(0, [math]::Min(255, $fr))
      $bytes[$i] = [byte]$fb; $bytes[$i + 1] = [byte]$fg; $bytes[$i + 2] = [byte]$fr
      $bytes[$i + 3] = [byte][math]::Round($a * 255)
    }
  }
}

[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
$bmp.UnlockBits($data)
$bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Output "OK -> $dst (${w}x${h})"
