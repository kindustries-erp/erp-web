import React from "react";

export interface XmlUploadDropzoneProps {
  dragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFilesSelected: (files: FileList) => void;
}

export type UploadDropzoneProps = XmlUploadDropzoneProps;
