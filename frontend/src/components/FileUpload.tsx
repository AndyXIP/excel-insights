import { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import type { ParsedData } from '../types';
import './FileUpload.css';

interface FileUploadProps {
  onDataParsed: (data: ParsedData) => void;
}

export default function FileUpload({ onDataParsed }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<ParsedData>(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onDataParsed(response.data);
    } catch (err: any) {
      const messageFromServer = err?.response?.data?.error as string | undefined;
      if (messageFromServer) {
        setError(messageFromServer);
      } else {
        // Likely network/proxy/back-end not running
  setError(`Failed to upload. Cannot reach API at ${API_BASE}. Make sure the backend is running on port 5050.`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <h2>Upload Excel or CSV File</h2>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p className="status">Uploading and parsing...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
