import type { LawUpdate } from '@/ai/flows/display-law-updates-with-summaries';

export type TemplateField = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date';
  placeholder: string;
  defaultValue?: string;
};

export type DocumentTemplate = {
  value: string;
  label: string;
  description: string;
  fields: TemplateField[];
};

export const documentTemplates: DocumentTemplate[] = [
  {
    value: 'rental-agreement',
    label: 'Rental Agreement',
    description: 'A contract for leasing residential property.',
    fields: [
      { name: 'landlordName', label: 'Landlord Name', type: 'text', placeholder: 'e.g., Ashok Kumar' },
      { name: 'tenantName', label: 'Tenant Name', type: 'text', placeholder: 'e.g., Priya Singh' },
      { name: 'propertyAddress', label: 'Property Address', type: 'textarea', placeholder: 'Full address of the property' },
      { name: 'rentAmount', label: 'Monthly Rent (INR)', type: 'number', placeholder: 'e.g., 25000' },
      { name: 'securityDeposit', label: 'Security Deposit (INR)', type: 'number', placeholder: 'e.g., 50000' },
      { name: 'leaseTerm', label: 'Lease Term (months)', type: 'number', placeholder: 'e.g., 11' },
      { name: 'startDate', label: 'Start Date', type: 'date', placeholder: '' },
    ],
  },
  {
    value: 'nda',
    label: 'Non-Disclosure Agreement (NDA)',
    description: 'A contract to protect confidential information.',
    fields: [
      { name: 'disclosingParty', label: 'Disclosing Party', type: 'text', placeholder: 'e.g., InnovateCorp Pvt. Ltd.' },
      { name: 'receivingParty', label: 'Receiving Party', type: 'text', placeholder: 'e.g., Anjali Sharma' },
      { name: 'effectiveDate', label: 'Effective Date', type: 'date', placeholder: '' },
      { name: 'term', label: 'Term of Agreement (years)', type: 'number', placeholder: 'e.g., 3' },
      { name: 'confidentialInfo', label: 'Description of Confidential Information', type: 'textarea', placeholder: 'e.g., Business plans, financial data, customer lists' },
    ],
  },
  {
    value: 'partnership-deed',
    label: 'Partnership Deed',
    description: 'An agreement between partners of a firm.',
    fields: [
      { name: 'partnershipName', label: 'Partnership Firm Name', type: 'text', placeholder: 'e.g., Creative Solutions Co.' },
      { name: 'partnerNames', label: 'Partner Names (comma-separated)', type: 'text', placeholder: 'e.g., Rohan Gupta, Vikram Verma' },
      { name: 'businessNature', label: 'Nature of Business', type: 'textarea', placeholder: 'e.g., Digital marketing and web development services' },
      { name: 'capitalContribution', label: 'Capital Contribution Details', type: 'textarea', placeholder: 'Details of each partner\'s contribution' },
      { name: 'profitSharingRatio', label: 'Profit/Loss Sharing Ratio', type: 'text', placeholder: 'e.g., 50:50' },
    ],
  },
  {
    value: 'affidavit',
    label: 'General Affidavit',
    description: 'A sworn statement of fact made under oath.',
    fields: [
      { name: 'deponentName', label: 'Deponent Name', type: 'text', placeholder: 'e.g., Sunita Devi' },
      { name: 'deponentAddress', label: 'Deponent Address', type: 'textarea', placeholder: 'Full residential address' },
      { name: 'statement', label: 'Statement of Facts', type: 'textarea', placeholder: 'Describe the facts you are swearing to.' },
      { name: 'placeOfSwearing', label: 'Place of Swearing', type: 'text', placeholder: 'e.g., New Delhi' },
    ],
  },
  {
    value: 'consumer-complaint',
    label: 'Consumer Complaint',
    description: 'A formal complaint filed by a consumer against a seller or service provider.',
    fields: [
        { name: 'complainantName', label: 'Complainant Name', type: 'text', placeholder: 'e.g., Neha Gupta' },
        { name: 'complainantAddress', label: 'Complainant Address', type: 'textarea', placeholder: 'Full residential address' },
        { name: 'oppositePartyName', label: 'Opposite Party Name / Company', type: 'text', placeholder: 'e.g., Acme Electronics Pvt. Ltd.' },
        { name: 'oppositePartyAddress', label: 'Opposite Party Address', type: 'textarea', placeholder: 'Full official address' },
        { name: 'transactionDetails', label: 'Transaction Details', type: 'textarea', placeholder: 'Date, amount, and description of purchase/service' },
        { name: 'complaintDetails', label: 'Complaint Details', type: 'textarea', placeholder: 'Detailed description of the issue and defect in goods/service' },
        { name: 'reliefSought', label: 'Relief Sought', type: 'textarea', placeholder: 'e.g., Full refund of Rs. 5000, replacement of product' },
    ]
  },
];

export const lawUpdates: LawUpdate[] = [
  {
    title: 'Supreme Court Clarifies GST on Corporate Guarantees',
    summary: 'The Supreme Court of India has issued a landmark judgment clarifying the applicability of Goods and Services Tax (GST) on personal guarantees provided by directors for corporate loans.',
    link: 'https://example.com/sc-gst-guarantees',
    timestamp: 1698147800,
  },
  {
    title: 'New Digital Personal Data Protection Act, 2023 Enacted',
    summary: 'The Indian Parliament has passed the Digital Personal Data Protection Act, 2023, introducing a comprehensive framework for data privacy and processing.',
    link: 'https://example.com/dpdp-act-2023',
    timestamp: 1697147800,
  },
  {
    title: 'SEBI Introduces Stricter Norms for IPOs',
    summary: 'The Securities and Exchange Board of India (SEBI) has tightened the regulations for companies launching Initial Public Offerings (IPOs) to enhance investor protection.',
    link: 'https://example.com/sebi-ipo-norms',
    timestamp: 1696147800,
  },
  {
    title: 'Competition Commission of India (CCI) Penalizes Tech Giant',
    summary: 'The CCI has imposed a significant penalty on a major technology company for abusing its dominant market position, setting a precedent for digital market regulation.',
    link: 'https://example.com/cci-tech-penalty',
    timestamp: 1695147800,
  },
  {
    title: 'High Court Rules on Remote Work Policies',
    summary: 'A High Court ruling has provided legal clarity on the obligations of employers and the rights of employees concerning remote and hybrid work arrangements.',
    link: 'https://example.com/hc-remote-work',
    timestamp: 1694147800,
  },
  {
    title: 'Changes in Foreign Direct Investment (FDI) Policy for Space Sector',
    summary: 'The government has amended the FDI policy to allow up to 100% foreign investment in the space sector, aiming to boost private participation.',
    link: 'https://example.com/fdi-space-sector',
    timestamp: 1693147800,
  },
];

export const glossaryTerms = [
  { term: 'Affidavit', definition: 'A written statement confirmed by oath or affirmation, for use as evidence in court.' },
  { term: 'Arbitration', definition: 'A form of alternative dispute resolution (ADR) where a dispute is submitted to one or more arbitrators whose decision is binding.' },
  { term: 'Caveat', definition: 'A notice, especially in a probate, that certain actions may not be taken without informing the person who gave the notice.' },
  { term: 'Deed', definition: 'A legal document that is signed and delivered, especially one regarding the ownership of property or legal rights.' },
  { term: 'Fiduciary', definition: 'A person who holds a legal or ethical relationship of trust with one or more other parties.' },
  { term: 'Indemnity', definition: 'Security or protection against a loss or other financial burden.' },
  { term: 'Injunction', definition: 'A judicial remedy to restrain a person from beginning or continuing an action threatening or invading the legal right of another.' },
  { term: 'Litigation', definition: 'The process of taking legal action.' },
  { term: 'Non-Disclosure Agreement (NDA)', definition: 'A legal contract between at least two parties that outlines confidential material, knowledge, or information that the parties wish to share with one another for certain purposes but wish to restrict access to.' },
  { term: 'Pleadings', definition: 'The formal written statements of the parties in a civil action of their respective claims and defenses.' },
  { term: 'Power of Attorney', definition: 'A written authorization to represent or act on another\'s behalf in private affairs, business, or some other legal matter.' },
  { term: 'Writ', definition: 'A form of written command in the name of a court or other legal authority to act, or abstain from acting, in a particular way.' },
];
