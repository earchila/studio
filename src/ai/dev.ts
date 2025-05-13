import { config } from 'dotenv';
config();

import '@/ai/flows/improve-ocr-accuracy.ts';
import '@/ai/flows/extract-contract-data.ts';
import '@/ai/flows/detect-potential-breaches.ts';
import '@/ai/flows/determine-data-extraction-quality.ts';