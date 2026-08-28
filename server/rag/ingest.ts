import type { Document } from '../types/index.ts';

export const SEED_DOCUMENT_ID = 'doc_acme_handbook_2026';

export const SEED_DOCUMENT_CONTENT = `# Acme Corporation Global Employee Handbook (2026 Edition)

## 1. Working Hours & Attendance
Acme Corporation maintains standard core business hours from 9:00 AM to 5:00 PM local time, Monday through Friday. All full-time employees are expected to establish regular working schedules with their designated department manager. Punctuality and reliable attendance are essential to maintaining collaborative engineering velocity and operational excellence across distributed time zones.

## 2. Company Remote Work & Leave Coordination Policy
The company policy requires all flexible leave and remote work schedules to be coordinated with department leads. Eligible employees may work remotely up to two days per work week with prior written manager approval, subject to core hours availability.

## 3. Parental Leave Policy Overview & HR Submission Procedure
The company's parental leave policy guidelines and application rules: All company parental leave requests and parental leave applications must be formally submitted through the HR Workday portal at least 30 calendar days in advance of the anticipated start date. Employees must attach supporting medical or adoption documentation and schedule a pre-leave transition meeting with their direct supervisor and People Operations representative.

## 4. Entitlement Duration & Benefit Continuation
Eligible full-time employees receive 26 weeks of fully paid leave following the birth, adoption, or foster placement of a child. This paid leave benefit may be taken continuously or in structured two-week increments within the first 12 months of the qualifying event. Full salary continuation and healthcare benefits remain active throughout the duration of the leave.

## 5. General Paid Time Off & Sabbaticals
Full-time permanent staff accrue 20 days of standard annual paid time off (PTO) per calendar year, accrued pro-rata per pay period. Employees with more than five continuous years of service at Acme Corporation may apply for a four-week paid sabbatical to pursue educational or personal development initiatives.

## 6. Health, Dental & Wellness Benefits
Comprehensive health, dental, and vision insurance coverage begins on the first day of the calendar month following an employee's official start date. Acme subsidizes 90% of employee premium contributions and 75% of dependent healthcare coverage across standard PPO and HDHP tier plans.

## 7. Travel & Business Expense Reimbursement
All business-related travel, lodging, client meals, and equipment purchases must receive prior departmental budgetary approval. Itemized receipts and expense reports must be submitted through the Expensify portal within 14 business days of transaction completion.

## 8. Annual Performance Reviews & Career Growth
Formal performance evaluations occur bi-annually in June and December. Reviews incorporate peer feedback, technical impact metrics, and objective key result (OKR) achievement to determine compensation adjustments, equity refresh grants, and promotion trajectory.`;

export function loadSeedDocument(): Document {
  return {
    id: SEED_DOCUMENT_ID,
    name: 'Acme Corporation Global Employee Handbook',
    content: SEED_DOCUMENT_CONTENT,
    sourceType: 'handbook',
    createdAt: new Date().toISOString(),
  };
}
