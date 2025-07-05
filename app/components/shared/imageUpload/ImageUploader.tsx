import { cn } from "~/lib/utils";
import { PencilLine, Upload, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Slider } from "~/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface Point {
  x: number;
  y: number;
}
interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Props for the ImageUploader component
 */
interface ImageUploaderProps {
  aspectRatio?: number;
  maxSize?: number;
  acceptedFileTypes?: string[];
  className?: string;
  placeholder?: string;
  imageError?: boolean;
  onImageCropped?: (blob: Blob) => void;
  onImageRemoved?: () => void;
}

export function ImageUploader({
  aspectRatio = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"],
  className,
  placeholder = "Drag and drop or click to upload an image",
  imageError,
  onImageCropped,
  onImageRemoved,
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    setError(null);

    if (!acceptedFileTypes.includes(file.type)) {
      setError(
        `File type not supported. Accepted types: ${acceptedFileTypes.join(
          ", "
        )}`
      );
      return;
    }

    if (file.size > maxSize) {
      setError(`File is too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setIsCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const cropImage = useCallback(async () => {
    if (!image || !croppedAreaPixels) return;

    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = image;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        img,
        croppedAreaPixels.x * scaleX,
        croppedAreaPixels.y * scaleY,
        croppedAreaPixels.width * scaleX,
        croppedAreaPixels.height * scaleY,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          setPreviewImage(previewUrl);
          if (onImageCropped) {
            onImageCropped(blob);
          }
          setIsCropDialogOpen(false);
        }
      }, "image/jpeg");
    }
  }, [image, croppedAreaPixels]);

  const clearImage = () => {
    setPreviewImage(null);
    setImage(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);

    if (onImageRemoved) {
      onImageRemoved();
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    console.log("Image removed");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Card className="w-full h-full p-0">
        <CardContent className="px-0 h-full">
          {!previewImage ? (
            <div
              className={`border-2 border-dashed rounded-lg p-2 text-center cursor-pointer hover:bg-muted/20 transition-colors h-full flex flex-col justify-center items-center ${imageError ? "border-red-500" : ""}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              style={{ aspectRatio: `${aspectRatio}` }}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={acceptedFileTypes.join(",")}
                onChange={(e) =>
                  handleFileSelect(e.target.files ? e.target.files[0] : null)
                }
              />
              <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2.5 text-xs text-muted-foreground">
                {placeholder}
              </p>
              {error && (
                <p className="mt-1 text-xs text-destructive">{error}</p>
              )}
            </div>
          ) : (
            <div
              className="relative rounded-lg overflow-hidden h-full"
              style={{ aspectRatio: `${aspectRatio}` }}
            >
              <img
                src={previewImage}
                alt="Cropped preview"
                className="w-full h-full rounded-lg object-cover"
              />
              <div className="absolute top-1 right-1 flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                        onClick={() => setIsCropDialogOpen(true)}
                      >
                        <PencilLine size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit image</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                        onClick={clearImage}
                      >
                        <X size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove image</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          {image && (
            <>
              <div className="relative w-full h-80">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="flex items-center gap-4">
                <ZoomOut className="h-4 w-4" />
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setZoom(value[0])}
                />
                <ZoomIn className="h-4 w-4" />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCropDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={cropImage}>Apply</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
