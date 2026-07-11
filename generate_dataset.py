#!/usr/bin/env python3
"""
Dataset Generator for Expense Management System

This script generates realistic synthetic datasets for employees, expenses, vendors,
and evaluation data based on the structure defined in backend/src/data and backend/src/eval.

Hard limits:
- 50 expenses maximum
- 10 employees maximum
- 30 vendors maximum

Usage:
    python generate_dataset.py [--seed SEED] [--expenses N] [--employees N] [--vendors N] [--output-dir DIR]

Example:
    python generate_dataset.py --seed 42 --expenses 50 --employees 10 --vendors 30 --output-dir ./generated_data
"""

import json
import random
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any


class DatasetGenerator:
    """Generate realistic expense management datasets."""

    # Hard limits
    MAX_EXPENSES = 50
    MAX_EMPLOYEES = 10
    MAX_VENDORS = 30

    DEPARTMENTS = ["Engineering", "Sales", "Marketing", "Finance", "Operations", "HR"]

    EXPENSE_CATEGORIES = [
        "meals",
        "travel",
        "software",
        "equipment",
        "office_supplies",
        "entertainment",
        "other",
    ]

    VENDOR_TEMPLATES = {
        "travel": [
            ("Uber", 22, 340),
            ("Lyft", 20, 250),
            ("Delta Airlines", 320, 25),
            ("United Airlines", 350, 30),
            ("American Airlines", 340, 30),
            ("Southwest Airlines", 280, 28),
            ("Marriott Hotels", 180, 45),
            ("Hilton Hotels", 175, 40),
            ("Holiday Inn", 150, 35),
            ("Airbnb", 210, 10),
        ],
        "meals": [
            ("Chipotle", 14, 55),
            ("Panera Bread", 16, 70),
            ("The Capital Grille", 130, 8),
            ("Olive Garden", 35, 20),
            ("McDonald's", 12, 100),
            ("Starbucks", 8, 150),
            ("Whole Foods", 25, 40),
        ],
        "software": [
            ("Slack Technologies", 99, 12),
            ("Zoom Video", 150, 12),
            ("Microsoft Office", 120, 10),
            ("Adobe Creative Cloud", 85, 8),
            ("Asana", 110, 6),
            ("Jira", 100, 5),
        ],
        "equipment": [
            ("Best Buy", 250, 5),
            ("Apple Store", 500, 8),
            ("B&H Photo", 450, 6),
            ("Newegg", 300, 10),
            ("Amazon Business", 200, 15),
        ],
        "office_supplies": [
            ("Staples", 55, 40),
            ("Office Depot", 65, 60),
            ("Amazon Business", 40, 50),
            ("Local Office Supply", 50, 35),
        ],
        "entertainment": [
            ("Golden Dragon Restaurant", 95, 6),
            ("Morton's The Steakhouse", 150, 4),
            ("Nobu", 200, 3),
            ("Comedy Club", 80, 8),
            ("Theater Box Office", 120, 5),
        ],
    }

    EMPLOYEE_NAMES = [
        "Maria Ionescu",
        "David Popescu",
        "Elena Radu",
        "Andrei Constantinescu",
        "Ioana Dumitrescu",
        "Alexandru Mihăilescu",
        "Cristina Popa",
        "Mihai Georgescu",
        "Roxana Stanescu",
        "Adrian Vlad",
    ]

    MEAL_DESCRIPTIONS = [
        "Lunch during workday",
        "Team breakfast meeting",
        "Client lunch",
        "Dinner after late work session",
        "Coffee break",
    ]

    TRAVEL_DESCRIPTIONS = [
        "Uber to client site",
        "Flight to {city}",
        "Hotel for {city} visit",
        "Rideshare to airport",
        "Rental car for site visit",
    ]

    ENTERTAINMENT_DESCRIPTIONS = [
        "Dinner with prospective client {client}",
        "Team dinner after deployment",
        "Client entertainment at {venue}",
        "Networking dinner with {client}",
    ]

    OFFICE_DESCRIPTIONS = [
        "Office supplies for team",
        "Printer paper and toner",
        "Notebooks and pens",
        "Desk organizer",
        "Cables and adapters",
    ]

    EQUIPMENT_DESCRIPTIONS = [
        "Replacement monitor for workstation",
        "New laptop docking station",
        "Replacement keyboard",
        "USB hub and peripherals",
        "Monitor arm for desk",
    ]

    CLIENTS = [
        "Acme Corp",
        "Beta LLC",
        "Gamma Industries",
        "Delta Solutions",
        "Epsilon Ventures",
    ]

    CITIES = ["Chicago", "Denver", "New York", "San Francisco", "Boston", "Austin"]

    def __init__(self, seed: int = None):
        """Initialize generator with optional random seed."""
        if seed is not None:
            random.seed(seed)

    def generate_employees(self, count: int) -> List[Dict[str, Any]]:
        """Generate employee records."""
        count = min(count, self.MAX_EMPLOYEES)
        employees = []

        for i in range(count):
            emp_id = f"EMP{i+1:03d}"
            name = self.EMPLOYEE_NAMES[i % len(self.EMPLOYEE_NAMES)]
            department = random.choice(self.DEPARTMENTS)

            spending_baseline = self._generate_spending_baseline(department)

            employees.append(
                {
                    "employeeId": emp_id,
                    "name": name,
                    "department": department,
                    "spendingBaseline": spending_baseline,
                }
            )

        return employees

    def _generate_spending_baseline(self, department: str) -> Dict[str, Any]:
        """Generate realistic spending baseline for a department."""
        baseline = {}

        if department in ["Engineering", "Operations"]:
            baseline["software"] = {"avgAmount": 100, "typicalFrequencyPerMonth": 1}
            baseline["equipment"] = {"avgAmount": 220, "typicalFrequencyPerQuarter": 1}
            baseline["office_supplies"] = {"avgAmount": 40, "typicalFrequencyPerMonth": 1}
        elif department == "Sales":
            baseline["meals"] = {"avgAmount": 45, "typicalFrequencyPerWeek": 4}
            baseline["travel"] = {"avgAmount": 400, "typicalFrequencyPerMonth": 2}
            baseline["entertainment"] = {"avgAmount": 80, "typicalFrequencyPerMonth": 3}
        elif department == "Marketing":
            baseline["software"] = {"avgAmount": 120, "typicalFrequencyPerMonth": 1}
            baseline["office_supplies"] = {"avgAmount": 30, "typicalFrequencyPerMonth": 2}
        else:
            baseline["meals"] = {"avgAmount": 20, "typicalFrequencyPerWeek": 2}
            baseline["software"] = {"avgAmount": 80, "typicalFrequencyPerMonth": 1}

        return baseline

    def generate_vendors(self, count: int) -> List[Dict[str, Any]]:
        """Generate vendor records."""
        count = min(count, self.MAX_VENDORS)
        vendors = []
        vendor_id_counter = 1
        seen_names = set()

        for category in self.EXPENSE_CATEGORIES:
            if vendor_id_counter > count:
                break

            templates = self.VENDOR_TEMPLATES.get(category, [])
            for name, avg_amount, trans_count in templates:
                if vendor_id_counter > count or name in seen_names:
                    break

                vendor_id = f"V{vendor_id_counter:03d}"
                days_ago = random.randint(30, 600)
                first_seen = (datetime.now() - timedelta(days=days_ago)).strftime(
                    "%Y-%m-%d"
                )

                vendors.append(
                    {
                        "vendorId": vendor_id,
                        "name": name,
                        "category": category,
                        "firstSeen": first_seen,
                        "transactionCount": max(1, trans_count + random.randint(-3, 3)),
                        "avgAmount": avg_amount,
                    }
                )
                seen_names.add(name)
                vendor_id_counter += 1

        return vendors

    def generate_expenses(
        self, count: int, employees: List[Dict], vendors: List[Dict]
    ) -> List[Dict[str, Any]]:
        """Generate expense records."""
        count = min(count, self.MAX_EXPENSES)
        expenses = []

        start_date = datetime.now() - timedelta(days=30)

        for i in range(count):
            exp_id = f"EXP{i+1:03d}"
            employee = random.choice(employees)
            vendor = random.choice(vendors)

            # Generate realistic amount based on vendor and category
            base_amount = vendor["avgAmount"]
            amount = max(5, base_amount + random.uniform(-0.5, 0.5) * base_amount)
            amount = round(amount, 2)

            date = (start_date + timedelta(days=random.randint(0, 30))).strftime(
                "%Y-%m-%d"
            )

            # Generate description based on category
            description = self._generate_description(vendor["category"])

            has_receipt = random.random() > 0.1  # 90% have receipts

            expenses.append(
                {
                    "id": exp_id,
                    "employeeId": employee["employeeId"],
                    "vendorId": vendor["vendorId"],
                    "category": vendor["category"],
                    "amount": amount,
                    "date": date,
                    "hasReceipt": has_receipt,
                    "description": description,
                }
            )

        return expenses

    def _generate_description(self, category: str) -> str:
        """Generate a realistic description for an expense."""
        if category == "meals":
            return random.choice(self.MEAL_DESCRIPTIONS)
        elif category == "travel":
            desc = random.choice(self.TRAVEL_DESCRIPTIONS)
            return desc.format(city=random.choice(self.CITIES))
        elif category == "entertainment":
            desc = random.choice(self.ENTERTAINMENT_DESCRIPTIONS)
            client = random.choice(self.CLIENTS)
            venue = random.choice(
                ["The Capital Grille", "Morton's", "Nobu", "Local Restaurant"]
            )
            return desc.format(client=client, venue=venue)
        elif category == "office_supplies":
            return random.choice(self.OFFICE_DESCRIPTIONS)
        elif category == "equipment":
            return random.choice(self.EQUIPMENT_DESCRIPTIONS)
        else:
            return f"{category.replace('_', ' ').title()} expense"

    def generate_ground_truth(self, expenses: List[Dict]) -> List[Dict[str, Any]]:
        """Generate ground truth evaluation data."""
        ground_truth = []

        for expense in expenses:
            # Simple heuristic for ground truth
            action = "approve"

            # Flag if amount is suspiciously high or low
            if expense["amount"] > 1000:
                action = "flag"
            elif expense["amount"] > 500 and expense["category"] in [
                "equipment",
                "software",
            ]:
                action = "flag"

            # Flag if missing receipt for high amounts
            if not expense["hasReceipt"] and expense["amount"] > 25:
                action = "clarify"

            ground_truth.append({"id": expense["id"], "expectedAction": action})

        return ground_truth

    def generate_policy(self) -> Dict[str, Any]:
        """Generate expense policy."""
        return {
            "categories": {
                "meals": {
                    "dailyLimitNoApproval": 75,
                    "receiptRequiredAbove": 25,
                },
                "travel": {
                    "receiptRequiredAbove": 25,
                    "perTripLimitNoApproval": 600,
                },
                "office_supplies": {
                    "limitNoApproval": 200,
                    "receiptRequiredAbove": 25,
                },
                "software": {
                    "limitNoApproval": 500,
                    "receiptRequiredAbove": 25,
                    "note": "Recurring subscriptions from known vendors are lower risk than one-off purchases",
                },
                "entertainment": {
                    "limitNoApproval": 150,
                    "receiptRequiredAbove": 25,
                    "note": "Requires client/attendee name in description for client entertainment",
                },
                "equipment": {
                    "limitNoApproval": 400,
                    "receiptRequiredAbove": 25,
                },
                "other": {"limitNoApproval": 100, "receiptRequiredAbove": 25},
            },
            "global": {
                "hardCeilingNoAutoApprove": 1000,
                "firstTimeVendorFlagThreshold": 300,
                "duplicateWindowDays": 3,
            },
        }


def main():
    parser = argparse.ArgumentParser(
        description="Generate synthetic expense management datasets"
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Random seed for reproducibility",
    )
    parser.add_argument(
        "--expenses",
        type=int,
        default=40,
        help=f"Number of expenses to generate (max: {DatasetGenerator.MAX_EXPENSES})",
    )
    parser.add_argument(
        "--employees",
        type=int,
        default=8,
        help=f"Number of employees to generate (max: {DatasetGenerator.MAX_EMPLOYEES})",
    )
    parser.add_argument(
        "--vendors",
        type=int,
        default=20,
        help=f"Number of vendors to generate (max: {DatasetGenerator.MAX_VENDORS})",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="./generated_data",
        help="Output directory for generated files",
    )

    args = parser.parse_args()

    # Validate limits
    if args.expenses > DatasetGenerator.MAX_EXPENSES:
        print(
            f"Warning: Expenses limited to {DatasetGenerator.MAX_EXPENSES} (requested {args.expenses})"
        )
        args.expenses = DatasetGenerator.MAX_EXPENSES

    if args.employees > DatasetGenerator.MAX_EMPLOYEES:
        print(
            f"Warning: Employees limited to {DatasetGenerator.MAX_EMPLOYEES} (requested {args.employees})"
        )
        args.employees = DatasetGenerator.MAX_EMPLOYEES

    if args.vendors > DatasetGenerator.MAX_VENDORS:
        print(
            f"Warning: Vendors limited to {DatasetGenerator.MAX_VENDORS} (requested {args.vendors})"
        )
        args.vendors = DatasetGenerator.MAX_VENDORS

    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate data
    print(f"Generating dataset with seed: {args.seed}")
    generator = DatasetGenerator(seed=args.seed)

    print(f"  - Generating {args.employees} employees...")
    employees = generator.generate_employees(args.employees)

    print(f"  - Generating {args.vendors} vendors...")
    vendors = generator.generate_vendors(args.vendors)

    print(f"  - Generating {args.expenses} expenses...")
    expenses = generator.generate_expenses(args.expenses, employees, vendors)

    print(f"  - Generating ground truth evaluation data...")
    ground_truth = generator.generate_ground_truth(expenses)

    print(f"  - Generating expense policy...")
    policy = generator.generate_policy()

    # Save files
    files = {
        "employees.json": employees,
        "vendors.json": vendors,
        "expenses.json": expenses,
        "policy.json": policy,
    }

    eval_files = {
        "ground-truth.json": ground_truth,
    }

    # Save data files
    for filename, data in files.items():
        filepath = output_dir / filename
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
        print(f"  ✓ Saved {filepath}")

    # Save eval files
    eval_dir = output_dir / "eval"
    eval_dir.mkdir(parents=True, exist_ok=True)
    for filename, data in eval_files.items():
        filepath = eval_dir / filename
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
        print(f"  ✓ Saved {filepath}")

    print(
        f"\n✓ Dataset generation complete! Files saved to: {output_dir.absolute()}"
    )
    print(f"\nDataset summary:")
    print(f"  - Employees: {len(employees)}")
    print(f"  - Vendors: {len(vendors)}")
    print(f"  - Expenses: {len(expenses)}")
    print(f"  - Total expense amount: ${sum(e['amount'] for e in expenses):.2f}")


if __name__ == "__main__":
    main()
