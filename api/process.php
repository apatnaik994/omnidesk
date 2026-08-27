<?php
header('Content-Type: application/json');

// Enable CORS if needed (for local dev)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Read JSON input
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

$action = $input['action'] ?? '';

if ($action === 'save_image') {
    $base64Image = $input['image'] ?? '';
    $filename = $input['filename'] ?? 'uploaded_image.jpg';
    
    // Validate base64 string
    if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
        $data = substr($base64Image, strpos($base64Image, ',') + 1);
        $type = strtolower($type[1]); // jpg, png, gif

        if (!in_array($type, [ 'jpg', 'jpeg', 'gif', 'png' ])) {
            echo json_encode(['success' => false, 'message' => 'Invalid image type']);
            exit;
        }
        
        $data = base64_decode($data);

        if ($data === false) {
            echo json_encode(['success' => false, 'message' => 'Base64 decode failed']);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid base64 string format']);
        exit;
    }

    // Create a uploads directory if it doesn't exist
    $uploadDir = '../uploads/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Generate a unique filename
    $safeFilename = time() . '_' . preg_replace('/[^a-zA-Z0-9_\.-]/', '', $filename);
    $filePath = $uploadDir . $safeFilename;
    
    // Save the file
    if (file_put_contents($filePath, $data)) {
        echo json_encode([
            'success' => true, 
            'message' => 'Image saved successfully',
            'path' => 'uploads/' . $safeFilename
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save file']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Unknown action']);
}
?>
