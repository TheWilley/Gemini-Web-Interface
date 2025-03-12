/**
 * Exports an object as a file.
 * @param data The object to export.
 * @param id The unique ID used to validate the file.
 * @param fileName The name of the exported file.
 */
export function exportJson(data: Record<string, unknown>, id: string, fileName: string) {
  const exportData = {
    id,
    ...data,
  };

  const dataStr = JSON.stringify(exportData, null, 2);

  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Imports a object from a file
 * @param file The file to import.
 * @param id The unique ID which will be validated.
 * @param callback The callback function containing the imported data.
 */
export function importJson(
  file: File,
  id: string,
  callback: (data: Record<string, unknown>) => void
) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const fileContent = reader.result as string;
      const parsedData = JSON.parse(fileContent);

      if (parsedData.id === id) {
        callback(parsedData);
      } else {
        alert('Invalid file format or missing unique identifier.');
      }
    } catch (error) {
      alert('Error reading or parsing the file.');
    }
  };

  reader.readAsText(file);
}
