import { GoogleGenAI } from "@google/genai";
import { PrintJob, Transaction, InventoryItem } from "../types";

// Initialize Gemini
// CRITICAL: process.env.API_KEY is assumed to be available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBusinessInsights = async (
  jobs: PrintJob[],
  transactions: Transaction[],
  inventory: InventoryItem[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Unable to generate AI insights.";
  }

  const jobSummary = jobs.map(j => `${j.title} (${j.status}) - ${j.priority}`).join(', ');
  const lowStock = inventory.filter(i => i.quantity <= i.threshold).map(i => i.name).join(', ');
  const recentSales = transactions.filter(t => t.type === 'Income').slice(0, 5).map(t => `$${t.amount}`).join(', ');

  const prompt = `
    You are a smart business assistant for "Shop Manager 360", a shop.
    Analyze the following snapshot of data and provide 3 brief, actionable strategic insights or warnings.
    Focus on workflow bottlenecks, financial health, or inventory risks.
    
    Data:
    - Active Jobs: ${jobs.length} total. Samples: ${jobSummary.substring(0, 200)}...
    - Low Stock Items: ${lowStock || 'None'}
    - Recent Sales: ${recentSales}
    
    Format the output as a Markdown list. Keep it professional and concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights at this moment due to a connection error.";
  }
};

export const generateCustomerEmail = async (job: PrintJob, customerName: string): Promise<string> => {
    if (!process.env.API_KEY) return "API Key missing.";

    const prompt = `
      Write a professional email to ${customerName} regarding their print job "${job.title}".
      Status: ${job.status}.
      Context: The job is now ${job.status === 'Ready' ? 'ready for pickup' : 'being processed'}.
      Keep it short, polite, and brand it as "Shop Manager 360".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Could not generate email draft.";
    } catch (e) {
        return "Error generating draft.";
    }
}