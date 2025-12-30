"use client";

import React from "react";
import { FilePond, registerPlugin } from "react-filepond";
import type { FilePondFile, FilePondInitialFile } from "filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

// Register plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

export interface FilePondUploadProps {
  allowMultiple?: boolean;
  maxFiles?: number;
  instantUpload?: boolean;
  allowProcess?: boolean;
  allowRevert?: boolean;
  acceptedFileTypes?: string[];
  initialFiles?: FilePondInitialFile[];
  onupdatefiles?: (fileItems: FilePondFile[]) => void;
  maxFileSize?: string;
  labelIdle?: string;
  disabled?: boolean;
  className?: string;
  credits?: false;
}

export function FilePondUpload({
  allowMultiple = false,
  maxFiles = 1,
  instantUpload = false,
  allowProcess = false,
  allowRevert = true,
  acceptedFileTypes,
  initialFiles,
  onupdatefiles,
  maxFileSize = "10MB",
  labelIdle = 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
  disabled = false,
  className,
  credits = false,
}: FilePondUploadProps) {
  return (
    <div className={className}>
      <FilePond
        files={initialFiles}
        onupdatefiles={onupdatefiles}
        allowMultiple={allowMultiple}
        maxFiles={maxFiles}
        instantUpload={instantUpload}
        allowProcess={allowProcess}
        allowRevert={allowRevert}
        acceptedFileTypes={acceptedFileTypes}
        maxFileSize={maxFileSize}
        labelIdle={labelIdle}
        disabled={disabled}
        credits={credits}
      />
    </div>
  );
}

export { type FilePondFile, type FilePondInitialFile };
