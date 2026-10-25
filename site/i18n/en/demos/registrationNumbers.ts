import type ja from '../../ja/demos/registrationNumbers';

export default {
  try: 'Enter 7000012050002, and “国税庁” (National Tax Agency) fills in as the company name (sample data).',
  comments: {
    lookup: 'Looks up the company name from the corporate number. The sample uses a local table (in practice, call the National Tax Agency’s Corporate Number System Web-API from your own server)',
    myNumber: 'Accepts full-width digits, spaces and hyphens, and normalizes them to digits only',
    check: 'isMyNumber verifies the digit count and check digit after the person tries to submit (no errors while they are still typing)',
    company: 'Looks up the company once the number is a valid 13 digits, and fills in only an empty field or one still holding the name it filled in before',
  },
} satisfies typeof ja;
