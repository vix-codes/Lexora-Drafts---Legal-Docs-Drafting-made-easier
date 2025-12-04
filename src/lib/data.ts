import type { LawUpdate } from '@/ai/flows/display-law-updates-with-summaries';

export type LawyerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: { city: string; state: string };
  specializations: string[];
  experience: number;
  description: string;
  rating: number;
  isVerified: boolean;
  enrollmentNumber: string;
  stateBarCouncil: string;
  source: 'internal';
};


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

export const popularCitiesByState: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Delhi": ["New Delhi", "Noida", "Gurugram", "Faridabad"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
};

export const lawyers: LawyerProfile[] = [
  {
    id: '1',
    name: 'Adv. Rohan Sharma',
    email: 'rohan.sharma@example.com',
    phone: '+91-9876543210',
    location: { city: 'New Delhi', state: 'Delhi' },
    specializations: ['Corporate Law', 'Mergers & Acquisitions'],
    experience: 15,
    description: 'Expert in corporate law with extensive experience in high-stakes M&A deals.',
    rating: 4.9,
    isVerified: true,
    enrollmentNumber: 'D/1234/2008',
    stateBarCouncil: 'Delhi',
    source: 'internal'
  },
  {
    id: '2',
    name: 'Adv. Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91-9876543211',
    location: { city: 'Mumbai', state: 'Maharashtra' },
    specializations: ['Intellectual Property', 'Patent Law'],
    experience: 12,
    description: 'Specializing in patent filing and IP litigation for tech startups.',
    rating: 4.8,
    isVerified: true,
    enrollmentNumber: 'MAH/5678/2011',
    stateBarCouncil: 'Maharashtra & Goa',
    source: 'internal'
  },
  {
    id: '3',
    name: 'Adv. Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91-9876543212',
    location: { city: 'Bengaluru', state: 'Karnataka' },
    specializations: ['Criminal Law', 'Bail Matters'],
    experience: 20,
    description: 'Highly experienced criminal defense lawyer with a high success rate.',
    rating: 4.9,
    isVerified: true,
    enrollmentNumber: 'KAR/9012/2003',
    stateBarCouncil: 'Karnataka',
    source: 'internal'
  },
  {
    id: '4',
    name: 'Adv. Anjali Mehta',
    email: 'anjali.mehta@example.com',
    phone: '+91-9876543213',
    location: { city: 'Kolkata', state: 'West Bengal' },
    specializations: ['Family Law', 'Divorce', 'Child Custody'],
    experience: 18,
    description: 'Compassionate family law expert dedicated to amicable resolutions.',
    rating: 4.7,
    isVerified: true,
    enrollmentNumber: 'WB/3456/2005',
    stateBarCouncil: 'West Bengal',
    source: 'internal'
  },
  {
    id: '5',
    name: 'Adv. Sameer Khan',
    email: 'sameer.khan@example.com',
    phone: '+91-9876543214',
    location: { city: 'Pune', state: 'Maharashtra' },
    specializations: ['Real Estate Law', 'Property Disputes'],
    experience: 14,
    description: 'Handles all matters related to real estate, from registration to litigation.',
    rating: 4.6,
    isVerified: true,
    enrollmentNumber: 'MAH/7890/2009',
    stateBarCouncil: 'Maharashtra & Goa',
    source: 'internal'
  },
  {
    id: '6',
    name: 'Adv. Neha Gupta',
    email: 'neha.gupta@example.com',
    phone: '+91-9876543215',
    location: { city: 'Hyderabad', state: 'Telangana' },
    specializations: ['Cyber Law', 'Data Privacy'],
    experience: 9,
    description: 'Advising corporations on data protection compliance and cybercrime.',
    rating: 4.8,
    isVerified: true,
    enrollmentNumber: 'TS/1234/2014',
    stateBarCouncil: 'Telangana',
    source: 'internal'
  },
  {
    id: '7',
    name: 'Adv. Arjun Reddy',
    email: 'arjun.reddy@example.com',
    phone: '+91-9876543216',
    location: { city: 'Chennai', state: 'Tamil Nadu' },
    specializations: ['Tax Law', 'GST'],
    experience: 16,
    description: 'Expert in direct and indirect taxation, representing clients at various tribunals.',
    rating: 4.7,
    isVerified: true,
    enrollmentNumber: 'TN/5678/2007',
    stateBarCouncil: 'Tamil Nadu',
    source: 'internal'
  },
  {
    id: '8',
    name: 'Adv. Sneha Rao',
    email: 'sneha.rao@example.com',
    phone: '+91-9876543217',
    location: { city: 'Bengaluru', state: 'Karnataka' },
    specializations: ['Startup Law', 'Venture Capital'],
    experience: 8,
    description: 'Your go-to legal advisor for funding rounds and startup compliance.',
    rating: 4.9,
    isVerified: true,
    enrollmentNumber: 'KAR/9013/2015',
    stateBarCouncil: 'Karnataka',
    source: 'internal'
  },
];

export const legalPrecedents = [
  {
    caseName: 'Kesavananda Bharati vs. State of Kerala',
    citation: 'AIR 1973 SC 1461',
    year: 1973,
    summary: 'This case established the "Basic Structure Doctrine" of the Indian Constitution, which rules that the Parliament of India has the power to amend the Constitution, but it cannot alter its "basic structure".',
    impact: 'It is considered a cornerstone of Indian constitutional law, safeguarding the fundamental principles and integrity of the Constitution from legislative overreach.'
  },
  {
    caseName: 'Maneka Gandhi vs. Union of India',
    citation: 'AIR 1978 SC 597',
    year: 1978,
    summary: 'The Supreme Court held that the "procedure established by law" under Article 21 must be fair, just, and reasonable, not arbitrary, fanciful, or oppressive. It expanded the scope of personal liberty.',
    impact: 'This judgment significantly widened the interpretation of Article 21 (Right to Life and Personal Liberty), introducing principles of natural justice and due process into Indian law.'
  },
  {
    caseName: 'Vishaka and others vs. State of Rajasthan',
    citation: 'AIR 1997 SC 3011',
    year: 1997,
    summary: 'In the absence of a law to address sexual harassment at the workplace, the Supreme Court laid down guidelines, known as the "Vishaka Guidelines," to be followed by employers.',
    impact: 'This led to the enactment of the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013, providing a legal framework to protect women from sexual harassment at their place of work.'
  },
  {
    caseName: 'Justice K.S. Puttaswamy (Retd.) vs. Union of India',
    citation: '(2017) 10 SCC 1',
    year: 2017,
    summary: 'A nine-judge bench of the Supreme Court unanimously held that the Right to Privacy is a fundamental right under Article 21 of the Constitution of India.',
    impact: 'This landmark ruling has far-reaching implications for data protection, surveillance, and individual autonomy, forming the basis for the Personal Data Protection Bill.'
  }
];
