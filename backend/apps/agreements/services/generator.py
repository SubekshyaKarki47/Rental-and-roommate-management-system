"""
Standard Nepali Tenancy Agreement generator adhering to Chapter 9
of the National Civil (Code) Act, 2074 (Tenancy Laws of Nepal).
"""
from typing import List, Dict, Any


def generate_standard_nepali_clauses(
    property_title: str,
    monthly_rent: float,
    deposit: float,
    rent_due_day: int = 1
) -> List[Dict[str, Any]]:
    return [
        {
            "clause_number": 1,
            "title": "Premises & Permitted Use",
            "body": f"The Landlord agrees to let and the Tenant agrees to take the premises described as '{property_title}' strictly for residential domestic dwelling purposes. Commercial activities, unregistered subletting, or hazardous storage are strictly prohibited."
        },
        {
            "clause_number": 2,
            "title": "Rent Payment & Currency",
            "body": f"The agreed monthly rent shall be NPR {int(monthly_rent):,} (Nepalese Rupees), payable in advance by or on the {rent_due_day}st day of each Gregorian calendar month via digital transfer (eSewa/Khalti/ConnectIPS) or designated bank receipt."
        },
        {
            "clause_number": 3,
            "title": "Security Deposit & Refund Policy",
            "body": f"The Tenant has deposited with the Landlord a refundable security deposit of NPR {int(deposit):,}. This deposit shall be refunded to the Tenant within 15 calendar days following the handover of peaceful vacant possession, after deductions for outstanding utility arrears or tenant-induced damages beyond normal wear and tear."
        },
        {
            "clause_number": 4,
            "title": "Utilities & Incidental Charges",
            "body": "The Tenant shall punctually bear and pay for all electricity (NEA sub-meter units), community water supply / tanker delivery contributions, internet subscription fees, and ward waste collection fees incurred during the occupancy period."
        },
        {
            "clause_number": 5,
            "title": "Notice of Termination & Vacation",
            "body": "Either party may terminate this tenancy by tendering thirty-five (35) days written or verified in-app notice to the other party, in accordance with Section 398 of the National Civil (Code) Act, 2074."
        },
        {
            "clause_number": 6,
            "title": "Repairs, Maintenance & Inspection",
            "body": "The Landlord shall be liable for major structural faults, roof water-proofing, and external plumbing. The Tenant shall be responsible for routine day-to-day maintenance, replacement of light bulbs, internal faucet washers, and prompt reporting of defects. The Landlord reserves the right to inspect premises with 24 hours prior courteous notice."
        },
        {
            "clause_number": 7,
            "title": "Peaceful Enjoyment & Neighbor Harmony",
            "body": "The Tenant covenants to observe quiet hours between 10:00 PM and 6:00 AM, maintain respectful relations with neighbors, and comply with all municipal ward directives and society by-laws."
        },
        {
            "clause_number": 8,
            "title": "Jurisdiction & Governing Law",
            "body": "This agreement shall be governed, interpreted, and construed in conformity with the laws of Nepal. Any disputes arising hereunder shall fall within the primary jurisdiction of the Local Ward Judicial Committee (KMC/LMC/BMC) and the Kathmandu District Court."
        }
    ]
