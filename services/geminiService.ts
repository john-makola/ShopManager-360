
import { GoogleGenAI } from "@google/genai";
import { PrintJob, Transaction, InventoryItem, Customer, Supplier } from "../types";

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
  const recentSales = transactions.filter(t => t.type === 'Income').slice(0, 5).map(t => `KSh ${t.amount}`).join(', ');

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

export const generateNotificationDraft = async (
    recipient: Customer | Supplier,
    type: 'Customer' | 'Supplier',
    template: string
): Promise<{ subject: string; body: string }> => {
    if (!process.env.API_KEY) return { subject: "Error", body: "API Key missing." };

    let context = "";
    
    if (type === 'Customer') {
        const c = recipient as Customer;
        context = `Customer: ${c.name}. Balance Due: KSh ${c.balance}. Total Spent: KSh ${c.totalSpent}.`;
    } else {
        const s = recipient as Supplier;
        context = `Supplier: ${s.name}. Category: ${s.category}. Contact: ${s.contactPerson}.`;
    }

    const prompt = `
        You are an AI assistant for "Shop Manager 360".
        Generate a professional email subject and body based on the following context and template type.
        
        Context: ${context}
        Template Type: ${template}
        
        Instructions:
        1. If template is "Late Payment", be firm but polite about the outstanding balance.
        2. If template is "Statement", provide a summary cover letter attached to a statement.
        3. If template is "New Order", ask for a quotation for restocking items in their category.
        4. If template is "Marketing", thank them for being a loyal partner/customer.
        
        Return the response strictly as a JSON object with keys "subject" and "body".
        Do not include markdown code blocks.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const text = response.text || "{}";
        return JSON.parse(text);
    } catch (e) {
        console.error(e);
        return { subject: "Draft Generation Failed", body: "Please try again manually." };
    }
};
