import * as ExcelJS from 'exceljs';

export const excelSheetParser = async (fileUrl: string): Promise<any[]> => {
  const relativePath = fileUrl?.split('/uploads/')[1];
  const filePath = `uploads/${relativePath}`;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0];
  const rows: any[][] = [];

  worksheet.eachRow(row => {
    rows.push(
      Array.isArray(row.values) ? row.values : Object.values(row.values),
    );
  });

  return rows;
};
