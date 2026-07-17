# Recorta a margem uniforme (fundo creme) do logo e salva versao aparada.
Add-Type -AssemblyName System.Drawing

$src = "C:\Users\Jenifer Lopes\.cursor\projects\c-Users-Jenifer-Lopes-Downloads-m3volt\assets\c__Users_Jenifer_Lopes_AppData_Roaming_Cursor_User_workspaceStorage_377650f3457c1267f015bd08339c1ea4_images_WhatsApp_Image_2026-07-16_at_22.12.39-33721519-7293-4d0f-82bf-100a3e6984da.png"
$dst = "C:\Users\Jenifer Lopes\Downloads\jlonutri\assets\images\jlo-logo.png"

$bmp = [System.Drawing.Bitmap]::FromFile($src)
$w = $bmp.Width; $h = $bmp.Height
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
$bmp.UnlockBits($data)

# Cor de fundo a partir do pixel (0,0) — ordem BGRA
$b0 = $bytes[0]; $g0 = $bytes[1]; $r0 = $bytes[2]
$tol = 30
$minX = $w; $minY = $h; $maxX = -1; $maxY = -1

for ($y = 0; $y -lt $h; $y += 2) {
  $row = $y * $stride
  for ($x = 0; $x -lt $w; $x += 2) {
    $i = $row + $x * 4
    $diff = [math]::Abs($bytes[$i] - $b0) + [math]::Abs($bytes[$i + 1] - $g0) + [math]::Abs($bytes[$i + 2] - $r0)
    if ($diff -gt $tol) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}

$pad = 46
$minX = [math]::Max(0, $minX - $pad); $minY = [math]::Max(0, $minY - $pad)
$maxX = [math]::Min($w - 1, $maxX + $pad); $maxY = [math]::Min($h - 1, $maxY + $pad)
$cw = $maxX - $minX + 1; $ch = $maxY - $minY + 1

$crop = New-Object System.Drawing.Bitmap($cw, $ch)
$gfx = [System.Drawing.Graphics]::FromImage($crop)
$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$destRect = New-Object System.Drawing.Rectangle(0, 0, $cw, $ch)
$srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $cw, $ch)
$gfx.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$crop.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$gfx.Dispose(); $crop.Dispose(); $bmp.Dispose()

$hex = "#{0:X2}{1:X2}{2:X2}" -f $r0, $g0, $b0
Write-Output "BG_HEX=$hex"
Write-Output "CROP=${cw}x${ch} from ${minX},${minY}"
