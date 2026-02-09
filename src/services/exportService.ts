import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InstallerBranding } from '../lib/supabase';

export interface CostBreakdown {
  panels: number;
  inverter: number;
  batteries: number;
  chargeController: number;
  installation: number;
}

export interface ComponentCost {
  name: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
}

export interface DefaultPrices {
  battery: number;
  inverter: number;
  chargeController: number;
  dcBreaker: number;
  acBreaker: number;
  solarPanel: number;
}

export interface SampleLoad {
  name: string;
  quantity: number;
  wattage: number;
}

export interface ProposalData {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  systemSize: number;
  totalLoad: number;
  inverterSize: number;
  numberOfPanels: number;
  panelCapacity: number;
  batteries: number;
  chargeController: number;
  totalCost?: number;
  backupHours?: number;
  dailyEnergy?: number;
  costBreakdown?: CostBreakdown;
  sampleLoads?: SampleLoad[];
  currency?: string;
  componentCosts?: ComponentCost[];
  defaultPrices?: DefaultPrices;
  customItems?: ComponentCost[];
  installationFees?: number;
  loads?: {
    lights: any[];
    tvs: any[];
    fans: any[];
    refrigerators: any[];
    freezers: any[];
    washingMachines: any[];
    waterPumps: any[];
    airConditioners: any[];
    laptops: any[];
    routers: any[];
    cctvCameras: any[];
  };
}

export const generateWhatsAppSummary = (
  data: ProposalData,
  companyName: string,
  companyTagline?: string | null
): string => {
  return `*${companyName}*${companyTagline ? `\n_${companyTagline}_` : ''}
*Solar System Proposal*

📋 *Client:* ${data.clientName}
${data.clientPhone ? `📱 *Phone:* ${data.clientPhone}` : ''}

⚡ *System Overview*
• System Size: ${data.systemSize} kW
• Total Load: ${(data.totalLoad / 1000).toFixed(2)} kW
• Solar Panels: ${data.numberOfPanels} × ${data.panelCapacity}W
• Inverter: ${(data.inverterSize / 1000).toFixed(1)} kW
• Batteries: ${data.batteries} × 200Ah (12V)
• Charge Controller: ${data.chargeController}A MPPT

${data.backupHours ? `🔋 *Backup Duration:* ${data.backupHours} hours` : ''}
${data.dailyEnergy ? `💡 *Daily Energy:* ${data.dailyEnergy.toFixed(2)} kWh` : ''}
${data.totalCost ? `💰 *Total Investment:* $${data.totalCost.toLocaleString()}` : ''}

✅ Complete installation package
✅ Professional design & installation
✅ Quality components & warranty

For more details or to proceed, please contact us!`;
};

export const generateEmailQuotation = (
  data: ProposalData,
  companyName: string,
  branding?: InstallerBranding,
  companyLogoUrl?: string | null,
  companyTagline?: string | null
): string => {
  const primaryColor = branding?.primary_color || '#2563eb';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solar System Proposal</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${branding?.secondary_color || '#1e40af'} 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    ${companyLogoUrl ? `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${companyLogoUrl}" alt="${companyName}" style="max-height: 80px; max-width: 200px; object-fit: contain;" />
    </div>
    ` : ''}
    <h1 style="margin: 0 0 10px 0; font-size: 28px;">${companyName}</h1>
    ${companyTagline ? `<p style="margin: 0; opacity: 0.9; font-size: 14px;">${companyTagline}</p>` : ''}
    <h2 style="margin: 20px 0 0 0; font-size: 22px;">Solar System Proposal</h2>
  </div>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: ${primaryColor};">Client Information</h3>
    <p><strong>Name:</strong> ${data.clientName}</p>
    ${data.clientEmail ? `<p><strong>Email:</strong> ${data.clientEmail}</p>` : ''}
    ${data.clientPhone ? `<p><strong>Phone:</strong> ${data.clientPhone}</p>` : ''}
  </div>

  <div style="background: white; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: ${primaryColor};">System Specifications</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>System Size</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.systemSize} kW</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Total Load Capacity</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${(data.totalLoad / 1000).toFixed(2)} kW</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Solar Panels</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.numberOfPanels} × ${data.panelCapacity}W</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Inverter</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${(data.inverterSize / 1000).toFixed(1)} kW Pure Sine Wave</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Battery Bank</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.batteries} × 200Ah (12V)</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Charge Controller</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.chargeController}A MPPT</td>
      </tr>
      ${data.backupHours ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Backup Duration</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.backupHours} hours</td>
      </tr>
      ` : ''}
      ${data.dailyEnergy ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Daily Energy Production</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.dailyEnergy.toFixed(2)} kWh</td>
      </tr>
      ` : ''}
    </table>
  </div>

  ${data.totalCost ? `
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
    <h3 style="margin: 0 0 10px 0;">Total Investment</h3>
    <p style="margin: 0; font-size: 32px; font-weight: bold;">$${data.totalCost.toLocaleString()}</p>
  </div>
  ` : ''}

  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: ${primaryColor};">What's Included</h3>
    <ul style="margin: 0; padding-left: 20px;">
      <li>Professional system design and engineering</li>
      <li>High-quality solar panels with warranty</li>
      <li>Pure sine wave inverter</li>
      <li>Deep cycle battery bank</li>
      <li>MPPT charge controller for maximum efficiency</li>
      <li>All necessary wiring, breakers, and mounting hardware</li>
      <li>Professional installation by certified technicians</li>
      <li>System testing and commissioning</li>
      <li>Warranty and after-sales support</li>
    </ul>
  </div>

  <div style="text-align: center; padding: 20px 0;">
    <p style="color: #6b7280; font-size: 14px;">
      ${branding?.website ? `<a href="${branding.website}" style="color: ${primaryColor};">${branding.website}</a><br>` : ''}
      This proposal is valid for 30 days from the date of issue.
    </p>
  </div>

  <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
    <p>Generated by SolalaSolar</p>
  </div>
</body>
</html>
  `;
};

export const generatePDF = async (
  elementId: string,
  fileName: string,
  branding?: InstallerBranding
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const availableWidth = pdfWidth - (margin * 2);
  const availableHeight = pdfHeight - (margin * 2);

  // Find all elements with page-break-before
  const pageBreakElements = Array.from(element.querySelectorAll('[style*="pageBreakBefore"]'));

  if (pageBreakElements.length === 0) {
    // No page breaks, use original method
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidthMM = availableWidth;
    const imgHeightMM = (canvas.height * availableWidth) / canvas.width;

    let heightLeft = imgHeightMM;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, imgWidthMM, imgHeightMM);
    heightLeft -= availableHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeightMM + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidthMM, imgHeightMM);
      heightLeft -= availableHeight;
    }
  } else {
    // Split content into sections based on page breaks
    const sections: HTMLElement[] = [];
    let currentSection = document.createElement('div');
    currentSection.style.cssText = `
      background-color: #ffffff;
      width: ${element.offsetWidth}px;
      padding: ${window.getComputedStyle(element).padding};
      font-family: ${window.getComputedStyle(element).fontFamily};
    `;

    Array.from(element.children).forEach((child) => {
      const hasPageBreak = child.getAttribute('style')?.includes('pageBreakBefore');

      if (hasPageBreak && currentSection.children.length > 0) {
        sections.push(currentSection);
        currentSection = document.createElement('div');
        currentSection.style.cssText = `
          background-color: #ffffff;
          width: ${element.offsetWidth}px;
          padding: ${window.getComputedStyle(element).padding};
          font-family: ${window.getComputedStyle(element).fontFamily};
        `;
      }

      currentSection.appendChild(child.cloneNode(true));
    });

    if (currentSection.children.length > 0) {
      sections.push(currentSection);
    }

    // Render each section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      section.style.position = 'absolute';
      section.style.left = '-9999px';
      section.style.top = '0';
      document.body.appendChild(section);

      const canvas = await html2canvas(section, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
      });

      document.body.removeChild(section);

      const imgData = canvas.toDataURL('image/png');
      const imgWidthMM = availableWidth;
      const imgHeightMM = (canvas.height * availableWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      let heightLeft = imgHeightMM;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidthMM, imgHeightMM);
      heightLeft -= availableHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeightMM + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidthMM, imgHeightMM);
        heightLeft -= availableHeight;
      }
    }
  }

  pdf.save(fileName);
};

export const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
};

export const sendEmail = (to: string, subject: string, htmlBody: string): void => {
  const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('Please view this email in an HTML-capable email client.')}`;
  window.open(mailtoLink, '_blank');
};

export const shareViaWhatsApp = (text: string, phone?: string): void => {
  const encodedText = encodeURIComponent(text);
  const url = phone
    ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank');
};
