import { useState } from 'react'
import './App.css'
import FileUpload from './components/FileUpload'
import DataTable from './components/DataTable'
import { Charts } from './components/Charts'
import type { ParsedData } from './types'

function App() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)

  const handleDataParsed = (data: ParsedData) => {
    setParsedData(data)
  }

  const handleReset = () => {
    setParsedData(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Excel Insights</h1>
        <p>Lightweight Excel & CSV Analysis Tool</p>
      </header>

      <main className="app-main">
        {!parsedData ? (
          <FileUpload onDataParsed={handleDataParsed} />
        ) : (
          <>
            <div className="upload-success">
              <div className="success-info">
                <div>
                  <strong>{parsedData.filename}</strong>
                  <span className="file-meta"> - {parsedData.rowCount} rows, {parsedData.columns.length} columns</span>
                </div>
              </div>
              <button onClick={handleReset} className="btn-reset">
                Upload New File
              </button>
            </div>

            <DataTable parsedData={parsedData} />
            <Charts data={parsedData} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React, TypeScript, and Recharts</p>
      </footer>
    </div>
  )
}

export default App
