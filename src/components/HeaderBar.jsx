import React, { useRef } from "react";

function InfoItem({ value }) {
  return (
    <div className="app-header-info-item" title={value}>
      <span className="app-header-info-value">{value}</span>
    </div>
  );
}

export function HeaderBar({ onFileSelected, svgInfo, isProcessing = false }) {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const input = event.target;
    const file = input.files?.[0] ?? null;
    if (file && typeof onFileSelected === "function") {
      onFileSelected(file);
    }
    input.value = "";
  };

  return (
    <header className="app-header">
      <div className="app-header-left">
        <button
          type="button"
          className={"app-header-upload" + (isProcessing ? " app-header-upload--busy" : "")}
          onClick={handleUploadClick}
          disabled={isProcessing}
          aria-busy={isProcessing}
        >
          {isProcessing ? "Processing…" : "Upload SVG"}
          {isProcessing ? <span className="app-header-upload-spinner" aria-hidden="true" /> : null}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="app-header-file-input"
          onChange={handleFileChange}
        />
      </div>
      <div className="app-header-info">
        <InfoItem value={svgInfo.fileName} />
        <InfoItem value={svgInfo.scale} />
        <InfoItem value={svgInfo.drawingSize} />
        <InfoItem value={svgInfo.baseAndPadding} />
        <InfoItem value={svgInfo.strokeWidth} />
      </div>
      <a
        className="app-header-link"
        href="https://github.com/msurguy/plotter-svg-preview/"
        target="_blank"
        rel="noreferrer"
      >
        Source ↗
      </a>
    </header>
  );
}
