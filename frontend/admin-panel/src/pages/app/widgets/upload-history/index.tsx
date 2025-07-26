import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDiq } from "@/lib/diq";
import { usePaasibleApi } from "@/lib/paasible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Upload,
  FileArchive,
  CheckCircle2,
  X,
} from "lucide-react";

interface UploadState {
  file: File | null;
  isUploading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export const UploadHistoryWidget = (props: { onSuccess?: () => void }) => {
  const api = usePaasibleApi();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    isUploading: false,
    isSuccess: false,
    error: null,
  });

  const uploadHistoryMutation = useDiq(api.Mutations.uploadHistory);

  const validateFile = useCallback((file: File): string | null => {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      return "Пожалуйста, выберите ZIP архив";
    }
    if (file.size > 1024 * 1024 * 1024) {
      // 50MB limit
      return "Размер файла не должен превышать 1Gb";
    }
    return null;
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setUploadState((prev) => ({
          ...prev,
          error,
          file: null,
          isSuccess: false,
        }));
        return;
      }

      setUploadState((prev) => ({
        ...prev,
        file,
        error: null,
        isSuccess: false,
      }));
    },
    [validateFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleUpload = useCallback(async () => {
    if (!uploadState.file) return;

    setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append("file", uploadState.file);

      const result = await uploadHistoryMutation.request(uploadState.file);

      console.log("Upload result:", result);

      if (result instanceof Error || (result && result.status === "error")) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: result.message || "Произошла ошибка при загрузке файла",
        }));
        return;
      }

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        isSuccess: true,
      }));

      if (props.onSuccess) {
        props.onSuccess();
      }
    } catch {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: "Произошла ошибка при загрузке файла",
      }));
    }
  }, [uploadState.file, uploadHistoryMutation]);

  const handleReset = useCallback(() => {
    setUploadState({
      file: null,
      isUploading: false,
      isSuccess: false,
      error: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (uploadState.isSuccess) {
    return (
      <Card className="border-green-200 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-800">
              Успешно загружено!
            </h1>
            <p className="text-green-600">
              История чата была успешно импортирована из архива
            </p>
            <p className="text-sm text-gray-600">{uploadState.file?.name}</p>
            <Button
              onClick={handleReset}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Загрузить еще один архив
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-l gap-0">
        <CardContent className="">
          <div className="space-y-6">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                uploadState.file && "border-green-500 bg-green-50"
              )}
            >
              <div className="flex flex-col items-center space-y-4">
                {uploadState.file ? (
                  <FileArchive className="w-12 h-12 text-green-600" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400" />
                )}

                {uploadState.file ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-800">
                      Файл выбран:
                    </p>
                    <p className="text-sm text-green-600">
                      {uploadState.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700">
                      Перетащите ZIP архив сюда
                    </p>
                    <p className="text-sm text-gray-500">
                      или нажмите для выбора файла
                    </p>
                    <p className="text-xs text-gray-400">
                      Максимальный размер: 50MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error message */}
            {uploadState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>{uploadState.error}</AlertDescription>
              </Alert>
            )}

            {/* Upload button */}
            <div className="flex space-x-2">
              <Button
                onClick={handleUpload}
                disabled={!uploadState.file || uploadState.isUploading}
                className="flex-1"
              >
                {uploadState.isUploading ? "Загружается..." : "Загрузить архив"}
              </Button>

              {uploadState.file && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={uploadState.isUploading}
                  className="px-3"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
