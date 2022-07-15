import { useState, useEffect } from "react";

export function useRecords() {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    window.electron.ipcRenderer.requestAllRecords();
    window.electron.ipcRenderer.on("responseAllRecords", (data) => {
      setRecords(data);
    });
  }, []);

  return records;
}






