# Carousel Mix API Documentation

Base URL: `http://localhost:3003`

## Table of Contents
- [Health & Info](#health--info)
- [Projects](#projects)
- [Carousel Generation](#carousel-generation)

## Health & Info

### GET /health
Health check endpoint

**Response**
```json
{
  "success": true,
  "service": "Carousel Mix Backend",
  "status": "healthy",
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

### GET /
API information and available endpoints

**Response**
```json
{
  "success": true,
  "service": "Carousel Mix Backend",
  "version": "1.0.0",
  "endpoints": {
    "health": "GET /health",
    "projects": { ... },
    "carousel": { ... }
  }
}
```

## Projects

### GET /api/projects
Get all projects

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "My Carousel Project",
      "type": "carousel",
      "document": { ... },
      "createdAt": "2025-01-02T12:00:00.000Z",
      "updatedAt": "2025-01-02T12:00:00.000Z"
    }
  ]
}
```

### GET /api/projects/:id
Get single project by ID

**Parameters**
- `id` (string, required) - Project UUID

**Response**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My Project",
    "type": "carousel",
    "document": {
      "metadata": {
        "title": "My Project",
        "type": "bulk",
        "totalCombinations": 12,
        "setsToGenerate": 4
      },
      "settings": {
        "width": 1080,
        "height": 1080,
        "slideCount": 3
      },
      "slides": [ ... ]
    }
  }
}
```

### POST /api/projects
Create new project

**Request Body**
```json
{
  "title": "My New Project",
  "type": "carousel",
  "document": {
    "metadata": { ... },
    "settings": { ... },
    "slides": [ ... ]
  }
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My New Project",
    "document": { ... }
  }
}
```

### PUT /api/projects/:id
Update existing project

**Parameters**
- `id` (string, required) - Project UUID

**Request Body**
```json
{
  "title": "Updated Title",
  "document": { ... }
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "document": { ... }
  }
}
```

### DELETE /api/projects/:id
Delete project and associated files

**Parameters**
- `id` (string, required) - Project UUID

**Response**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

## Carousel Generation

### POST /api/carousel/generate
Generate single carousel from document

**Request Body**
```json
{
  "projectId": "uuid",
  "document": {
    "slides": [
      {
        "texts": ["Hello World"],
        "images": [{ "url": "data:image/png;base64,..." }],
        "position": "center",
        "alignment": "center",
        "style": "modern",
        "fontSize": 36
      }
    ],
    "settings": {
      "slideSize": {
        "width": 1080,
        "height": 1080
      }
    },
    "theme": {
      "primary": "#007bff",
      "background": "#ffffff"
    }
  }
}
```

**Response**
```json
{
  "success": true,
  "jobId": "carousel-1234567890",
  "downloadUrl": "/outputs/projects/uuid/download.zip",
  "files": [
    {
      "url": "/outputs/projects/uuid/slide-1.png",
      "filename": "slide-1.png"
    }
  ]
}
```

### POST /api/carousel/bulk-generate
Bulk generate multiple carousel sets

**Request Body**
```json
{
  "title": "Bulk Generation",
  "count": 4,
  "settings": {
    "width": 1080,
    "height": 1080,
    "slideCount": 3,
    "slides": [
      {
        "slideNumber": 1,
        "mediaFiles": [
          {
            "preview": "data:image/png;base64,...",
            "name": "image1.png",
            "type": "image/png",
            "size": 12345
          }
        ],
        "texts": ["Text 1", "Text 2", "Text 3"],
        "textConfig": {
          "position": "center",
          "alignment": "center",
          "style": "tiktok",
          "fontSize": 16
        }
      }
    ]
  }
}
```

**Response**
```json
{
  "success": true,
  "message": "Bulk generation completed",
  "jobId": "bulk-1234567890",
  "projectId": "bulk-1234567890",
  "setsRequested": 4,
  "generatedFiles": [
    {
      "id": "set-1",
      "filename": "set-1.zip",
      "status": "completed",
      "downloadUrl": "http://localhost:3003/outputs/bulk/bulk-1234567890/set-1.zip",
      "setNumber": 1,
      "files": [
        "bulk/bulk-1234567890/set-1-slide-1.png",
        "bulk/bulk-1234567890/set-1-slide-2.png",
        "bulk/bulk-1234567890/set-1-slide-3.png"
      ]
    }
  ]
}
```

### GET /api/carousel/project/:id/download
Download project ZIP file

**Parameters**
- `id` (string, required) - Project ID

**Response**
- Content-Type: application/zip
- Content-Disposition: attachment; filename="carousel-{id}.zip"
- Binary ZIP file containing all generated images

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (missing required fields)
- `404` - Not Found (project doesn't exist)
- `500` - Internal Server Error

## Text Styles

Available text style values for `textConfig.style`:
- `modern` - Bold clean text
- `tiktok` - Bold outline with shadow
- `instagram` - Gradient background box
- `elegant` - Script/handwritten
- `classic` - Serif with borders
- `minimalist` - Light with spacing
- `y2k` - Neon futuristic
- `kinetic` - RGB shift effect
- `sketch` - Hand-drawn style

## Position & Alignment

**Position** (vertical):
- `top` - Text at top of image
- `center` - Text at center (default)
- `bottom` - Text at bottom

**Alignment** (horizontal):
- `left` - Align text to left
- `center` - Center text (default)
- `right` - Align text to right

## File Storage

Generated files are stored in:
- Single carousel: `backend/outputs/projects/{projectId}/`
- Bulk generation: `backend/outputs/bulk/{projectId}/`

Files are automatically cleaned up when project is deleted.

## Rate Limiting

Currently no rate limiting implemented (local development only).

## CORS

CORS is enabled for these origins:
- http://localhost:5178
- http://localhost:5177
- http://localhost:5176
- http://localhost:5175
- http://localhost:5174
- http://localhost:5173
- http://localhost:3000

Add more origins in `backend/src/index.ts` if needed.
