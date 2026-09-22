import { fetchSheetsDataFromGoogle } from '../../src/utils/sheets';

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const spreadsheetId =
    (req.query && (req.query.spreadsheetId as string)) ||
    '1kDg5T5Nv9UqHPRDNw2tgLNrrqMIkcjb-_aIFnE5rDV4';

  try {
    const data = await fetchSheetsDataFromGoogle(spreadsheetId);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Error processing Google Sheets data'
    });
  }
}
