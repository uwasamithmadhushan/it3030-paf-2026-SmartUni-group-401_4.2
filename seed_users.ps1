$headers = @{
    "Content-Type" = "application/json"
}

$admin = @{
    username = "admin"
    email = "admin@smartuni.edu"
    password = "password123"
    role = "ADMIN"
}

$tech = @{
    username = "tech"
    email = "tech@smartuni.edu"
    password = "password123"
    role = "TECHNICIAN"
}

$user = @{
    username = "student"
    email = "student@smartuni.edu"
    password = "password123"
    role = "USER"
}

Write-Host "Creating Admin..."
try {
    $res1 = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Headers $headers -Body ($admin | ConvertTo-Json)
    Write-Host "Success!"
} catch {
    Write-Host "Failed or already exists."
}

Write-Host "Creating Technician..."
try {
    $res2 = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Headers $headers -Body ($tech | ConvertTo-Json)
    Write-Host "Success!"
} catch {
    Write-Host "Failed or already exists."
}

Write-Host "Creating User..."
try {
    $res3 = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Headers $headers -Body ($user | ConvertTo-Json)
    Write-Host "Success!"
} catch {
    Write-Host "Failed or already exists."
}

Write-Host "Done seeding default users!"
